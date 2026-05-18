const API_KEY = "f0f8782547814b088437efdb1cc88399";
const BASE_URL = "https://api.rawg.io/api";

class RAWGService {

  /**
   * Helper per chiamate HTTP — usa fetch standard (funziona sia in browser che Capacitor)
   */
  async get(endpoint, params = {}) {
    try {
      const query = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');
      const connector = endpoint.includes('?') ? '&' : '?';
      const url = `${BASE_URL}${endpoint}${connector}${query}&key=${API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`📡 RAWG ${res.status} for ${endpoint}`);
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error("📡 RAWG Error:", e);
      return null;
    }
  }

  /**
   * Ricerca giochi
   */
  async searchGames(query) {
    if (!query) return [];
    const data = await this.get("/games", { search: query, page_size: 20 });
    return data?.results || [];
  }

  /**
   * Dettagli completi del gioco — fetch parallelo di TUTTI gli endpoint disponibili
   */
  async getGameDetails(identifier) {
    // 1. Fetch principale + tutti gli endpoint secondari in parallelo
    const [game, screenshots, movies, additions, series, devTeam, achievements, reddit, parentGames] = await Promise.all([
      this.get(`/games/${identifier}`),
      this.get(`/games/${identifier}/screenshots`, { page_size: 20 }),
      this.get(`/games/${identifier}/movies`, { page_size: 5 }),
      this.get(`/games/${identifier}/additions`, { page_size: 10 }),
      this.get(`/games/${identifier}/game-series`, { page_size: 10 }),
      this.get(`/games/${identifier}/development-team`, { page_size: 20 }),
      this.get(`/games/${identifier}/achievements`, { page_size: 10 }),
      this.get(`/games/${identifier}/reddit`, { page_size: 5 }),
      this.get(`/games/${identifier}/parent-games`, { page_size: 5 }),
    ]);

    if (!game) return null;

    return {
      // === Info Base ===
      id: game.id,
      slug: game.slug,
      title: game.name,
      originalTitle: game.name_original,
      descriptionRaw: game.description_raw || '',
      descriptionHtml: game.description || '',
      releaseDate: game.released ? new Date(game.released).toLocaleDateString('it-IT') : "TBA",
      released: game.released,
      tba: game.tba || false,
      updated: game.updated,

      // === Valutazioni ===
      metacritic: game.metacritic || null,
      metacriticUrl: game.metacritic_url,
      rating: game.rating || 0,
      ratingTop: game.rating_top || 0,
      ratingsCount: game.ratings_count || 0,
      reviewsCount: game.reviews_text_count || 0,
      added: game.added || 0,
      ratings: game.ratings || [],
      addedByStatus: game.added_by_status || {},

      // === Gameplay ===
      playtime: game.playtime || 0,
      achievementsCount: game.achievements_count || 0,
      
      // === Classificazione ===
      esrb: game.esrb_rating?.name || null,
      esrbSlug: game.esrb_rating?.slug || null,

      // === Team ===
      developers: game.developers?.map(d => ({ name: d.name, slug: d.slug, id: d.id })) || [],
      publishers: game.publishers?.map(p => ({ name: p.name, slug: p.slug, id: p.id })) || [],

      // === Categorizzazione ===
      genres: game.genres?.map(g => g.name) || [],
      tags: game.tags?.map(t => ({ name: t.name, language: t.language, slug: t.slug })) || [],
      platforms: game.platforms?.map(p => ({
        name: p.platform.name,
        slug: p.platform.slug,
        released: p.released_at,
        requirements: p.requirements || null
      })) || [],

      // === Store ===
      stores: game.stores?.map(s => ({
        name: s.store.name,
        slug: s.store.slug,
        domain: s.store.domain,
        url: `https://${s.store.domain}`
      })) || [],

      // === Media ===
      cover: game.background_image,
      backgroundAdditional: game.background_image_additional,
      screenshots: screenshots?.results?.map(s => s.image) || [game.background_image].filter(Boolean),
      trailers: movies?.results?.map(m => ({
        id: m.id,
        name: m.name,
        preview: m.preview,
        videoLow: m.data?.["480"],
        videoHigh: m.data?.max
      })) || [],

      // === Links ===
      website: game.website,
      redditUrl: game.reddit_url,
      redditName: game.reddit_name,
      redditDescription: game.reddit_description,
      redditCount: game.reddit_count || 0,

      // === Contenuti Aggiuntivi ===
      dlc: additions?.results?.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        released: a.released,
        cover: a.background_image,
        metacritic: a.metacritic
      })) || [],

      gameSeries: series?.results?.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        released: s.released,
        cover: s.background_image,
        metacritic: s.metacritic,
        rating: s.rating
      })) || [],

      parentGames: parentGames?.results?.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        released: p.released,
        cover: p.background_image
      })) || [],

      // === Team di Sviluppo ===
      developmentTeam: devTeam?.results?.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        imageBackground: c.image_background,
        gamesCount: c.games_count,
        positions: c.positions?.map(p => p.name) || []
      })) || [],

      // === Obiettivi ===
      achievements: achievements?.results?.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        image: a.image,
        percent: a.percent
      })) || [],

      // === Social & Streams ===
      redditPosts: reddit?.results?.map(r => ({
        id: r.id,
        name: r.name,
        text: r.text,
        url: r.url,
        username: r.username,
        usernameUrl: r.username_url,
        created: r.created
      })) || [],



      // === Modalità di gioco (estratte dai tag) ===
      gameModes: game.tags
        ?.filter(t => ['singleplayer', 'multiplayer', 'co-op', 'online-co-op', 'split-screen',
          'online-multiplayer', 'local-multiplayer', 'local-co-op', 'mmo', 'battle-royale',
          'online-pvp', 'pvp', 'pve']
          .includes(t.slug))
        .map(t => t.name) || [],

      // === Clip ===
      clip: game.clip?.clip || null,
      clipPreview: game.clip?.preview || null,
    };
  }

  cleanHTML(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }

  /**
   * Gioco casuale — pesca da una pagina random del catalogo RAWG
   */
  async getRandomGame() {
    const randomPage = Math.floor(Math.random() * 300) + 1;
    const data = await this.get("/games", {
      page: randomPage,
      page_size: 1,
      ordering: '-added',
      metacritic: '60,100',
    });
    return data?.results?.[0] || null;
  }

  /**
   * Giochi in uscita nei prossimi 30 giorni
   */
  async getUpcomingGames() {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 60);
    const fmt = d => d.toISOString().split('T')[0];
    const data = await this.get("/games", {
      dates: `${fmt(today)},${fmt(future)}`,
      ordering: 'released',
      page_size: 20,
    });
    return data?.results || [];
  }

  /**
   * Ricerca con filtri avanzati
   */
  async searchGamesFiltered(query, filters = {}) {
    const params = { search: query, page_size: 20 };
    if (filters.platforms) params.platforms = filters.platforms;
    if (filters.genres)    params.genres    = filters.genres;
    if (filters.dates)     params.dates     = filters.dates;
    if (filters.metacritic) params.metacritic = filters.metacritic;
    const data = await this.get("/games", params);
    return data?.results || [];
  }
}

export default new RAWGService();
