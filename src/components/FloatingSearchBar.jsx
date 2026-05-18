import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';

/**
 * Barra di ricerca flottante in basso.
 * Collassata: pill larga con placeholder visibile.
 * Espansa: campo di testo attivo con tastiera aperta.
 */
export default function FloatingSearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Chiude quando si cambia pagina
  useEffect(() => {
    setExpanded(false);
    setQuery('');
  }, [location.pathname]);

  // Focus automatico quando si espande
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  if (isHome) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
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
            : 'rgba(109, 40, 217, 0.92)',
          border: '1.5px solid',
          borderColor: expanded ? 'var(--accent-primary)' : 'transparent',
          borderRadius: 'var(--radius-full)',
          boxShadow: expanded
            ? '0 8px 40px rgba(109,40,217,0.4), 0 2px 16px rgba(0,0,0,0.5)'
            : '0 6px 28px rgba(109,40,217,0.5), 0 2px 12px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          padding: '0 8px 0 18px',
          height: '54px',
          cursor: expanded ? 'text' : 'pointer',
          transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
        onClick={() => !expanded && setExpanded(true)}
      >
        {/* Icona lente */}
        <Search
          size={20}
          color={expanded ? 'var(--accent-primary)' : 'rgba(255,255,255,0.85)'}
          style={{ flexShrink: 0, transition: 'color 0.25s' }}
        />

        {/* Input / Placeholder */}
        {expanded ? (
          <input
            ref={inputRef}
            type="text"
            placeholder="Cerca un gioco..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              minWidth: 0,
            }}
          />
        ) : (
          <span style={{
            flex: 1,
            fontSize: '1rem',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.01em',
            userSelect: 'none',
          }}>
            Cerca un gioco...
          </span>
        )}

        {/* Tasto azione destra */}
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
            aria-label="Chiudi ricerca"
          >
            <X size={15} />
          </button>
        ) : (
          <button
            type="submit"
            onClick={(e) => e.stopPropagation()}
            style={{
              flexShrink: 0, height: '38px', padding: '0 18px',
              border: 'none', background: 'rgba(255,255,255,0.2)',
              color: 'white', fontWeight: '700', fontSize: '0.85rem',
              cursor: 'pointer', borderRadius: 'var(--radius-full)',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            Cerca
          </button>
        )}
      </form>
    </div>
  );
}
