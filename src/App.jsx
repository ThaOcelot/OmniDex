import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import SearchResults from './pages/SearchResults';
import Favorites from './pages/Favorites';

function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = async () => {
      await CapApp.addListener('backButton', (data) => {
        if (location.pathname === '/') {
          // Se siamo in Home, esci dall'app
          CapApp.exitApp();
        } else {
          // Altrimenti torna indietro nella cronologia dell'app
          navigate(-1);
        }
      });
    };

    handleBackButton();

    return () => {
      // La rimozione dei listener in Capacitor è asincrona
      CapApp.removeAllListeners();
    };
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <BackButtonHandler />
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
