import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Calendar } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';
import logoUrl from '../assets/logo.png';

export default function Navbar() {
  const location = useLocation();

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


        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/upcoming" className="btn-icon" title="Uscite in arrivo">
            <Calendar size={20} />
          </Link>
          <Link to="/favorites" className="btn-icon" title="Profilo & Preferiti">
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
  );
}
