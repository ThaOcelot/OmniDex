import RAWGService from './RAWGService';
import GeminiCloudService from './GeminiCloudService';
import { db } from './db';

const NEWS_PROXY = 'https://api.allorigins.win/raw?url=';
const isNative = window.Capacitor?.isNativePlatform?.();
const getNewsFetchUrl = (rssUrl) => {
  return isNative ? rssUrl : `${NEWS_PROXY}${encodeURIComponent(rssUrl)}`;
};
const CACHE_VERSION = 20; // Bump per immagini personaggi via OpenVerse invece di Wikipedia

/**
 * Recupera contenuto testuale completo da Wikipedia in italiano.
 * Usato per arricchire i prompt AI con dati reali completi ed evitare riassunti tagliati.
 */
async function fetchWikipediaIt(gameTitle) {
  try {
    const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(gameTitle + ' videogioco')}&format=json&origin=*&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return '';
    const searchData = await searchRes.json();
    const firstResult = searchData?.query?.search?.[0];
    if (!firstResult) return '';

    const sectionsUrl = `https://it.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(firstResult.title)}`;
    const sectionsRes = await fetch(sectionsUrl);
    if (!sectionsRes.ok) return '';
    const sectionsData = await sectionsRes.json();
    
    if (sectionsData?.lead) {
      // Uniamo il testo della sezione principale e di tutte le sottosezioni
      let fullText = sectionsData.lead.sections[0].text;
      if (sectionsData.remaining?.sections) {
        fullText += ' ' + sectionsData.remaining.sections.map(s => s.text).join(' ');
      }
      // Puliamo il codice HTML per estrarre solo il testo pulito
      fullText = fullText.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
      return fullText;
    }
    return '';
  } catch {
    return '';
  }
}


class GameService {

  /**
   * Ricerca giochi — ritorna lista con info base per le card
   */
  async searchGames(query) {
    const results = await RAWGService.searchGames(query);
    return results.map(g => ({
      id: g.id,
      title: g.name,
      slug: g.slug,
      cover: g.background_image,
      rating: g.rating,
      year: g.released ? new Date(g.released).getFullYear() : "N/D",
      platforms: g.platforms?.map(p => p.platform.name) || [],
      genre: g.genres?.[0]?.name || "Videogioco",
      metacritic: g.metacritic,
      added: g.added || 0
    }));
  }

