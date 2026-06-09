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
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px', background: 'rgba(109, 40, 217, 0.1)',
        border: '1px solid rgba(109, 40, 217, 0.3)', borderRadius: 'var(--radius-full)',
        color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '24px', fontSize: '0.9rem'
      }}>
        <Sparkles size={16} />
        <span>Potenziato dall'IA</span>
      </div>

      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
        L'Enciclopedia Intelligente dei Videogiochi
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 3vw, 1.15rem)', maxWidth: '650px', marginBottom: '40px', lineHeight: '1.6' }}>
        Il tuo hub local-first per esplorare in profondità qualsiasi titolo. Trova all'istante biografie dettagliate dei personaggi, approfondimenti sulle trame, analisi di gameplay e ultime notizie in tempo reale.
      </p>

      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder={searchType === 'character' ? "Cerca un personaggio..." : (aiMode ? "Es: Voglio un gioco nello spazio lungo 20 ore..." : "Cerca un videogioco...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '20px 24px', paddingLeft: '56px',
              borderRadius: 'var(--radius-full)', border: '2px solid rgba(255, 255, 255, 0.1)',
              background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: '1.2rem',
              outline: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={20} color="var(--text-secondary)" />
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', marginLeft: '4px' }}></div>
          </div>
          <button type="submit" className="btn-primary" style={{ position: 'absolute', right: '10px', top: '10px', bottom: '10px', padding: '0 24px' }}>
            Cerca
          </button>
        </div>
        
        {/* Toggles Container */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          
          {/* Toggle Type */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', overflow: 'hidden'
          }}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setSearchType('game'); }}
              style={{
                padding: '6px 14px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                background: searchType === 'game' ? 'var(--accent-primary)' : 'transparent',
                color: searchType === 'game' ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              Giochi
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setSearchType('character'); }}
              style={{
                padding: '6px 14px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                background: searchType === 'character' ? 'var(--accent-ultra)' : 'transparent',
                color: searchType === 'character' ? '#002538' : 'var(--text-secondary)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              Personaggi {tier !== 'ultra' && <Lock size={12} />}
            </button>
          </div>

          {/* Toggle Modalità Sommelier */}
          {searchType === 'game' && (
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAiMode(!aiMode); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', 
                fontSize: '0.85rem', fontWeight: 'bold', width: 'fit-content',
                color: aiMode ? 'var(--accent-ultra)' : 'var(--text-secondary)',
                background: aiMode ? 'rgba(0, 242, 254, 0.1)' : 'var(--bg-glass)',
                border: aiMode ? '1px solid var(--accent-ultra)' : '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                transition: 'all 0.2s ease',
                boxShadow: aiMode ? '0 0 10px rgba(0, 242, 254, 0.2)' : 'var(--shadow-glass)'
              }}
            >
              <Sparkles size={14} color={aiMode ? "var(--accent-ultra)" : "currentColor"} />
              Sommelier AI
              {tier !== 'ultra' && <Lock size={12} style={{ marginLeft: '4px' }} />}
            </button>
          )}
        </div>
      </form>



      {/* Pulsanti Azione Rapida */}
      <div style={{ marginTop: '24px', width: '100%', maxWidth: '600px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
        
        <button
          onClick={handlePersonalizedSuggestions}
          style={{
            width: '100%', padding: '14px 24px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid rgba(0,242,254,0.4)',
            background: 'rgba(0,242,254,0.08)',
            color: 'var(--accent-ultra)',
            fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.18)'; e.currentTarget.style.borderColor = 'var(--accent-ultra)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.4)'; }}
        >
          <Sparkles size={20} />
          💡 Consigliati per me
          {tier !== 'ultra' && <Lock size={14} style={{ marginLeft: '4px' }} />}
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDiscover}
            disabled={discovering}
            style={{
              flex: 1, padding: '14px 16px',
              borderRadius: 'var(--radius-full)',
              border: '2px solid rgba(109,40,217,0.4)',
              background: discovering ? 'rgba(109,40,217,0.05)' : 'rgba(109,40,217,0.08)',
              color: discovering ? 'var(--text-muted)' : 'var(--accent-primary)',
              fontWeight: '700', fontSize: '0.95rem', cursor: discovering ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={e => { if (!discovering) { e.currentTarget.style.background = 'rgba(109,40,217,0.18)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.08)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.4)'; }}
          >
            <Shuffle size={18} style={{ animation: discovering ? 'spin-anim 0.7s linear infinite' : 'none' }} />
            {discovering ? 'Ricerca...' : '🎲 Gioco del Giorno'}
          </button>

        </div>
      </div>

      {/* Carosello Prossimo Futuro */}
      {upcomingNear.length > 0 && (
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '40px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 10px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
              <Sparkles size={20} color="var(--accent-primary)" />
              Prossimamente (Nei prossimi 30 giorni)
            </h3>
          </div>
          
          <div id="upcoming-near-carousel" style={{ 
            display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', padding: '0 10px',
            scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }} className="hide-scrollbar">
            {upcomingNear.map((game) => (
              <div 
                key={game.id}
                onClick={() => navigate(`/game/${encodeURIComponent(game.name)}`, { state: { game: { id: game.id } } })}
                style={{
                  minWidth: '160px', width: '160px', scrollSnapAlign: 'start', cursor: 'pointer',
                  background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--glass-border)',
                  overflow: 'hidden', position: 'relative', transition: 'transform 0.2s',
                  boxShadow: 'var(--shadow-glass)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                  <img 
                    src={game.background_image || 'https://via.placeholder.com/160x220?text=No+Cover'} 
                    alt={game.name} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 12px 12px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                  }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {game.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>
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
