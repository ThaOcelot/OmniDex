import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, Calendar, Search, Wand, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <nav style={{ padding: '14px 0', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-glass)', position: 'sticky', top: '0px', zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <img 
              src={logoUrl} 
              alt="OmniDex Logo" 
              style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                <span className="text-gradient">Omni</span>Dex
              </span>
              {tier === 'ultra' && <span className="navbar-badge ultra">💎 Ultra</span>}
              {tier === 'pro' && <span className="navbar-badge pro">★ Pro</span>}
            </div>
          </Link>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {!isHome && (
              <button 
                onClick={() => setSearchOpen(true)} 
                title="Cerca" 
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', borderRadius: '50%', width: '36px', height: '36px', transition: 'all 0.2s' }}
              >
                <Search size={16} />
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
              style={{ background: 'var(--accent-ultra-gradient)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002538', borderRadius: '50%', width: '36px', height: '36px', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(0,242,254,0.3)' }}
            >
              <Wand size={16} />
            </button>
            <Link to="/release-radar" className="btn-icon" style={{ width: '36px', height: '36px' }} title="Release Radar">
              <Calendar size={18} />
            </Link>
            <Link to="/favorites" className="btn-icon" style={{ width: '36px', height: '36px' }} title="Raccolta & Profilo">
              <User size={18} />
            </Link>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))} 
              className="btn-icon" 
              style={{ width: '36px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </nav>
      {/* Overlay Ricerca Globale Fuori Dalla Nav */}
      <AnimatePresence>
        {searchOpen && !isHome && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              zIndex: 9999, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
            
            <button 
              onClick={() => setSearchOpen(false)}
              style={{
                position: 'absolute', top: '30px', right: '30px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                borderRadius: '50%', width: '48px', height: '48px', color: 'white', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <X size={24} />
            </button>
            
            <motion.form 
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onSubmit={handleSearch} 
              style={{ width: '100%', maxWidth: '600px', position: 'relative' }}
            >
              <input 
                autoFocus 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="Cerca un gioco o un personaggio..." 
                style={{ 
                  width: '100%', padding: '22px 24px', paddingLeft: '64px',
                  borderRadius: 'var(--radius-full)', border: '2px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.25rem',
                  outline: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(10px)', transition: 'border-color 0.2s'
                }} 
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <Search size={26} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {sosModalOpen && (
        <SosGamerModal onClose={() => setSosModalOpen(false)} />
      )}
    </>
  );
}