  /**
   * Dettagli completi del gioco con traduzione AI in italiano
   */
  async getGameDetails(gameId, gameTitle) {
    const identifier = gameId || gameTitle?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    if (!identifier) return null;

    // 1. Check Cache
    const cacheKey = `game_v${CACHE_VERSION}_${identifier}`;
    const cached = await db.getGame(cacheKey);
    if (cached && cached._version === CACHE_VERSION) {
      console.log("📦 Cache hit:", identifier);
      return cached;
    }

    // 2. Fetch RAWG + Wikipedia in parallelo
    console.log("📡 Fetching RAWG + Wikipedia per:", identifier);
    const [rawg, wikiContent] = await Promise.all([
      RAWGService.getGameDetails(identifier),
      fetchWikipediaIt(gameTitle || String(identifier))
    ]);
    if (!rawg) return null;

    if (wikiContent) console.log("📖 Wikipedia trovata per:", rawg.title);

    const tagNames = rawg.tags?.map(t => t.name).slice(0, 15) || [];
    const platformNames = rawg.platforms?.map(p => p.name) || [];
    const genreNames = rawg.genres || [];

    // 3. Giochi consigliati per genere (endpoint /suggested richiede pagamento)
    const genresStr = rawg.genres?.map(g => {
      // genres in RAWG sono stringhe qui, ma RAWGService ritorna già i nomi
      return g;
    }).join(',') || '';

    let suggested = [];
    try {
      // Usiamo gli slug dai tags originali
      const rawgFull = await RAWGService.get('/games', {
        genres: rawg.tags?.filter(t => ['action', 'rpg', 'shooter', 'adventure', 'puzzle',
          'strategy', 'simulation', 'sports', 'racing', 'fighting', 'platformer']
          .some(g => t.slug?.includes(g)))
          .slice(0, 3).map(t => t.slug).join(',') || '',
        page_size: 10,
        ordering: '-rating'
      });
      suggested = rawgFull?.results?.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        released: s.released,
        cover: s.background_image,
        metacritic: s.metacritic,
        rating: s.rating
      })).filter(s => s.id !== rawg.id) || [];
    } catch (e) {
      console.warn("Impossibile caricare giochi consigliati:", e);
    }

    // Fallback generi per suggeriti
    if (suggested.length === 0 && genreNames.length > 0) {
      try {
        const similarData = await RAWGService.get('/games', {
          genres: genreNames.slice(0, 2).join(','),
          page_size: 10,
          ordering: '-rating'
        });
        suggested = similarData?.results?.map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          released: s.released,
          cover: s.background_image,
          metacritic: s.metacritic,
          rating: s.rating
        })).filter(s => s.id !== rawg.id) || [];
      } catch { /* ignore */ }
    }

    // 4. Generazione contenuti AI in italiano
    let descriptionIt = null, plot = null, gameplay = null, characters = [], trivia = [];

    if (GeminiCloudService.isAvailable()) {
      console.log("🤖 Generazione AI per:", rawg.title);
      try {
        // Le chiamate devono essere sequenziali per non attivare il limite di concorrenza 
        // (HTTP 429 Too Many Requests) del piano gratuito di Gemini.
        descriptionIt = await GeminiCloudService.translateDescription(rawg.descriptionRaw);
        plot = await GeminiCloudService.generatePlot(rawg.title, rawg.descriptionRaw, genreNames, tagNames, wikiContent);
        gameplay = await GeminiCloudService.generateGameplay(rawg.title, genreNames, tagNames, platformNames);
        characters = await GeminiCloudService.generateCharacters(rawg.title, rawg.descriptionRaw, wikiContent);
        
        trivia = await GeminiCloudService.generateTrivia(rawg.title, rawg.descriptionRaw);
      } catch (e) {
        console.warn("🤖 AI generation partial failure:", e);
      }
    }

    // 5. Componi il risultato finale
    const finalData = {
      ...rawg,
      suggested,
      // MAPPING DEFINITIVO:
      // description = trama narrativa AI (generata da Gemini + Wikipedia) → va nella TAB "Trama"
      // plot        = descrizione ufficiale tradotta (da RAWG, panoramica del gioco) → appare nell'HEADER hero
      description: plot || wikiContent || '',          // trama AI → tab Trama
      plot: descriptionIt || rawg.descriptionRaw || '', // panoramica RAWG → hero header
      gameplay: gameplay || '',
      protagonists: characters || [],
      trivia: trivia || [],
      // Metadata
      _version: CACHE_VERSION,
      _cached: Date.now(),
      _aiGenerated: GeminiCloudService.isAvailable(),
      _wikiUsed: !!wikiContent,
    };

    // 6. Salva in cache
    await db.setGame(cacheKey, finalData);
    console.log("✅ Dati completi pronti per:", rawg.title);
    return finalData;
  }

  /**
   * Fetch notizie reali da Google News RSS in italiano
   */
  async getGameNews(gameTitle) {
    if (!gameTitle) return [];

    const cacheKey = `news_v5_${gameTitle}`; // Bump della cache per includere anche i video e trailer ufficiali recenti
    const cached = await db.getNews(cacheKey);
    // Cache news per 2 ore
    if (cached?.content && cached.timestamp && (Date.now() - cached.timestamp < 7200000)) {
      return cached.content;
    }

    try {
      // Usiamo le virgolette per il titolo e includiamo ricerche per video ufficiali, trailer o gameplay
      const baseQuery = `"${gameTitle}" (videogioco OR video OR trailer OR gameplay)`;
      // Cerca prima le notizie dell'ultimo mese (ultimi 30 giorni)
      let searchQuery = `${baseQuery} when:30d`;
      let rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`;
      let fetchUrl = getNewsFetchUrl(rssUrl);

      let res = await fetch(fetchUrl);
      let text = '';
      let items = [];

      if (res.ok) {
        text = await res.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        items = Array.from(xmlDoc.querySelectorAll("item"));
      }

      // Se non ci sono notizie negli ultimi 30 giorni, togli il filtro temporale per evitare un tab vuoto
      if (items.length === 0) {
        console.log(`ℹ️ Nessuna notizia dell'ultimo mese per "${gameTitle}". Ripiego sulla ricerca generica.`);
        searchQuery = baseQuery;
        rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`;
        fetchUrl = getNewsFetchUrl(rssUrl);
        res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);
        text = await res.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        items = Array.from(xmlDoc.querySelectorAll("item"));
      }

      const news = items.slice(0, 8).map(item => {
        const pubDateText = item.querySelector("pubDate")?.textContent;
        const source = item.querySelector("source")?.textContent || "Web";
        const rawTitle = item.querySelector("title")?.textContent || "";
        
        // Rimuovi la ripetizione della fonte in fondo al titolo (es. "titolo - Multiplayer.it")
        let cleanTitle = rawTitle;
        if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          if (parts[parts.length - 1].toLowerCase().includes(source.toLowerCase()) || source.toLowerCase().includes(parts[parts.length - 1].toLowerCase())) {
            parts.pop();
            cleanTitle = parts.join(" - ");
          }
        }

        return {
          title: cleanTitle,
          url: item.querySelector("link")?.textContent || "",
          source: source,
          rawDate: pubDateText ? new Date(pubDateText).getTime() : 0,
          date: (() => {
            try {
              return new Date(pubDateText).toLocaleDateString('it-IT', {
                day: 'numeric', month: 'long', year: 'numeric'
              });
            } catch { return ''; }
          })(),
          summary: null
        };
      });

      // Ordina dalla più recente alla più vecchia
      news.sort((a, b) => b.rawDate - a.rawDate);

      await db.setNews(cacheKey, news);
      return news;
    } catch (e) {
      console.warn("📰 News fetch failed:", e);
      return [];
    }
  }

  /**
   * Genera riassunto notizia in italiano
   */
  async summarizeNews(title, url) {
    if (!GeminiCloudService.isAvailable()) {
      return { summary: title };
    }
    const summary = await GeminiCloudService.summarizeNews(title, url);
    return { summary: summary || title };
  }

  /**
   * Deep dive su un personaggio
   */
  async getCharacterDeepDive(gameTitle, characterName) {
    if (!GeminiCloudService.isAvailable()) {
      return { name: characterName, description: "Servizio AI non disponibile." };
    }

    try {
      const text = await GeminiCloudService.generateCharacterDeepDive(gameTitle, characterName);
      return { name: characterName, description: text || "Dettagli non disponibili." };
    } catch (e) {
      console.warn("Character deep dive failed:", e);
      return { name: characterName, description: "Errore nel caricamento dei dettagli." };
    }
  }

  /**
   * Trivia & Easter Egg on-demand per il tab Trivia.
   * Restituisce i trivia dalla cache del gioco se disponibili,
   * altrimenti li genera al volo con l'AI.
   */
  async getGameTrivia(gameTitle) {
    if (!GeminiCloudService.isAvailable()) {
      return [{ fact: 'Il servizio AI non è disponibile. Controlla la connessione.' }];
    }
    try {
      const raw = await GeminiCloudService.generateTrivia(gameTitle, '');
      if (!Array.isArray(raw) || raw.length === 0) {
        return [{ fact: 'Nessun trivia disponibile per questo titolo.' }];
      }
      // generateTrivia ritorna stringhe — le mappiamo in { fact }
      return raw.map(item => typeof item === 'string' ? { fact: item } : item);
    } catch (e) {
      console.warn('Trivia generation failed:', e);
      return [{ fact: 'Impossibile generare i trivia al momento.' }];
    }
  }

  async setModelInstalled() { }
}

export default new GameService();
