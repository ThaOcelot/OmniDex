import { openDB } from 'idb';

const DB_NAME = 'OmniDexDB';
const STORE_NAME = 'gameCache';
const NEWS_STORE = 'newsCache';

const FAV_STORE = 'favoritesCache';

const dbPromise = openDB(DB_NAME, 36, {
  upgrade(db, oldVersion) {
    // Pulisci le vecchie cache alla nuova versione
    if (db.objectStoreNames.contains(STORE_NAME)) {
      db.deleteObjectStore(STORE_NAME);
    }
    if (db.objectStoreNames.contains(NEWS_STORE)) {
      db.deleteObjectStore(NEWS_STORE);
    }
    db.createObjectStore(STORE_NAME);
    db.createObjectStore(NEWS_STORE);

    // Crea i preferiti se non esistono (NON cancellarli mai agli upgrade)
    if (!db.objectStoreNames.contains(FAV_STORE)) {
      db.createObjectStore(FAV_STORE, { keyPath: 'id' });
    }
  },
});

export const db = {
  async getGame(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },
  async setGame(id, val) {
    return (await dbPromise).put(STORE_NAME, val, id);
  },
  async getNews(id) {
    return (await dbPromise).get(NEWS_STORE, id);
  },
  async setNews(id, val) {
    const data = { content: val, timestamp: Date.now() };
    return (await dbPromise).put(NEWS_STORE, data, id);
  },
  async clear() {
    const database = await dbPromise;
    const tx = database.transaction([STORE_NAME, NEWS_STORE], 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.objectStore(NEWS_STORE).clear();
    await tx.done;
  },
  
  // === Preferiti Locali ===
  async getFavorites() {
    const database = await dbPromise;
    return database.getAll(FAV_STORE);
  },
  async addFavorite(game) {
    const database = await dbPromise;
    return database.put(FAV_STORE, { ...game, addedAt: Date.now() });
  },
  async removeFavorite(id) {
    const database = await dbPromise;
    return database.delete(FAV_STORE, id);
  },
  async isFavorite(id) {
    const database = await dbPromise;
    const fav = await database.get(FAV_STORE, id);
    return !!fav;
  },
  async importFavorites(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data)) return false;
      const database = await dbPromise;
      const tx = database.transaction(FAV_STORE, 'readwrite');
      for (const item of data) {
        if (item.id) tx.objectStore(FAV_STORE).put(item);
      }
      await tx.done;
      return true;
    } catch (e) {
      return false;
    }
  }
};
