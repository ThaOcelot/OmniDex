import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import SearchResults from './pages/SearchResults';
import Favorites from './pages/Favorites';
import ChangelogPopup from './components/ChangelogPopup';
import UpdatePopup from './components/UpdatePopup';

import { LocalNotifications } from '@capacitor/local-notifications';
import NotificationService from './services/NotificationService';

function SystemHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Inizializza il checker periodico delle notizie per i preferiti
    NotificationService.initNewsChecker();

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

const basename = import.meta.env.DEV ? '/' : '/OmniDex';

function App() {
  return (
    <Router basename={basename}>
      <SystemHandler />
      <ChangelogPopup />
      <UpdatePopup />
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search/:query" element={<SearchResults />} />
            <Route path="/game/:gameName" element={<GameDetails />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
