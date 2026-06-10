import RAWGService from './RAWGService';
import GeminiCloudService from './GeminiCloudService';
import IAPService from './IAPService';
import FirebaseService from './FirebaseService';
import { db } from './db';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const algoliaClient = algoliasearch('TXFAPWRDB1', 'ccce008e6d7ef0ef672dc4251ed98ca5');
const isNative = window.Capacitor?.isNativePlatform?.();

const CACHE_VERSION = 22; // Bump per Wikipedia strutturato come fallback per plot/gameplay/personaggi

/**
 * Rileva se un testo è in inglese (non italiano).
 * Usa token esclusivamente italiani come segnale.
 */
function isEnglishText(text) {
  if (!text || text.length < 30) return false;
  const italianTokens = /\b(degli|delle|dello|nell|nella|nelle|negli|dall|dalla|agli|alla|questo|questa|quello|quella|viene|vengono|sono|hanno|anche|però|perché|quindi|mentre|quando|dove|spesso|invece|ancora|sempre|ogni|molto|senza|durante|insieme|nonostante|qualsiasi|nessuno|qualcosa)\b/gi;
  const matches = (text.match(italianTokens) || []).length;
  return matches < 3; // se meno di 3 parole inequivocabilmente italiane, è inglese
}

/**
 * Recupera contenuto testuale completo da Wikipedia in italiano, organizzato per sezioni.
 * Restituisce { raw, plot, gameplay, characters } per essere usato direttamente come fallback.
 */
async function fetchWikipediaIt(gameTitle) {
  try {
    const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(gameTitle + ' videogioco')}&format=json&origin=*&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return { raw: '', plot: '', gameplay: '', characters: [] };
    const searchData = await searchRes.json();
    const firstResult = searchData?.query?.search?.[0];
    if (!firstResult) return { raw: '', plot: '', gameplay: '', characters: [] };

    const sectionsUrl = `https://it.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(firstResult.title)}`;
    const sectionsRes = await fetch(sectionsUrl);
    if (!sectionsRes.ok) return { raw: '', plot: '', gameplay: '', characters: [] };
    const sectionsData = await sectionsRes.json();

    const cleanHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();

    let raw = '';
    let plot = '';
    let gameplay = '';
    let characters = [];

    if (sectionsData?.lead) {
      // Intro/lead sempre usato come testo grezzo
      raw = cleanHtml(sectionsData.lead.sections?.[0]?.text || '');

      const sections = sectionsData.remaining?.sections || [];
      for (const section of sections) {
        const title = (section.title || '').toLowerCase();
        const text = cleanHtml(section.text || '');
        if (!text) continue;
        raw += ' ' + text;

        // Sezioni trama
        if (!plot && /trama|storia|narrazione|sinossi|storyline/.test(title)) {
          plot = text.substring(0, 3000);
        }
        // Sezioni gameplay
        if (!gameplay && /gameplay|giocabilità|meccaniche|sistema di gioco/.test(title)) {
          gameplay = text.substring(0, 2000);
        }
        // Sezioni personaggi
        if (characters.length === 0 && /personagg|cast|character/.test(title)) {
          // Estrai nomi da liste: pattern "Nome (ruolo) – descrizione" o "Nome: descrizione"
          const lines = text.split(/[.;]/).map(l => l.trim()).filter(l => l.length > 20 && l.length < 300);
          characters = lines.slice(0, 8).map((line, i) => {
            const colonIdx = line.indexOf(':');
            const dashIdx = line.indexOf(' –');
            const sepIdx = colonIdx > 0 && colonIdx < 40 ? colonIdx : dashIdx > 0 && dashIdx < 40 ? dashIdx : -1;
            if (sepIdx > 0) {
              return { name: line.substring(0, sepIdx).replace(/[\d.\-*•]+/, '').trim(), role: 'Personaggio', description: line.substring(sepIdx + 1).trim() };
            }
            return null;
          }).filter(Boolean);
        }
      }

      raw = raw.replace(/\s\s+/g, ' ').trim();

      // Se nessuna sezione trama trovata, usa l'intro di Wikipedia come plot
      if (!plot && raw) {
        plot = raw.substring(0, 2500);
      }
    }

    return { raw, plot, gameplay, characters };
  } catch {
    return { raw: '', plot: '', gameplay: '', characters: [] };
  }
}



class GameService {

