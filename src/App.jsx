import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import SearchResults from './pages/SearchResults';
import Favorites from './pages/Favorites';
import ReleaseRadar from './pages/ReleaseRadar';
import ChangelogPopup from './components/ChangelogPopup';
import CharacterDetails from './pages/CharacterDetails';
import SettingsPopup from './components/SettingsPopup';
import FloatingSearchBar from './components/FloatingSearchBar';
import AdBanner from './components/AdBanner';
import WelcomePopup from './components/WelcomePopup';
import { ErrorBoundary } from './components/ErrorBoundary';

import { LocalNotifications } from '@capacitor/local-notifications';
import NotificationService from './services/NotificationService';
import IAPService from './services/IAPService';
import AdService from './services/AdService';

function SystemHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Inizializza i servizi di monetizzazione (Acquisti ed Annunci)
    IAPService.init();
    AdService.init();

    // Inizializza il checker periodico delle notizie per i preferiti
    NotificationService.initNewsChecker();

    // Ripristina il tema salvato (light/dark mode)
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.filter = '';

    // Gestore del tasto indietro di sistema
    const handleBackButton = async () => {
      await CapApp.addListener('backButton', (data) => {
        if (location.pathname === '/') {
          CapApp.exitApp();
        } else {
          navigate(-1);
        }
      });
    };

    // Gestore del click/tap sulle notifiche
    const handleNotificationTaps = async () => {
      await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        const { gameName, gameId, newsUrl, newsTitle } = action.notification.extra || {};
        if (gameName) {
          navigate(`/game/${encodeURIComponent(gameName)}`, {
            state: {
              game: gameId ? { id: gameId } : undefined,
              openNewsUrl: newsUrl || null,
              openNewsTitle: newsTitle || null,
            }
          });
        }
      });
    };

    // --- LOGICA NOTIFICHE PERIODICA E AVVISO BACKGROUND ---
    const checkNotificationPermissions = async () => {
      if (window.Capacitor?.isNativePlatform?.()) {
        try {
          const status = await LocalNotifications.checkPermissions();
          if (status.display !== 'granted') {
            const lastPrompt = localStorage.getItem('last_notification_prompt');
            const now = Date.now();
            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
            
            // Se non abbiamo mai chiesto o sono passati 7 giorni
            if (!lastPrompt || (now - parseInt(lastPrompt, 10)) > SEVEN_DAYS_MS) {
              localStorage.setItem('last_notification_prompt', now.toString());
              
              const granted = await NotificationService.requestPermissions();
              if (granted) {
                // Mostra un avviso informativo per il background play invece di forzarlo
                setTimeout(() => {
                  alert("Permessi concessi! 🔔\n\nAttenzione: se vuoi ricevere le notifiche in modo tempestivo, ricordati di abilitare l'esecuzione in background o rimuovere le ottimizzazioni batteria per OmniDex nelle impostazioni del telefono.");
                }, 1000);
              }
            }
          }
        } catch (e) {
          console.warn("Impossibile controllare i permessi notifiche:", e);
        }
      }
    };

    handleBackButton();
    handleNotificationTaps();
    checkNotificationPermissions();

    return () => {
      CapApp.removeAllListeners();
      LocalNotifications.removeAllListeners();
    };
  }, [location, navigate]);

  return null;
}

const isGitHubPages = window.location.hostname.includes('github.io');
const basename = isGitHubPages ? '/OmniDex' : '/';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  const [isPro, setIsPro] = useState(IAPService.isPro());
  const [bannerHeight, setBannerHeight] = useState(60);

  useEffect(() => {
    const unsub = IAPService.subscribe((status) => setIsPro(status));
    return unsub;
  }, []);

  useEffect(() => {
    const handleBannerHeight = (e) => {
      const height = e.detail || 60;
      setBannerHeight(height);
      document.documentElement.style.setProperty('--banner-height', `${IAPService.isPro() ? 0 : height}px`);
    };
    window.addEventListener('ad-banner-height', handleBannerHeight);
    
    // Inizializza la variabile CSS al mount
    document.documentElement.style.setProperty('--banner-height', `${IAPService.isPro() ? 0 : 60}px`);
    
    return () => window.removeEventListener('ad-banner-height', handleBannerHeight);
  }, []);

  return (
    <Router>
      <SystemHandler />
      <WelcomePopup />
      {isSettingsOpen && <SettingsPopup onClose={() => setIsSettingsOpen(false)} />}
      <div className="app-wrapper" style={{ paddingBottom: 'calc(var(--banner-height, 0px) + 80px)' }}>
        <Navbar />
        <FloatingSearchBar />
        <main className="main-content container">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search/:query" element={<SearchResults />} />
              <Route path="/game/:gameName" element={<GameDetails />} />
              <Route path="/character/:characterName" element={<CharacterDetails />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/release-radar" element={<ReleaseRadar />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <footer className="app-footer" style={{ borderTop: '1px solid var(--glass-border)', marginTop: 'auto', padding: '24px 0' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            <div>
              © {new Date().getFullYear()} <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>OmniDex</span>. Tutti i diritti riservati.
            </div>
            <div style={{ fontSize: '0.78rem' }}>
              Dati e immagini dei videogiochi forniti con orgoglio da <a href="https://rawg.io" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textDecoration: 'underline' }}>RAWG</a>.
            </div>
          </div>
        </footer>
        <AdBanner />
      </div>
    </Router>
  );
}

export default App;
