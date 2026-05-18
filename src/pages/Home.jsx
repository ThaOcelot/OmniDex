import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Shuffle, X, Star } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';
import RAWGService from '../services/RAWGService';

export default function Home() {
  const [query, setQuery] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [discoveredGame, setDiscoveredGame] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
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

      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
        <input
          type="text"
          placeholder=""
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%', padding: '20px 24px', paddingLeft: '60px',
            borderRadius: 'var(--radius-full)', border: '2px solid rgba(255, 255, 255, 0.1)',
            background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: '1.2rem',
            outline: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        <Search size={24} color="var(--text-secondary)" style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)' }} />
        <button type="submit" className="btn-primary" style={{ position: 'absolute', right: '10px', top: '10px', bottom: '10px', padding: '0 24px' }}>
          Cerca
        </button>
      </form>

      {/* Discovery Button */}
      <div style={{ marginTop: '24px', width: '100%', maxWidth: '600px' }}>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          style={{
            width: '100%', padding: '14px 24px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid rgba(109,40,217,0.4)',
            background: discovering ? 'rgba(109,40,217,0.05)' : 'rgba(109,40,217,0.08)',
            color: discovering ? 'var(--text-muted)' : 'var(--accent-primary)',
            fontWeight: '700', fontSize: '1rem', cursor: discovering ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.3s ease',
            animation: !discovering ? 'pulse-glow 3s ease-in-out infinite' : 'none',
          }}
          onMouseOver={e => { if (!discovering) { e.currentTarget.style.background = 'rgba(109,40,217,0.18)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.08)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.4)'; }}
        >
          <Shuffle size={20} style={{ animation: discovering ? 'spin-anim 0.7s linear infinite' : 'none' }} />
          {discovering ? 'Sto cercando una gemma nascosta...' : '🎲 Scopri un Gioco a Caso'}
        </button>
      </div>

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
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>Trending:</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => navigate('/game/Helldivers 2')}>Helldivers 2</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => navigate('/game/Final Fantasy VII Rebirth')}>FFVII Rebirth</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => navigate('/game/Dragons Dogma 2')}>Dragon's Dogma 2</span>
      </div>
    </div>
  );
}