  /**
   * Ricerca giochi — ritorna lista con info base per le card
   */
  async searchGames(query) {
    let algoliaHits = [];
    try {
      const response = await algoliaClient.search({
        requests: [{ indexName: 'omnidex_games', query }]
      });
      algoliaHits = response.results[0]?.hits || [];
    } catch (e) {
      console.warn("Algolia search fallita (forse l'indice non esiste ancora), fallback su RAWG:", e);
    }

    const rawgPromise = RAWGService.searchGames(query);
    const rawgResults = await rawgPromise;

    const formattedAlgolia = algoliaHits.map(h => ({
      id: parseInt(h.objectID),
      title: h.title,
      slug: h.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
      cover: h.cover || null,
      rating: h.rating || 0,
      year: h.releaseDate ? new Date(h.releaseDate).getFullYear() : "N/D",
      platforms: [], // Omettiamo le piattaforme, non vitali per le card di ricerca
      genre: h.genres?.[0] || "Videogioco",
      metacritic: 0,
      added: 0,
      _fromAlgolia: true
    }));

    const formattedRawg = rawgResults.map(g => ({
      id: g.id,
      title: g.name,
      slug: g.slug,
      cover: g.background_image,
      rating: g.rating,
      year: g.released ? new Date(g.released).getFullYear() : "N/D",
      platforms: g.parent_platforms?.map(p => p.platform.name) || g.platforms?.map(p => p.platform.name) || [],
      genre: g.genres?.[0]?.name || "Videogioco",
      metacritic: g.metacritic,
      added: g.added || 0,
      _fromAlgolia: false
    }));

    // Merge: Mettiamo prima i risultati Algolia (che supportano typo e sono in DB), poi RAWG. Evitiamo doppioni.
    const merged = [...formattedAlgolia];
    for (const rg of formattedRawg) {
      if (!merged.find(m => m.id === rg.id)) {
        merged.push(rg);
      }
    }

    // Se un gioco trovato su Algolia non ha la cover nel nostro DB storico, proviamo a recuperarla dai risultati live di RAWG
    for (const m of merged) {
      if (m._fromAlgolia && !m.cover) {
        const matchingRawg = formattedRawg.find(r => r.id === m.id);
        if (matchingRawg && matchingRawg.cover) {
          m.cover = matchingRawg.cover;
        }
      }
    }

    return merged;
  }

