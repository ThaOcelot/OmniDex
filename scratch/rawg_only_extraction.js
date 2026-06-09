import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// 1. Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCSNlFH72VJtcfZkrxdtjmqfLqfzMfZOU8",
  authDomain: "omnidex-a751d.firebaseapp.com",
  projectId: "omnidex-a751d",
  storageBucket: "omnidex-a751d.firebasestorage.app",
  messagingSenderId: "1037711572342",
  appId: "1:1037711572342:web:4fdef9acd99e2b45fd0e57"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const RAWG_API_KEYS = [
  "b229a7f8324f490b9757e38fd62bbffc",
  "f0f8782547814b088437efdb1cc88399"
];
let currentKeyIndex = 0;

const BASE_URL = "https://api.rawg.io/api";

// Helper fetch base per RAWG con rotazione chiavi
async function rawgGet(endpoint, params = {}) {
  let retries = RAWG_API_KEYS.length;
  
  while (retries > 0) {
    try {
      const query = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');
      const connector = endpoint.includes('?') ? '&' : '?';
      const apiKey = RAWG_API_KEYS[currentKeyIndex];
      const url = `${BASE_URL}${endpoint}${connector}${query}&key=${apiKey}`;
      
      const res = await fetch(url);
      
      if (res.status === 401 || res.status === 429) {
        console.warn(`   ⚠️ Chiave RAWG esaurita, passo alla successiva...`);
        currentKeyIndex = (currentKeyIndex + 1) % RAWG_API_KEYS.length;
        retries--;
        continue;
      }
      
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn("RAWG Error su", endpoint, e.message);
      return null;
    }
  }
  return null;
}

async function getFullGameDetails(identifier) {
  // Fetch parallelo identico all'app
  const [game, screenshots, movies, additions, series, devTeam, achievements, reddit, parentGames] = await Promise.all([
    rawgGet(`/games/${identifier}`),
    rawgGet(`/games/${identifier}/screenshots`, { page_size: 20 }),
    rawgGet(`/games/${identifier}/movies`, { page_size: 5 }),
    rawgGet(`/games/${identifier}/additions`, { page_size: 10 }),
    rawgGet(`/games/${identifier}/game-series`, { page_size: 10 }),
    rawgGet(`/games/${identifier}/development-team`, { page_size: 20 }),
    rawgGet(`/games/${identifier}/achievements`, { page_size: 10 }),
    rawgGet(`/games/${identifier}/reddit`, { page_size: 5 }),
    rawgGet(`/games/${identifier}/parent-games`, { page_size: 5 }),
  ]);

  if (!game) return null;

  return {
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

    metacritic: game.metacritic || null,
    metacriticUrl: game.metacritic_url,
    rating: game.rating || 0,
    ratingTop: game.rating_top || 0,
    ratingsCount: game.ratings_count || 0,
    reviewsCount: game.reviews_text_count || 0,
    added: game.added || 0,
    ratings: game.ratings || [],
    addedByStatus: game.added_by_status || {},

    playtime: game.playtime || 0,
    achievementsCount: game.achievements_count || 0,
    esrb: game.esrb_rating?.name || null,
    esrbSlug: game.esrb_rating?.slug || null,

    developers: game.developers?.map(d => ({ name: d.name, slug: d.slug, id: d.id })) || [],
    publishers: game.publishers?.map(p => ({ name: p.name, slug: p.slug, id: p.id })) || [],

    genres: game.genres?.map(g => g.name) || [],
    tags: game.tags?.map(t => ({ name: t.name, language: t.language, slug: t.slug })) || [],
    platforms: game.platforms?.map(p => ({
      name: p.platform.name,
      slug: p.platform.slug,
      released: p.released_at,
      requirements: p.requirements || null
    })) || [],

    stores: game.stores?.map(s => ({
      name: s.store.name,
      slug: s.store.slug,
      domain: s.store.domain,
      url: `https://${s.store.domain}`
    })) || [],

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

    website: game.website,
    redditUrl: game.reddit_url,
    redditName: game.reddit_name,
    redditDescription: game.reddit_description,
    redditCount: game.reddit_count || 0,

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

    developmentTeam: devTeam?.results?.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      imageBackground: c.image_background,
      gamesCount: c.games_count,
      positions: c.positions?.map(p => p.name) || []
    })) || [],

    achievements: achievements?.results?.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      image: a.image,
      percent: a.percent
    })) || [],

    redditPosts: reddit?.results?.map(r => ({
      id: r.id,
      name: r.name,
      text: r.text,
      url: r.url,
      username: r.username,
      usernameUrl: r.username_url,
      created: r.created
    })) || [],

    gameModes: game.tags
      ?.filter(t => ['singleplayer', 'multiplayer', 'co-op', 'online-co-op', 'split-screen',
        'online-multiplayer', 'local-multiplayer', 'local-co-op', 'mmo', 'battle-royale',
        'online-pvp', 'pvp', 'pve'].includes(t.slug))
      .map(t => t.name) || [],

    clip: game.clip?.clip || null,
    clipPreview: game.clip?.preview || null,
  };
}

async function main() {
  console.log("🚀 Inizio BATCH EXTRACTION RAWG -> Firebase (Target: 1000 giochi)...");
  
  let totalProcessed = 0;
  
  for (let page = 51; page <= 100; page++) {
    console.log(`\n📄 Caricamento Pagina ${page} di 100...`);
    
    let games = [];
    let pageRetries = 15;
    
    while (pageRetries > 0) {
      const data = await rawgGet("/games", { ordering: "-added", page_size: 40, page: page });
      if (data && data.results && data.results.length > 0) {
        games = data.results;
        break; // successo!
      } else {
        console.warn(`   ⚠️ Pagina vuota o bloccata da RAWG. Attendo 2 minuti... (Tentativi rimasti: ${pageRetries - 1})`);
        pageRetries--;
        await new Promise(r => setTimeout(r, 120000)); // aspetta 2 minuti (120 sec)
      }
    }
    
    if (games.length === 0) {
      console.log("⏭️ Impossibile recuperare questa pagina. Salto alla successiva.");
      continue;
    }

    for (const g of games) {
      // Controlla se è già in Firestore
      const docRef = doc(db, "games", String(g.id));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        continue; // saltiamo in modo silenzioso per non spammare la console
      }
      
      console.log(`   🎮 Estrazione: ${g.name} (ID: ${g.id})`);
      const fullData = await getFullGameDetails(g.id);
      if (!fullData) {
        continue;
      }
      
      const firestorePayload = {
        ...fullData,
        _aiGenerated: false,
        plot: '',
        description: '', 
        gameplay: '',
        protagonists: [],
        trivia: [],
        _firestoreSavedAt: serverTimestamp()
      };

      const cleanPayload = JSON.parse(JSON.stringify(firestorePayload));
      await setDoc(docRef, cleanPayload, { merge: true });
      totalProcessed++;
      
      // Pausa di rispetto per RAWG (2 chiamate al sec max)
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\n🎉 SCRIPT BATCH COMPLETATO! Totale giochi nuovi aggiunti: ${totalProcessed}`);
  process.exit(0);
}
main().catch(console.error);
