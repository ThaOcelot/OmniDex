import RAWGService from './RAWGService';
import GeminiCloudService from './GeminiCloudService';
import { db } from './db';

const NEWS_PROXY = 'https://api.allorigins.win/raw?url=';

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
    const cacheKey = `game_v6_${identifier}`;
    const cached = await db.getGame(cacheKey);
    if (cached && cached._version === 6) {
      console.log("📦 Cache hit:", identifier);
      return cached;
    }

    // 2. Fetch RAWG (tutti gli endpoint in parallelo)
    console.log("📡 Fetching RAWG per:", identifier);
    const rawg = await RAWGService.getGameDetails(identifier);
    if (!rawg) return null;

    // 3. Generazione contenuti AI in italiano (in parallelo)
    console.log("🤖 Generazione contenuti AI per:", rawg.title);

    const tagNames = rawg.tags?.map(t => t.name).slice(0, 15) || [];
    const platformNames = rawg.platforms?.map(p => p.name) || [];

    // --- Workaround per Giochi Consigliati (visto che l'endpoint /suggested ufficiale ora richiede API a pagamento) ---
    const genresStr = rawg.genres?.map(g => g.slug).join(',') || '';
    let suggested = [];
    if (genresStr) {
      try {
        const similarData = await RAWGService.get('/games', { genres: genresStr, page_size: 10, ordering: '-rating' });
        suggested = similarData?.results?.map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          released: s.released,
          cover: s.background_image,
          metacritic: s.metacritic,
          rating: s.rating
        })) || [];
        suggested = suggested.filter(s => s.id !== rawg.id);
      } catch (e) {
        console.warn("Impossibile caricare giochi consigliati:", e);
      }
    }

    let [descriptionIt, plot, gameplay, characters, trivia] = [null, null, null, [], []];

    if (GeminiCloudService.isAvailable()) {
      try {
        [descriptionIt, plot, gameplay, characters, trivia] = await Promise.all([
          GeminiCloudService.translateDescription(rawg.descriptionRaw),
          GeminiCloudService.generatePlot(rawg.title, rawg.descriptionRaw, rawg.genres, tagNames),
          GeminiCloudService.generateGameplay(rawg.title, rawg.genres, tagNames, platformNames),
          GeminiCloudService.generateCharacters(rawg.title, rawg.descriptionRaw),
          GeminiCloudService.generateTrivia(rawg.title, rawg.descriptionRaw),
        ]);
      } catch (e) {
        console.warn("🤖 AI generation partial failure:", e);
      }
    }

    // 4. Componi il risultato finale
    const finalData = {
      ...rawg,
      suggested: suggested,
      // Contenuti tradotti/generati
      description: descriptionIt || rawg.descriptionRaw || '',
      plot: plot || descriptionIt || rawg.descriptionRaw || '',
      gameplay: gameplay || '',
      protagonists: characters || [],
      trivia: trivia || [],
      // Metadata
      _version: 6,
      _cached: Date.now(),
      _aiGenerated: GeminiCloudService.isAvailable(),
    };

    // 5. Salva in cache
    await db.setGame(cacheKey, finalData);
    console.log("✅ Dati completi pronti per:", rawg.title);
    return finalData;
  }

  /**
   * Fetch notizie reali da Google News RSS
   */
  async getGameNews(gameTitle) {
    if (!gameTitle) return [];

    const cacheKey = `news_${gameTitle}`;
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

      const news = items.map(item => ({
        title: item.querySelector("title")?.textContent || "",
        url: item.querySelector("link")?.textContent || "",
        source: item.querySelector("source")?.textContent || "Web",
        date: (() => {
          try {
            return new Date(item.querySelector("pubDate")?.textContent).toLocaleDateString('it-IT', {
              day: 'numeric', month: 'long', year: 'numeric'
            });
          } catch { return ''; }
        })(),
        summary: null // Verrà generato on-demand
      }));

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
    const summary = await GeminiCloudService.summarizeNews(title);
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
