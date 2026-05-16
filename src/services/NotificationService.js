import { LocalNotifications } from '@capacitor/local-notifications';
import { db } from './db';
import GameService from './GameService';

class NotificationService {
  constructor() {
    this.intervalId = null;
  }

  /**
   * Richiede i permessi per inviare notifiche locali
   */
  async requestPermissions() {
    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (e) {
      console.warn("🔔 Failed to request notification permissions:", e);
      return false;
    }
  }

  /**
   * Inizializza il controllo delle notizie per i preferiti
   */
  initNewsChecker() {
    // Richiedi i permessi all'avvio in modo non bloccante
    this.requestPermissions();

    // Esegui il primo controllo dopo 10 secondi dall'avvio
    setTimeout(() => {
      this.checkNewNewsForFavorites();
    }, 10000);

    // Esegui il controllo ogni 15 minuti
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.checkNewNewsForFavorites();
    }, 15 * 60 * 1000);
  }

  /**
   * Inizializza lo stato dell'ultima notizia per un gioco appena aggiunto ai preferiti
   * per evitare di notificare notizie passate.
   */
  async initFavoriteLatestNews(gameId, gameTitle) {
    try {
      const news = await GameService.getGameNews(gameTitle);
      if (news && news.length > 0) {
        const latestNews = news[0];
        localStorage.setItem(`last_notified_news_${gameId}`, latestNews.url);
      }
    } catch (e) {
      console.warn(`🔔 Failed to init latest news for new favorite ${gameTitle}:`, e);
    }
  }

  /**
   * Controlla se ci sono nuove notizie per i giochi preferiti
   */
  async checkNewNewsForFavorites() {
    try {
      const favorites = await db.getFavorites();
      if (!favorites || favorites.length === 0) return;

      console.log(`🔔 Checking news for ${favorites.length} favorite games...`);

      for (const game of favorites) {
        // Recupera le notizie per il gioco
        const news = await GameService.getGameNews(game.title);
        if (!news || news.length === 0) continue;

        const latestNews = news[0];
        const cacheKey = `last_notified_news_${game.id}`;
        const lastNotifiedUrl = localStorage.getItem(cacheKey);

        // Se non abbiamo ancora registrato l'ultima notizia, memorizzala senza notificare
        if (!lastNotifiedUrl) {
          localStorage.setItem(cacheKey, latestNews.url);
          continue;
        }

        // Se l'ultima notizia è diversa da quella memorizzata, invia la notifica!
        if (lastNotifiedUrl !== latestNews.url) {
          // Aggiorna lo stato in cache
          localStorage.setItem(cacheKey, latestNews.url);

          // Verifica se abbiamo il permesso
          const status = await LocalNotifications.checkPermissions();
          if (status.display === 'granted') {
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: Math.floor(Math.random() * 1000000),
                  title: `Notizie fresche su ${game.title}! 🎮`,
                  body: latestNews.title,
                  largeBody: latestNews.title,
                  summaryText: `Nuovo update per ${game.title}`,
                  schedule: { at: new Date(Date.now() + 1000) }, // Invio immediato
                  sound: 'default',
                  extra: {
                    gameName: game.title,
                    gameId: game.id
                  }
                }
              ]
            });
            console.log(`🔔 Notification scheduled for: ${game.title}`);
          }
        }
      }
    } catch (e) {
      console.warn("🔔 Error checking new news for favorites:", e);
    }
  }
}

export default new NotificationService();
