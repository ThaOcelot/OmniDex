import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Gamepad2, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-glass)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {!isHomePage ? (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gamepad2 size={32} color="var(--accent-primary)" />
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              <span className="text-gradient">Omni</span>Dex
            </span>
          </Link>
        ) : <div />}

        {!isHomePage && (
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', margin: '0 20px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Cerca il gioco (es. The Witcher, GTA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 20px',
                paddingLeft: '45px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
            <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          </form>
        )}

        <div style={{ display: 'flex', gap: '15px', marginLeft: isHomePage ? 'auto' : '0' }}>
          <Link to="/favorites" className="btn-icon">
            <Heart size={20} />
          </Link>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))} 
            className="btn-icon" 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
