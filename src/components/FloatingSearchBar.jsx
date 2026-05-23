import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Sparkles, Lock, User } from 'lucide-react';
import IAPService from '../services/IAPService';

export default function FloatingSearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false); // nascosta durante il caricamento
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const [tier, setTier] = useState(IAPService.getTier());
  const [aiMode, setAiMode] = useState(false);
  const [characterMode, setCharacterMode] = useState(false);

  useEffect(() => {
    return IAPService.subscribe((t) => setTier(t));
  }, []);

  // Nascosta per ~1.4s dopo ogni cambio pagina (copre il caricamento)
  useEffect(() => {
    setExpanded(false);
    setQuery('');
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Focus automatico quando si espande
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  // Disable since we use Navbar search now
  return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (aiMode && tier !== 'ultra') {
      window.dispatchEvent(new CustomEvent('open-settings'));
      return;
    }
    if (characterMode && tier === 'free') {
      window.dispatchEvent(new CustomEvent('open-settings'));
      return;
    }
    if (query.trim()) {
      if (characterMode) {
        navigate(`/character/${encodeURIComponent(query.trim())}`);
      } else {
        navigate(`/search/${encodeURIComponent(query.trim())}${aiMode ? '?ai=true' : ''}`);
      }
      setQuery('');
      setExpanded(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        width: 'min(92vw, 480px)',
        animation: 'slide-up-fade 0.4s ease',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: expanded
            ? 'var(--bg-secondary)'
            : 'rgba(40, 20, 80, 0.55)',  /* più trasparente */
          border: '1.5px solid',
          borderColor: expanded ? 'var(--accent-primary)' : 'rgba(109,40,217,0.45)',
          borderRadius: 'var(--radius-full)',
          boxShadow: expanded
            ? '0 8px 40px rgba(109,40,217,0.35), 0 2px 16px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(109,40,217,0.25), 0 2px 8px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
          padding: '0 8px 0 18px',
          height: '54px',
          cursor: expanded ? 'text' : 'pointer',
          transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
        onClick={() => !expanded && setExpanded(true)}
      >
        <Search
          size={20}
          color={expanded ? 'var(--accent-primary)' : 'rgba(200,160,255,0.9)'}
          style={{ flexShrink: 0, transition: 'color 0.25s' }}
        />

        {expanded ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder={characterMode ? "Cerca un personaggio..." : aiMode ? "Es: Voglio un gioco nello spazio lungo 20 ore..." : "Cerca un gioco..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%', border: 'none', background: 'transparent',
                color: 'var(--text-primary)', fontSize: '0.95rem',
                outline: 'none', minWidth: 0, marginTop: '2px'
              }}
            />
            {/* Modalità Search Toggles */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
              <div 
                onClick={(e) => { e.stopPropagation(); setAiMode(!aiMode); setCharacterMode(false); }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', 
                  fontSize: '0.65rem', fontWeight: 'bold', width: 'fit-content',
                  color: aiMode ? '#00f2fe' : 'var(--text-muted)',
                  opacity: aiMode ? 1 : 0.6, transition: 'all 0.2s', padding: '2px 0'
                }}
              >
                <Sparkles size={10} color={aiMode ? "#00f2fe" : "currentColor"} />
                Sommelier AI
                {tier !== 'ultra' && <Lock size={8} style={{ marginLeft: '2px' }} />}
              </div>
              <div 
                onClick={(e) => { e.stopPropagation(); setCharacterMode(!characterMode); setAiMode(false); }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', 
                  fontSize: '0.65rem', fontWeight: 'bold', width: 'fit-content',
                  color: characterMode ? 'var(--accent-primary)' : 'var(--text-muted)',
                  opacity: characterMode ? 1 : 0.6, transition: 'all 0.2s', padding: '2px 0'
                }}
              >
                <User size={10} color={characterMode ? "var(--accent-primary)" : "currentColor"} />
                Personaggi
                {tier === 'free' && <Lock size={8} style={{ marginLeft: '2px' }} />}
              </div>
            </div>
          </div>
        ) : (
          <span style={{
            flex: 1, fontSize: '1rem', fontWeight: '600',
            color: 'rgba(210,180,255,0.85)',
            letterSpacing: '0.01em', userSelect: 'none',
          }}>
            Cerca un gioco...
          </span>
        )}

        {expanded ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); setQuery(''); }}
            style={{
              flexShrink: 0, width: '36px', height: '36px',
              border: 'none', background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', transition: 'color 0.2s, background 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={15} />
          </button>
        ) : (
          <button
            type="submit"
            onClick={(e) => e.stopPropagation()}
            style={{
              flexShrink: 0, height: '38px', padding: '0 18px',
              border: 'none', background: 'rgba(109,40,217,0.6)',
              color: 'white', fontWeight: '700', fontSize: '0.85rem',
              cursor: 'pointer', borderRadius: 'var(--radius-full)',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(109,40,217,0.85)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(109,40,217,0.6)'}
          >
            Cerca
          </button>
        )}
      </form>
    </div>
  );
}
