import { useState, useEffect } from 'react';
import { X, Sun, Moon, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';

export default function SettingsPopup({ onClose }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState('');

  // Sincronizza il tema con l'attributo data-theme del documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const handleManualUpdateCheck = async () => {
    setChecking(true);
    setCheckResult('');
    
    // Piccolo ritardo di 1.5 secondi per dare l'effetto scansione/ricerca
    await new Promise(resolve => setTimeout(resolve, 1500));

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Forza la ricerca di nuovi aggiornamenti sul Service Worker
          await registration.update();
          
          if (registration.waiting) {
            setCheckResult('update_found');
          } else {
            setCheckResult('up_to_date');
          }
        } else {
          setCheckResult('up_to_date');
        }
      } catch (err) {
        console.warn('Errore durante la ricerca degli aggiornamenti:', err);
        setCheckResult('up_to_date');
      }
    } else {
      setCheckResult('up_to_date');
    }
    setChecking(false);
  };

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 30000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', backdropFilter: 'blur(8px)',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '92%', maxWidth: '380px',
          padding: '20px', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          background: 'var(--bg-secondary)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }} className="text-gradient">
            Impostazioni
          </h3>
          <button 
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            onClick={onClose}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tema Scuro / Chiaro */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
            {theme === 'dark' ? <Moon size={16} color="var(--accent-primary)" /> : <Sun size={16} color="var(--accent-primary)" />}
            <span>Tema dell'Applicazione</span>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', padding: '3px', border: '1px solid var(--glass-border)', boxSizing: 'border-box' }}>
            <button 
              onClick={() => setTheme('dark')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: theme === 'dark' ? 'var(--accent-gradient)' : 'transparent',
                color: theme === 'dark' ? 'white' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Moon size={14} />
              <span>Tema Scuro</span>
            </button>
            <button 
              onClick={() => setTheme('light')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: theme === 'light' ? 'var(--accent-gradient)' : 'transparent',
                color: theme === 'light' ? 'white' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Sun size={14} />
              <span>Tema Chiaro</span>
            </button>
          </div>
        </div>

        {/* Aggiornamenti */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '10px', fontSize: '0.95rem' }}>
            Aggiornamento Software
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px', boxSizing: 'border-box' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Versione Installata</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                v{CHANGELOG.version} <span style={{ color: 'white', fontSize: '0.75rem', background: 'var(--accent-gradient)', padding: '1px 6px', borderRadius: 'var(--radius-full)', marginLeft: '4px' }}>{CHANGELOG.stage}</span>
              </div>
            </div>
            <button 
              disabled={checking}
              onClick={handleManualUpdateCheck}
              style={{
                background: checking ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: checking ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => !checking && (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseOut={e => !checking && (e.currentTarget.style.background = 'var(--accent-primary)')}
            >
              <RefreshCw size={12} className={checking ? 'spin-anim' : ''} />
              {checking ? 'Ricerca...' : 'Cerca'}
            </button>
          </div>

          {/* Feedback Ricerca */}
          {checkResult === 'up_to_date' && (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle size={14} />
              <span>OmniDex è già all'ultima versione!</span>
            </div>
          )}

          {checkResult === 'update_found' && (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', background: 'rgba(109,40,217,0.08)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', border: '1px solid rgba(109,40,217,0.2)' }}>
              <AlertTriangle size={14} />
              <span>Nuovo aggiornamento trovato!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
