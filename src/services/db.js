import { openDB } from 'idb';

const DB_NAME = 'OmniDexDB';
const STORE_NAME = 'gameCache';
const NEWS_STORE = 'newsCache';

const FAV_STORE = 'favoritesCache';

const dbPromise = openDB(DB_NAME, 37, {
  upgrade(db, oldVersion) {
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
    if (!id) return null;
    try {
      return (await dbPromise).get(STORE_NAME, id);
    } catch (e) {
      console.warn("❌ db.getGame failed:", e);
      return null;
    }
  },
  async setGame(id, val) {
    if (!id) return null;
    try {
      return (await dbPromise).put(STORE_NAME, val, id);
    } catch (e) {
      console.warn("❌ db.setGame failed:", e);
      return null;
    }
  },
  async getNews(id) {
    if (!id) return null;
    try {
      return (await dbPromise).get(NEWS_STORE, id);
    } catch (e) {
      console.warn("❌ db.getNews failed:", e);
      return null;
    }
  },
  async setNews(id, val) {
    if (!id) return null;
    try {
      const data = { content: val, timestamp: Date.now() };
      return (await dbPromise).put(NEWS_STORE, data, id);
    } catch (e) {
      console.warn("❌ db.setNews failed:", e);
      return null;
    }
  },
  async clear() {
    try {
      const database = await dbPromise;
      const tx = database.transaction([STORE_NAME, NEWS_STORE], 'readwrite');
      await tx.objectStore(STORE_NAME).clear();
      await tx.objectStore(NEWS_STORE).clear();
      await tx.done;
    } catch (e) {
      console.warn("❌ db.clear failed:", e);
    }
  },
  
  // === Preferiti Locali ===
  async getFavorites() {
    try {
      const database = await dbPromise;
      return await database.getAll(FAV_STORE);
    } catch (e) {
      console.warn("❌ db.getFavorites failed:", e);
      return [];
    }
  },
  async addFavorite(game) {
    if (!game || !game.id) return null;
    try {
      const database = await dbPromise;
      return await database.put(FAV_STORE, { ...game, addedAt: Date.now() });
    } catch (e) {
      console.warn("❌ db.addFavorite failed:", e);
      return null;
    }
  },
  async removeFavorite(id) {
    if (!id) return null;
    try {
      const database = await dbPromise;
      return await database.delete(FAV_STORE, id);
    } catch (e) {
      console.warn("❌ db.removeFavorite failed:", e);
      return null;
    }
  },
  async isFavorite(id) {
    if (!id) return false;
    try {
      const database = await dbPromise;
      const fav = await database.get(FAV_STORE, id);
      return !!fav;
    } catch (e) {
      console.warn("❌ db.isFavorite failed:", e);
      return false;
    }
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
      console.warn("❌ db.importFavorites failed:", e);
      return false;
    }
  },

  // === Backlog Status ===
  // Valori validi: 'backlog' | 'playing' | 'completed' | 'dropped'
  async updateStatus(id, status) {
    if (!id) return false;
    try {
      const database = await dbPromise;
      const existing = await database.get(FAV_STORE, id);
      if (!existing) return false;
      return await database.put(FAV_STORE, { ...existing, status });
    } catch (e) {
      console.warn("❌ db.updateStatus failed:", e);
      return false;
    }
  },

  // Aggiorna il flag isFavorite (notifiche) per un gioco in raccolta
  async updateFavoriteFlag(id, isFavorite) {
    if (!id) return false;
    try {
      const database = await dbPromise;
      const existing = await database.get(FAV_STORE, id);
      if (!existing) return false;
      return await database.put(FAV_STORE, { ...existing, isFavorite });
    } catch (e) {
      console.warn("❌ db.updateFavoriteFlag failed:", e);
      return false;
    }
  },

  // Ritorna solo i giochi con notifiche attive (isFavorite: true)
  async getFavoritesForNotifications() {
    try {
      const all = await this.getFavorites();
      return all.filter(g => g.isFavorite !== false);
    } catch (e) {
      console.warn("❌ db.getFavoritesForNotifications failed:", e);
      return [];
    }
  },

  async getByStatus(status) {
    try {
      const database = await dbPromise;
      const all = await database.getAll(FAV_STORE);
      return all.filter(g => g.status === status);
    } catch (e) {
      console.warn("❌ db.getByStatus failed:", e);
      return [];
    }
  },
};
