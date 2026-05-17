import RAWGService from './RAWGService';
import GeminiCloudService from './GeminiCloudService';
import { db } from './db';

const NEWS_PROXY = 'https://api.allorigins.win/raw?url=';
const CACHE_VERSION = 12; // Bump per forzare il recupero tramite il modello stabile gemini-flash-latest

/**
 * Recupera contenuto testuale da Wikipedia in italiano.
 * Usato per arricchire i prompt AI con dati reali verificati.
 */
async function fetchWikipediaIt(gameTitle) {
  try {
    const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(gameTitle + ' videogioco')}&format=json&origin=*&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return '';
    const searchData = await searchRes.json();
    const firstResult = searchData?.query?.search?.[0];
    if (!firstResult) return '';

    const summaryUrl = `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return '';
    const summaryData = await summaryRes.json();
    return summaryData?.extract || '';
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
      // Contenuti tradotti/generati in italiano
      description: plot || wikiContent || descriptionIt || rawg.descriptionRaw || '',
      plot: descriptionIt || rawg.descriptionRaw || '',
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

    const cacheKey = `news_v2_${gameTitle}`;
    const cached = await db.getNews(cacheKey);
    // Cache news per 2 ore
    if (cached?.content && cached.timestamp && (Date.now() - cached.timestamp < 7200000)) {
      return cached.content;
    }

    try {
      const searchQuery = `${gameTitle} videogioco`;
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`;
      const proxyUrl = `${NEWS_PROXY}${encodeURIComponent(rssUrl)}`;

      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);

      const text = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const items = Array.from(xmlDoc.querySelectorAll("item")).slice(0, 8);

      const news = items.map(item => {
        const pubDateText = item.querySelector("pubDate")?.textContent;
        return {
          title: item.querySelector("title")?.textContent || "",
          url: item.querySelector("link")?.textContent || "",
          source: item.querySelector("source")?.textContent || "Web",
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

  async setModelInstalled() { }
}

export default new GameService();
