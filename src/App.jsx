import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import SearchResults from './pages/SearchResults';
import Favorites from './pages/Favorites';
import Upcoming from './pages/Upcoming';
import ChangelogPopup from './components/ChangelogPopup';
import UpdatePopup from './components/UpdatePopup';
import SettingsPopup from './components/SettingsPopup';
import FloatingSearchBar from './components/FloatingSearchBar';

import { LocalNotifications } from '@capacitor/local-notifications';
import NotificationService from './services/NotificationService';

function SystemHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
        const gameName = action.notification.extra?.gameName;
        if (gameName) {
          navigate(`/game/${encodeURIComponent(gameName)}`);
        }
      });
    };

    handleBackButton();
    handleNotificationTaps();

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

  return (
    <Router>
      <SystemHandler />
      <ChangelogPopup />
      <UpdatePopup />
      {isSettingsOpen && <SettingsPopup onClose={() => setIsSettingsOpen(false)} />}
      <div className="app-wrapper">
        <Navbar />
        <FloatingSearchBar />
        <main className="main-content container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search/:query" element={<SearchResults />} />
            <Route path="/game/:gameName" element={<GameDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/upcoming" element={<Upcoming />} />
          </Routes>
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
      </div>
    </Router>
  );
}

export default App;
