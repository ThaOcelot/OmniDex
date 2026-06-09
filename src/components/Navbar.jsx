import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, Calendar, Search, Wand } from 'lucide-react';
import logoUrl from '../assets/logo.png';
import IAPService from '../services/IAPService';
import SosGamerModal from './SosGamerModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tier, setTier] = useState(IAPService.getTier());
  const [searchOpen, setSearchOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const isHome = location.pathname === '/';

  useEffect(() => {
    const unsubscribe = IAPService.subscribe((newTier) => setTier(newTier));
    return unsubscribe;
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav style={{ padding: '16px 0', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-glass)', position: 'sticky', top: '0px', zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Logo OmniDex sempre visibile con Versione sotto */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={logoUrl} 
                alt="OmniDex Logo" 
                style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: '1' }}>
                  <span className="text-gradient">Omni</span>Dex
                </span>
                {/* Badge ULTRA o PRO */}
                {tier === 'ultra' && (
                  <span style={{
                    fontSize: '0.55rem',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    padding: '2px 6px',
                    borderRadius: '20px',
                    background: 'var(--accent-ultra-gradient)',
                    color: '#002538',
                    boxShadow: '0 0 10px rgba(0, 242, 254, 0.5), 0 2px 4px rgba(0,0,0,0.3)',
                    textTransform: 'uppercase',
                    animation: 'pro-glow 2.5s ease-in-out infinite',
                  }}>
                    💎 ULTRA
                  </span>
                )}
                {tier === 'pro' && (
                  <span style={{
                    fontSize: '0.55rem',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    padding: '2px 6px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #f5c842 0%, #e8a000 50%, #f5c842 100%)',
                    color: '#3a2000',
                    boxShadow: '0 0 10px rgba(245, 200, 66, 0.5), 0 2px 4px rgba(0,0,0,0.3)',
                    textTransform: 'uppercase',
                    animation: 'pro-glow 2.5s ease-in-out infinite',
                  }}>
                    ★ PRO
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {!isHome && (
              <button 
                onClick={() => setSearchOpen(true)} 
                title="Cerca" 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', borderRadius: '50%', width: '36px', height: '36px', transition: 'all 0.2s' }}
              >
                <Search size={18} />
              </button>
            )}
            <button 
              onClick={() => {
                if (tier === 'ultra') {
                  setSosModalOpen(true);
                } else {
                  window.dispatchEvent(new CustomEvent('open-settings'));
                  alert("SOS Gamer è una funzionalità esclusiva per gli utenti ULTRA.");
                }
              }} 
              title="SOS Gamer" 
              style={{ background: 'var(--accent-ultra-gradient)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002538', borderRadius: '50%', width: '36px', height: '36px', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(0,242,254,0.5)' }}
            >
              <Wand size={18} />
            </button>
            <Link to="/release-radar" className="btn-icon" title="Release Radar">
              <Calendar size={20} />
            </Link>
            <Link to="/favorites" className="btn-icon" title="Raccolta & Profilo">
              <User size={20} />
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

      {/* Overlay Ricerca Globale Fuori Dalla Nav */}
      {searchOpen && !isHome && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <button 
            onClick={() => setSearchOpen(false)}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
              width: '40px', height: '40px', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            X
          </button>
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
            <input 
              autoFocus 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Cerca un gioco o un personaggio..." 
              style={{ 
                width: '100%', padding: '20px 24px', paddingLeft: '60px',
                borderRadius: 'var(--radius-full)', border: '2px solid var(--accent-primary)',
                background: 'var(--bg-glass)', color: 'white', fontSize: '1.2rem',
                outline: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }} 
            />
            <Search size={24} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
          </form>
        </div>
      )}

      {sosModalOpen && (
        <SosGamerModal onClose={() => setSosModalOpen(false)} />
      )}
    </>
  );
}
