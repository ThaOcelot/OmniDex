import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';

/**
 * Barra di ricerca flottante in basso — visibile solo fuori dalla Home.
 * Collassata mostra solo un pill con icona; espansa si allarga in un campo di testo.
 */
export default function FloatingSearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Nascosta sulla Home
  const isHome = location.pathname === '/';

  // Chiude la barra quando si cambia pagina
  useEffect(() => {
    setExpanded(false);
    setQuery('');
  }, [location.pathname]);

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
        display: 'flex',
        justifyContent: 'center',
        // Larghezza animata con transizione
        width: expanded ? 'min(92vw, 520px)' : '56px',
        transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          border: '1px solid',
          borderColor: expanded ? 'var(--accent-primary)' : 'var(--glass-border)',
          borderRadius: 'var(--radius-full)',
          boxShadow: expanded
            ? '0 8px 40px rgba(109,40,217,0.35), 0 2px 12px rgba(0,0,0,0.5)'
            : '0 4px 24px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          backdropFilter: 'blur(16px)',
          transition: 'border-color 0.25s, box-shadow 0.25s',
          height: '52px',
        }}
      >
        {/* Tasto icona lente — apre/chiude */}
        <button
          type={expanded ? 'submit' : 'button'}
          onClick={() => !expanded && setExpanded(true)}
          style={{
            flexShrink: 0,
            width: '52px',
            height: '52px',
            border: 'none',
            background: expanded ? 'var(--accent-gradient)' : 'transparent',
            color: expanded ? 'white' : 'var(--accent-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            transition: 'background 0.3s',
            flexShrink: 0,
          }}
          aria-label="Cerca"
        >
          <Search size={20} />
        </button>

        {/* Input — visibile solo quando espanso */}
        {expanded && (
          <input
            autoFocus
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
              padding: '0 8px',
              minWidth: 0,
            }}
          />
        )}

        {/* Tasto chiudi — visibile solo quando espanso */}
        {expanded && (
          <button
            type="button"
            onClick={() => { setExpanded(false); setQuery(''); }}
            style={{
              flexShrink: 0,
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              marginRight: '6px',
              transition: 'color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            aria-label="Chiudi ricerca"
          >
            <X size={16} />
          </button>
        )}
      </form>
    </div>
  );
}