  /**
   * Dettagli completi del gioco con traduzione AI in italiano
   */
  async getGameDetails(gameId, gameTitle, forceRegenerate = false) {
    const identifier = gameId || gameTitle?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    if (!identifier) return null;

    // 1. Check Cache Locale (IndexedDB)
    const cacheKey = `game_v${CACHE_VERSION}_${identifier}`;
    const cached = await db.getGame(cacheKey);
    if (!forceRegenerate && cached && cached._version === CACHE_VERSION && !cached._isRaw) {
      console.log("📦 Cache hit locale:", identifier);
      return cached;
    }

    // 2. Controlla la cache globale di Firestore prima di chiamare RAWG
    let firestoreCache = null;
    let rawg = null;
    
    if (gameId) {
      firestoreCache = await FirebaseService.getGameFromCache(gameId);
    }
    
    // Se il gioco è già in Firestore (anche grezzo), ed ha i dati RAWG salvati in esso
    if (firestoreCache && (firestoreCache._isRaw || firestoreCache.screenshots)) {
      rawg = firestoreCache;
      console.log("☁️ Caricato dati RAWG grezzi da Firestore Global Cache per:", rawg.title || rawg.name);
    } else {
      // Fallback: Fetch RAWG live
      console.log("📡 Fetching RAWG per ID/Slug:", identifier);
      rawg = await RAWGService.getGameDetails(identifier);
    }

    if (!rawg) {
      // Nessun risultato RAWG: proviamo a costruire una scheda minima da Wikipedia
      console.log(`⚠️ RAWG non ha trovato "${identifier}". Provo Wikipedia...`);
      const wikiData = await fetchWikipediaIt(gameTitle || String(identifier));
      if (!wikiData.raw) return null;
      // Costruiamo un oggetto minimale dal titolo + Wikipedia
      const wikiTitleRes = await fetch(`https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent((gameTitle || '') + ' videogioco')}&format=json&origin=*&srlimit=1`);
      const wikiTitleData = await wikiTitleRes.json().catch(() => ({}));
      const wikiGameTitle = wikiTitleData?.query?.search?.[0]?.title || gameTitle || String(identifier);
      // Traduci via Firebase il testo wikipedia
      let plotIt = '';
      let gameplayIt = '';
      try { plotIt = await GeminiCloudService.translateDescription(wikiData.plot || wikiData.raw.substring(0, 2000)); } catch { plotIt = wikiData.plot || ''; }
      try { if (wikiData.gameplay) gameplayIt = await GeminiCloudService.translateDescription(wikiData.gameplay); } catch { gameplayIt = wikiData.gameplay || ''; }
      const wikiOnlyData = {
        id: null,
        title: gameTitle || wikiGameTitle,
        slug: identifier,
        descriptionRaw: wikiData.raw.substring(0, 2000),
        plot: plotIt || wikiData.plot || '',
        description: plotIt || wikiData.plot || '',
        gameplay: gameplayIt || wikiData.gameplay || '',
        protagonists: wikiData.characters || [],
        trivia: [],
        cover: null,
        background_image: null,
        rating: 0,
        genres: [],
        platforms: [],
        tags: [],
        suggested: [],
        _version: CACHE_VERSION,
        _cached: Date.now(),
        _aiGenerated: false,
        _wikiUsed: true,
        _aiLimitReached: false,
        _isRaw: false,
        _wikiOnly: true, // flag: dati solo da Wikipedia
      };
      console.log('✅ Scheda minima da Wikipedia costruita per:', gameTitle);
      return wikiOnlyData;
    }

    const tagNames = rawg.tags?.map(t => t.name).slice(0, 15) || [];
    const platformNames = rawg.platforms?.map(p => p.name) || [];
    const genreNames = rawg.genres || [];

    // 3. Esegui in parallelo il fetch dei Suggested Games
    const fetchSuggested = async () => {
      let suggested = [];
      try {
        const rawgFull = await RAWGService.get('/games', {
          genres: rawg.tags?.filter(t => ['action', 'rpg', 'shooter', 'adventure', 'puzzle',
            'strategy', 'simulation', 'sports', 'racing', 'fighting', 'platformer']
            .some(g => t.slug?.includes(g)))
            .slice(0, 3).map(t => t.slug).join(',') || '',
          page_size: 10,
          ordering: '-rating'
        });
        suggested = rawgFull?.results?.map(s => ({
          id: s.id, name: s.name, slug: s.slug, released: s.released,
          cover: s.background_image, metacritic: s.metacritic, rating: s.rating
        })).filter(s => s.id !== rawg.id) || [];
      } catch (e) {
        console.warn("Impossibile caricare giochi consigliati:", e);
      }
      if (suggested.length === 0 && genreNames.length > 0) {
        try {
          const similarData = await RAWGService.get('/games', { genres: genreNames.slice(0, 2).join(','), page_size: 10, ordering: '-rating' });
          suggested = similarData?.results?.map(s => ({
            id: s.id, name: s.name, slug: s.slug, released: s.released,
            cover: s.background_image, metacritic: s.metacritic, rating: s.rating
          })).filter(s => s.id !== rawg.id) || [];
        } catch { /* ignore */ }
      }
      return suggested;
    };

    let getDbCachePromise = Promise.resolve(firestoreCache);
    if (!firestoreCache) {
      getDbCachePromise = FirebaseService.getGameFromCache(rawg.id);
    }

    const [retrievedCache, suggested] = await Promise.all([
      getDbCachePromise,
      fetchSuggested()
    ]);
    
    firestoreCache = retrievedCache;

    const firestoreHasContent = firestoreCache && !firestoreCache._isRaw && (firestoreCache.description || firestoreCache.plot || firestoreCache.gameplay);

    const currentTier = IAPService.getTier();
    const cachedTier = firestoreCache?._generatedByTier || 'free';
    const isUltraUser = currentTier === 'ultra';
    // Cache considerata inglese se il plot sembra in inglese (rilevamento robusto)
    const cachedPlot = firestoreCache?.plot || firestoreCache?.description || '';
    const isEnglishCache = firestoreHasContent && (cachedPlot === rawg?.descriptionRaw || isEnglishText(cachedPlot));

    const cacheNeedsUpgrade = firestoreHasContent && ((isUltraUser && cachedTier !== 'ultra') || isEnglishCache);

    if (!forceRegenerate && firestoreHasContent && !cacheNeedsUpgrade) {
      // Anche dalla cache, se il plot sembra inglese lo ritraduco on-the-fly
      let cachedPlotFinal = firestoreCache.plot || firestoreCache.translations?.it || firestoreCache.translated?.it || '';
      if (isEnglishText(cachedPlotFinal) && rawg?.descriptionRaw) {
        console.log('🔤 Plot dalla cache in inglese, ritraduco on-the-fly...');
        try { cachedPlotFinal = await GeminiCloudService.translateDescription(rawg.descriptionRaw) || cachedPlotFinal; } catch { /* mantieni inglese */ }
      }
      const finalData = {
        ...rawg,
        suggested,
        description: firestoreCache.description || '',
        plot: cachedPlotFinal,
        gameplay: firestoreCache.gameplay || '',
        protagonists: firestoreCache.protagonists || [],
        trivia: firestoreCache.trivia || [],
        _version: CACHE_VERSION,
        _cached: Date.now(),
        _aiGenerated: true,
        _wikiUsed: firestoreCache._wikiUsed || false,
        _aiLimitReached: false,
        _fromGlobalCache: true,
        _isRaw: false
      };
      await db.setGame(cacheKey, finalData);
      console.log("☁️ Usato cache Firestore globale per:", rawg.title);
      return finalData;
    }

    if (cacheNeedsUpgrade) {
      console.log(`⬆️ Ultra upgrade: rigenero i testi di "${rawg.title}" (cache precedente generata da tier: ${cachedTier})`);
    }

    // 4. Se serve l'AI, fetchiamo Wikipedia e parallelizziamo le richieste Gemini
    console.log("📖 Fetching Wikipedia e invocando Gemini...");
    const wikiData = await fetchWikipediaIt(gameTitle || String(identifier));
    const wikiContent = wikiData.raw; // testo grezzo usato nei prompt AI
    
    let descriptionIt = firestoreCache?.translated?.it || firestoreCache?.translations?.it || null;
    let plot = null, gameplay = null, characters = [], trivia = [];
    let aiLimitReached = false;

    if (GeminiCloudService.isAvailable()) {
      if (IAPService.hasReachedAiLimit()) {
        console.warn("🤖 AI Limit Reached! Skipping generation for free tier.");
        aiLimitReached = true;
      } else {
        console.log("🤖 Generazione AI parallela per:", rawg.title);
        
        const tasks = [];
        
        // La traduzione base viene fatta separatamente, vedi sotto.
        
        // La trama non viene più generata da zero, ma viene tradotta la descrizione RAWG (vedi sotto)
        // Gemini viene usato solo per generare da zero Personaggi, Trivia e Gameplay.
        tasks.push(
          GeminiCloudService.generateGameplay(rawg.title, genreNames, tagNames, platformNames)
            .then(res => { gameplay = res; })
            .catch(e => console.warn('AI gameplay error:', e))
        );
        tasks.push(
          GeminiCloudService.generateCharacters(rawg.title, rawg.descriptionRaw, wikiContent)
            .then(res => { characters = res; })
            .catch(e => console.warn('AI characters error:', e))
        );
        tasks.push(
          GeminiCloudService.generateTrivia(rawg.title, rawg.descriptionRaw)
            .then(res => { trivia = res; })
            .catch(e => console.warn("AI trivia error:", e))
        );

        await Promise.allSettled(tasks);

        if (descriptionIt || gameplay) {
          IAPService.incrementDailyAiCount();
        }
      }
    }

    // La traduzione base è ora gestita interamente dall'Estensione Firebase (Translate Text).
    // Pertanto, lato client non forziamo più la chiamata a Gemini per tradurre descriptionRaw o Wikipedia.
    // L'utente vedrà la lingua originale al primissimo caricamento, e l'italiano ai successivi (dopo che l'estensione ha agito).
    
    let wikiPlotIt = '';
    let wikiGameplayIt = '';

    // 5. Componi il risultato finale
    // Per plot/descrizione, priorità: AI → Wikipedia tradotto → RAWG raw
    const finalPlot = descriptionIt || wikiPlotIt || wikiData.plot || rawg.descriptionRaw || (aiLimitReached ? 'Panoramica non disponibile in italiano. Hai raggiunto il limite di richieste giornaliere.' : 'La panoramica non è al momento disponibile.');

    // Per gameplay, fallback su Wikipedia tradotto se AI non ha prodotto nulla
    const finalGameplay = gameplay || wikiGameplayIt || wikiData.gameplay || 'Dati del gameplay non disponibili.';

    // Per personaggi, fallback su Wikipedia se AI non ha prodotto nulla
    const finalCharacters = (characters && characters.length > 0) ? characters
      : (wikiData.characters && wikiData.characters.length > 0) ? wikiData.characters
      : [];

    const finalData = {
      ...rawg,
      suggested,
      description: descriptionIt || wikiPlotIt || wikiData.plot || rawg.descriptionRaw || 'Dati della trama non disponibili.',
      plot: finalPlot,
      gameplay: finalGameplay,
      protagonists: finalCharacters,
      trivia: trivia || [],
      _version: CACHE_VERSION,
      _cached: Date.now(),
      _aiGenerated: GeminiCloudService.isAvailable() && !aiLimitReached && !!plot && !!gameplay && !!descriptionIt,
      _wikiUsed: !!wikiContent,
      _aiLimitReached: aiLimitReached,
      _isRaw: false
    };

    // 6. Salva in cache LOCALE
    await db.setGame(cacheKey, finalData);
    
    // 7. Salva in cache GLOBALE (Firestore)
    // Salviamo sempre in Firestore se abbiamo i dati minimi. Così facendo, l'estensione Translate Text 
    // individuerà il campo 'descriptionRaw' appena scritto e lo tradurrà in background in 'translations.it'
    if (rawg && rawg.title) {
      const firestorePayload = {
        ...rawg,
        _aiGenerated: GeminiCloudService.isAvailable() && !aiLimitReached,
        _wikiUsed: !!wikiContent,
        _generatedByTier: IAPService.getTier(),
        description: plot || '',
        plot: finalPlot || '',
        gameplay: finalGameplay || '',
        protagonists: characters || [],
        trivia: trivia || [],
        title: rawg.title || '',
        cover: rawg.background_image || '',
        genres: rawg.genres || [],
        rating: rawg.rating || 0,
        releaseDate: rawg.releaseDate || '',
        _isRaw: false
      };
      FirebaseService.saveGameToCache(rawg.id, firestorePayload);
      if (cacheNeedsUpgrade) {
        console.log(`✅ Cache Firestore aggiornata con contenuti Ultra per: ${rawg.title}`);
      }
    }
    
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

    // Helper: fetch con timeout di 10 secondi per evitare attese infinite su mobile
    const fetchWithTimeout = (url, timeoutMs = 10000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
    };

    try {
      const fetchRss = async (url) => {
        const proxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
          `https://corsproxy.io/?${encodeURIComponent(url)}`
        ];
        for (const proxy of proxies) {
          try {
            const res = await fetchWithTimeout(proxy);
            if (res.ok) {
              const text = await res.text();
              if (text && text.includes('<rss')) return text;
            }
          } catch(e) { /* ignore and try next */ }
        }
        return '';
      };

      const baseQuery = `"${gameTitle}" (videogioco OR video OR trailer OR gameplay)`;
      let searchQuery = `${baseQuery} when:30d`;
      let rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`;
      
      let text = await fetchRss(rssUrl);
      let items = [];

      if (text) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        items = Array.from(xmlDoc.querySelectorAll("item"));
      }

      if (items.length === 0) {
        console.log(`ℹ️ Nessuna notizia dell'ultimo mese per "${gameTitle}". Ripiego sulla ricerca generica.`);
        searchQuery = baseQuery;
        rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=it&gl=IT&ceid=IT:it`;
        text = await fetchRss(rssUrl);
        if (!text) throw new Error(`News fetch failed via tutti i proxy`);
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
      const isTimeout = e.name === 'AbortError';
      console.warn(isTimeout ? "📰 News fetch timeout (>10s)" : "📰 News fetch failed:", e);
      // Se abbiamo dati in cache (anche scaduti), li mostriamo comunque invece di un tab vuoto
      if (cached?.content?.length > 0) {
        console.log("📰 Usando cache scaduta come fallback per:", gameTitle);
        return cached.content;
      }
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
    return { summary: summary || "Impossibile generare il riassunto al momento. Riprova più tardi." };
  }

  /**
   * Deep dive su un personaggio
   */
  async getCharacterDeepDive(gameTitle, characterName) {
    // 1. Controllo cache globale
    const globalCache = await FirebaseService.getCharacterDeepDive(gameTitle, characterName);
    if (globalCache) {
      return globalCache;
    }

    if (!GeminiCloudService.isAvailable()) {
      return { name: characterName, description: "Dettagli non disponibili al momento." };
    }

    // Se stiamo per usare l'AI, consumiamo un gettone limitato se free
    if (IAPService.hasReachedAiLimit()) {
      throw new Error("Hai raggiunto il limite giornaliero di richieste gratuite. Passa a Ultra per richieste illimitate.");
    }
    IAPService.incrementDailyAiCount();

    try {
      const text = await GeminiCloudService.generateCharacterDeepDive(gameTitle, characterName);
      
      // 2. Salvataggio in cache globale se successo
      if (text) {
        FirebaseService.saveCharacterDeepDive(gameTitle, characterName, { name: characterName, description: text });
      }
      
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
      return [{ fact: 'Curiosità non disponibili al momento. Controlla la connessione.' }];
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

  /**
   * Ricerca Conversazionale AI (Sommelier)
   */
  async searchGamesAI(query) {
    if (!GeminiCloudService.isAvailable()) {
      throw new Error("Ricerca conversazionale non disponibile al momento. Usa la ricerca normale.");
    }
    const aiResults = await GeminiCloudService.recommendGames(query);
    if (!aiResults || aiResults.length === 0) {
      return [];
    }

    // Cerchiamo le copertine su RAWG per ogni titolo
    const fullResults = await Promise.all(aiResults.map(async (aiItem) => {
      try {
        const rawgSearch = await RAWGService.searchGames(aiItem.title);
        // Prendi il primo risultato da RAWG che corrisponde
        const g = rawgSearch[0];
        if (g) {
          return {
            id: g.id,
            title: g.name,
            slug: g.slug,
            cover: g.background_image,
            rating: g.rating,
            released: g.released,
            platforms: g.platforms?.map(p => p.platform.name) || [],
            aiReason: aiItem.reason // Aggiungiamo la motivazione AI
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    }));
    return fullResults.filter(Boolean);
  }

  async analyzeCompatibility(gameTitle, gameDescription) {
    if (!GeminiCloudService.isAvailable()) return { score: 50, reason: "Analisi di compatibilità non disponibile al momento." };
    const userFavorites = await db.getFavorites();
    if (userFavorites.length < 3) {
      return { score: 50, reason: "Aggiungi almeno 3 giochi ai tuoi preferiti per sbloccare l'analisi." };
    }
    return await GeminiCloudService.analyzeCompatibility(gameTitle, gameDescription, userFavorites);
  }

  /**
   * Riassunto precedenti
   */
  async summarizePreviousGames(gameTitle) {
    if (!GeminiCloudService.isAvailable()) return "Riassunto non disponibile al momento.";
    return await GeminiCloudService.summarizePreviousGames(gameTitle);
  }

  /**
   * Pre-fetch in background per i giochi del Release Radar
   */
  async preFetchUpcomingGames(upcomingGames) {
    if (!upcomingGames || upcomingGames.length === 0) return;
    
    try {
      const gameIds = upcomingGames.map(g => g.id);
      
      // 1. Batch check su quali ID sono già presenti in Firestore
      const existingIds = await FirebaseService.checkGamesExistInFirestore(gameIds);
      
      // 2. Filtra quelli non presenti in Firestore
      const missingGames = upcomingGames.filter(g => !existingIds.has(g.id));
      console.log(`🔍 Pre-fetch Release Radar: ${missingGames.length} su ${upcomingGames.length} giochi mancanti in Firestore.`);
      
      if (missingGames.length === 0) return;
      
      // 3. Esegui il pre-fetch in modo sequenziale per non saturare le API
      // Limite di max 8 giochi per sessione per non abusare della chiave API
      const limit = Math.min(missingGames.length, 8);
      
      for (let i = 0; i < limit; i++) {
        const game = missingGames[i];
        
        // Attendi 3 secondi tra una chiamata e l'altra (tranne la prima che ha un ritardo minimo)
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 500 : 3000));
        
        console.log(`📥 Pre-fetching dati grezzi per: ${game.name} (ID: ${game.id})`);
        
        try {
          // Recupera i dettagli completi RAWG (compreso media, publisher, developer, ecc.)
          const rawgDetails = await RAWGService.getGameDetails(game.id);
          if (rawgDetails) {
            // Salva come gioco raw in Firestore cache
            const rawPayload = {
              ...rawgDetails,
              _isRaw: true,
              _aiGenerated: false,
              _generatedByTier: 'raw',
              description: '',
              plot: '',
              gameplay: '',
              protagonists: [],
              trivia: []
            };
            await FirebaseService.saveGameToCache(game.id, rawPayload);
            console.log(`✅ Pre-fetch completato e salvato per: ${game.name}`);
          }
        } catch (err) {
          console.warn(`⚠️ Pre-fetch fallito per ${game.name}:`, err);
        }
      }
    } catch (e) {
      console.warn("⚠️ Errore durante il pre-fetch dei giochi in arrivo:", e);
    }
  }
}

export default new GameService();
