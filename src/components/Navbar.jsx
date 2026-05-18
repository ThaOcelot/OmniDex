import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Settings, Calendar } from 'lucide-react';
import { useState } from 'react';
import { CHANGELOG } from '../data/changelog';
import logoUrl from '../assets/logo.png';

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
    <nav style={{ padding: '16px 0', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-glass)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo OmniDex sempre visibile con Versione sotto */}
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={logoUrl} 
              alt="OmniDex Logo" 
              style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
            />
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
              <span className="text-gradient">Omni</span>Dex
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '38px', marginTop: '1px', fontWeight: '600', opacity: 0.7, letterSpacing: '0.5px' }}>
            v{CHANGELOG.version}
          </span>
        </Link>

        {/* Cerca visibile solo nelle sottopagine */}
        {!isHomePage && (
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', margin: '0 20px', position: 'relative' }}>
            <input
              type="text"
              placeholder="cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 18px',
                paddingLeft: '40px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </form>
        )}

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/upcoming" className="btn-icon" title="Uscite in arrivo">
            <Calendar size={20} />
          </Link>
          <Link to="/favorites" className="btn-icon" title="Preferiti">
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
