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
      // Solo i giochi con notifiche attive (campanella 🔔 abilitata dall'utente)
      const favorites = await db.getFavoritesForNotifications();
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
                    gameId: game.id,
                    newsUrl: latestNews.url,
                    newsTitle: latestNews.title
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

  /**
   * Simula l'invio immediato di una notifica push nativa o fallback Web Browser
   * per le notizie di un gioco preferito (o di esempio).
   */
  async simulateNewsNotification() {
    // 1. Richiedi i permessi
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn("🔔 Permessi di notifica non concessi.");
    }

    // 2. Trova un titolo di videogioco
    let gameTitle = "GTA VI";
    try {
      const favorites = await db.getFavorites();
      if (favorites && favorites.length > 0) {
        // Seleziona un preferito a caso per renderlo più realistico
        gameTitle = favorites[Math.floor(Math.random() * favorites.length)].title;
      }
    } catch (e) {
      console.warn("🔔 Errore recupero preferiti per simulazione:", e);
    }

    // 3. Recupera una notizia per il titolo
    let newsTitle = "In arrivo incredibili novità e dettagli inediti sul gameplay!";
    try {
      const news = await GameService.getGameNews(gameTitle);
      if (news && news.length > 0) {
        newsTitle = news[0].title;
      }
    } catch (e) {
      console.warn(`🔔 Errore recupero notizie per ${gameTitle}:`, e);
    }

    // 4. Invia notifica Capacitor Locale su telefono
    const notificationTitle = `Notizie fresche su ${gameTitle}! 🎮`;
    const isNative = window.Capacitor?.isNativePlatform?.();

    if (isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 1000000),
              title: notificationTitle,
              body: newsTitle,
              largeBody: newsTitle,
              summaryText: `Nuovo update per ${gameTitle}`,
              schedule: { at: new Date(Date.now() + 1000) }, // 1 secondo di ritardo
              sound: 'default'
            }
          ]
        });
        console.log("🔔 Notifica nativa Capacitor pianificata.");
        return true;
      } catch (err) {
        console.error("🔔 Fallimento invio notifica nativa:", err);
      }
    }

    // Fallback Web Browser (Standard HTML5 Notifications)
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, {
          body: newsTitle,
          icon: '/favicon.ico'
        });
        return true;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(notificationTitle, {
            body: newsTitle,
            icon: '/favicon.ico'
          });
          return true;
        }
      }
    }

    // Fallback definitivo per browser restrittivi o senza permessi concessi
    alert(`[Notifica di Gioco]\n\n${notificationTitle}\n\n${newsTitle}`);
    return true;
  }

  /**
   * Mostra un prompt all'utente per disabilitare l'ottimizzazione batteria
   */
  async checkBackgroundExecutionPrompt() {
    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) return;

    const prompted = localStorage.getItem('battery_opt_prompt_shown');
    if (!prompted) {
      localStorage.setItem('battery_opt_prompt_shown', 'true');
      
      setTimeout(async () => {
        const res = window.confirm("Per ricevere le notifiche in modo affidabile, OmniDex deve poter funzionare in background.\n\nVuoi aprire le impostazioni dell'app ora e impostare l'Uso Batteria su 'Senza limitazioni'?");
        if (res) {
          try {
            const { App } = await import('@capacitor/app');
            await App.openAppSettings();
          } catch(e) {
            console.warn("🔔 Failed to open app settings", e);
          }
        }
      }, 500); // Piccolo ritardo per evitare accavallamenti visivi con permessi
    }
  }

  /**
   * Schedula la notifica di uscita di un gioco per il Release Radar
   */
  async scheduleReleaseNotification(game) {
    if (!game || !game.released) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn("🔔 Permessi di notifica non concessi.");
      return;
    }

    await this.checkBackgroundExecutionPrompt();

    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) return;

    try {
      const releaseDate = new Date(game.released);
      releaseDate.setHours(10, 0, 0, 0); // Ore 10:00 AM

      if (releaseDate.getTime() < Date.now()) {
        console.log(`🔔 Data di rilascio passata per ${game.name}, nessuna notifica schedulata.`);
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: game.id, // ID del gioco come ID notifica per poterlo cancellare
            title: `Il grande giorno è arrivato! 🎮`,
            body: `${game.name} è ufficialmente disponibile da oggi!`,
            largeBody: `${game.name} è ufficialmente disponibile da oggi! Entra in OmniDex e scopri i dettagli.`,
            schedule: { at: releaseDate },
            sound: 'default'
          }
        ]
      });
      console.log(`🔔 Notifica rilascio schedulata per ${game.name} il ${releaseDate.toLocaleString()}`);
    } catch (e) {
      console.warn("🔔 Errore schedulazione notifica di rilascio:", e);
    }
  }

  /**
   * Cancella una notifica di uscita precedentemente schedulata
   */
  async cancelReleaseNotification(gameId) {
    if (!gameId) return;
    const isNative = window.Capacitor?.isNativePlatform?.();
    if (!isNative) return;

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: gameId }]
      });
      console.log(`🔔 Notifica rilascio cancellata per ID ${gameId}`);
    } catch (e) {
      console.warn("🔔 Errore cancellazione notifica:", e);
    }
  }
}

export default new NotificationService();
