import { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, Rocket } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';

export default function ChangelogPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem('last_seen_version');
    if (lastSeen !== CHANGELOG.version) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('last_seen_version', CHANGELOG.version);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '30px',
        border: '1px solid var(--accent-primary)',
        boxShadow: '0 0 40px rgba(109, 40, 217, 0.3)'
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div className="dynamic-loader" style={{ marginBottom: '15px' }}>
            <Rocket size={48} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Novità in OmniDex</h2>
          <div style={{ 
            display: 'inline-block', 
            background: 'var(--accent-gradient)', 
            padding: '4px 12px', 
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            Versione {CHANGELOG.version} ({CHANGELOG.stage})
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.1em' }}>Patch Notes - {CHANGELOG.date}</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {CHANGELOG.changes.map((change, index) => (
              <li key={index} style={{ 
                display: 'flex', 
                gap: '12px', 
                fontSize: '1rem', 
                lineHeight: '1.5',
                color: 'var(--text-secondary)'
              }}>
                <ChevronRight size={18} style={{ flexShrink: 0, marginTop: '4px', color: 'var(--accent-primary)' }} />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleClose}
          style={{ width: '100%', padding: '15px' }}
        >
          Ho capito, andiamo!
        </button>
      </div>
    </div>
  );
}
