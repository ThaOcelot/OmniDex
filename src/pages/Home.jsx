import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Shuffle, X, Star, Lock, CalendarClock, ChevronRight } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';
import RAWGService from '../services/RAWGService';
import IAPService from '../services/IAPService';
import { db } from '../services/db';

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('game'); // 'game' | 'character'
  const [aiMode, setAiMode] = useState(false);
  const [tier, setTier] = useState(IAPService.getTier());
  const [discovering, setDiscovering] = useState(false);
  const [discoveredGame, setDiscoveredGame] = useState(null);
  const [upcomingNear, setUpcomingNear] = useState([]);
  const [upcomingFar, setUpcomingFar] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    RAWGService.getUpcomingGames().then(games => {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);
      
      const near = games.filter(g => new Date(g.released) <= nextMonth);
      const far = games.filter(g => new Date(g.released) > nextMonth);

      setUpcomingNear(near);
      setUpcomingFar(far);
    }).catch(console.error);

    let scrollInterval;
    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        const container = document.getElementById('upcoming-near-carousel');
        if (container) {
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: 176, behavior: 'smooth' });
          }
        }
      }, 3000);
    };
    startAutoScroll();
    
    return () => {
      IAPService.subscribe((t) => setTier(t));
      clearInterval(scrollInterval);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (searchType === 'character') {
      if (tier !== 'ultra') {
        window.dispatchEvent(new CustomEvent('open-settings'));
        return;
      }
      navigate(`/character/${encodeURIComponent(query.trim())}`);
      return;
    }

    if (aiMode && tier !== 'ultra') {
      window.dispatchEvent(new CustomEvent('open-settings'));
      return;
    }
    
    navigate(`/search/${encodeURIComponent(query.trim())}${aiMode ? '?ai=true' : ''}`);
  };

  const handlePersonalizedSuggestions = async () => {
    if (tier !== 'ultra') {
      window.dispatchEvent(new CustomEvent('open-settings'));
      return;
    }
    const favorites = await db.getFavorites();
    if (favorites.length === 0) {
      alert("🎮 Aggiungi prima qualche gioco ai preferiti per permettere all'IA di capire i tuoi gusti!");
      return;
    }
    // Prende i primi 5-6 preferiti come campione
    const favTitles = favorites.slice(0, 6).map(f => f.title).join(', ');
    const prompt = `Consigliami dei nuovi giochi che potrebbero piacermi, considerando che ho amato giocare a questi titoli: ${favTitles}. Non consigliarmi quelli che ho già citato.`;
    navigate(`/search/${encodeURIComponent(prompt)}?ai=true`);
  };

  const handleDiscover = async () => {
    if (discovering) return;
    setDiscovering(true);
    setDiscoveredGame(null);
    try {
      const game = await RAWGService.getRandomGame();
      setDiscoveredGame(game);
    } catch {
      setDiscovering(false);
    } finally {
      setDiscovering(false);
    }
  };  return (
    <div className="home-container animate-fade-in">
      <div className="home-badge-ia">
        <Sparkles size={14} />
        <span>Potenziato dall'IA</span>
      </div>

      <h1 className="home-title">
        L'Enciclopedia Intelligente dei Videogiochi
      </h1>

      <p className="home-description">
        Il tuo hub local-first per esplorare in profondità qualsiasi titolo. Trova all'istante biografie dettagliate dei personaggi, approfondimenti sulle trame, analisi di gameplay e ultime notizie in tempo reale.
      </p>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={searchType === 'character' ? "Cerca un personaggio..." : (aiMode ? "Es: Voglio un gioco nello spazio lungo 20 ore..." : "Cerca un videogioco...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input-field"
          />
          <div className="search-icon-container">
            <Search size={18} color="var(--text-secondary)" />
            <div className="search-input-divider"></div>
          </div>
          <button type="submit" className="btn-primary search-submit-btn">
            Cerca
          </button>
        </div>
        
        {/* Toggles Container */}
        <div className="toggles-container">
          {/* Toggle Type */}
          <div className="toggle-group">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setSearchType('game'); }}
              className={`toggle-group-btn ${searchType === 'game' ? 'active-game' : ''}`}
            >
              Giochi
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setSearchType('character'); }}
              className={`toggle-group-btn ${searchType === 'character' ? 'active-char' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Personaggi {tier !== 'ultra' && <Lock size={12} />}
            </button>
          </div>

          {/* Toggle Modalità Sommelier */}
          {searchType === 'game' && (
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAiMode(!aiMode); }}
              className={`toggle-sommelier-btn ${aiMode ? 'active' : ''}`}
            >
              <Sparkles size={12} color={aiMode ? "var(--accent-ultra)" : "currentColor"} />
              Sommelier AI
              {tier !== 'ultra' && <Lock size={12} style={{ marginLeft: '4px' }} />}
            </button>
          )}
        </div>
      </form>

      {/* Pulsanti Azione Rapida */}
      <div className="home-actions-column">
        <button
          onClick={handlePersonalizedSuggestions}
          className="btn-flat-accent"
        >
          <Sparkles size={18} />
          <span>Consigliati per me</span>
          {tier !== 'ultra' && <Lock size={12} style={{ marginLeft: '2px' }} />}
        </button>

        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button
            onClick={handleDiscover}
            disabled={discovering}
            className="btn-flat-primary"
          >
            <Shuffle size={16} style={{ animation: discovering ? 'spin-anim 0.7s linear infinite' : 'none' }} />
            <span>{discovering ? 'Ricerca...' : '🎲 Gioco del Giorno'}</span>
          </button>
        </div>
      </div>

      {/* Carosello Prossimo Futuro */}
      {upcomingNear.length > 0 && (
        <div className="carousel-section">
          <h3 className="carousel-title">
            <Sparkles size={18} color="var(--accent-primary)" />
            Prossimamente (Nei prossimi 30 giorni)
          </h3>
          
          <div id="upcoming-near-carousel" className="carousel-wrapper hide-scrollbar">
            {upcomingNear.map((game) => (
              <div 
                key={game.id}
                onClick={() => navigate(`/game/${encodeURIComponent(game.name)}`, { state: { game: { id: game.id } } })}
                className="carousel-card"
              >
                <div className="carousel-image-container">
                  <img 
                    src={game.background_image || 'https://via.placeholder.com/160x220?text=No+Cover'} 
                    alt={game.name} 
                    loading="lazy"
                    className="carousel-image" 
                  />
                  <div className="carousel-overlay">
                    <h4 className="carousel-game-title">
                      {game.name}
                    </h4>
                    <p className="carousel-game-date">
                      {new Date(game.released).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Overlay Discovery Result */}
      {discoveredGame && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backdropFilter: 'blur(10px)'
          }}
          onClick={() => setDiscoveredGame(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{ maxWidth: '380px', width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: '0 30px 80px rgba(0,0,0,0.8), var(--shadow-glow)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cover */}
            {discoveredGame.background_image && (
              <div style={{ height: '200px', background: `url(${discoveredGame.background_image}) center/cover no-repeat`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                <button
                  onClick={() => setDiscoveredGame(null)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {/* Info */}
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                💎 Scoperta del Giorno
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px', lineHeight: 1.2 }}>
                {discoveredGame.name}
              </h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {discoveredGame.rating > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Star size={14} fill="gold" color="gold" /> {discoveredGame.rating.toFixed(1)}
                  </span>
                )}
                {discoveredGame.released && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    📅 {new Date(discoveredGame.released).toLocaleDateString('it-IT', { year: 'numeric' })}
                  </span>
                )}
                {discoveredGame.metacritic && (
                  <span style={{ color: '#10B981', fontWeight: '700', fontSize: '0.85rem' }}>MC {discoveredGame.metacritic}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => {
                    setDiscoveredGame(null);
                    navigate(`/game/${encodeURIComponent(discoveredGame.name)}`, { state: { game: { id: discoveredGame.id } } });
                  }}
                >
                  Esplora →
                </button>
                <button
                  onClick={handleDiscover}
                  style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Nuovo gioco casuale"
                >
                  <Shuffle size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending */}
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: '40px' }}>
        <span>Trending:</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => navigate('/game/Helldivers 2')}>Helldivers 2</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => navigate('/game/Final Fantasy VII Rebirth')}>FFVII Rebirth</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => navigate('/game/Dragons Dogma 2')}>Dragon's Dogma 2</span>
      </div>
    </div>
  );
}
