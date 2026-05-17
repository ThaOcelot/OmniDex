import { useState, useEffect } from 'react';
import { ArrowUpCircle, RefreshCw, XCircle } from 'lucide-react';

export default function UpdatePopup() {
  const [show, setShow] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Registra il Service Worker con scope assoluto dinamico per evitare blocchi a seconda della route
      const isGitHubPages = window.location.hostname.includes('github.io');
      const swUrl = isGitHubPages ? '/OmniDex/sw.js' : '/sw.js';
      const swScope = isGitHubPages ? '/OmniDex/' : '/';

      navigator.serviceWorker.register(swUrl, { scope: swScope }).then((reg) => {
        setRegistration(reg);

        // Se c'è già un worker in attesa, mostra subito il popup
        if (reg.waiting) {
          setShow(true);
        }

        // Ascolta futuri aggiornamenti
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nuovo aggiornamento disponibile ed installato in background
              setShow(true);
            }
          });
        });
      }).catch((err) => {
        console.warn('🔔 SW registration failed:', err);
      });

      // Ascolta il cambio del controller (attivazione del nuovo SW) e ricarica la pagina
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Invia il messaggio al Service Worker in attesa di attivarsi
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShow(false);
  };

  const handleReject = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 99999,
      maxWidth: '400px',
      width: 'calc(100% - 48px)',
      boxShadow: 'var(--shadow-glass)',
      animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <div className="glass-panel" style={{
        padding: '24px',
        border: '1px solid var(--accent-primary)',
        background: 'rgba(15, 15, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.15) 0%, transparent 60%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              background: 'rgba(109, 40, 217, 0.15)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                Aggiornamento Disponibile!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Una nuova versione di OmniDex è pronta con nuove feature e patch notes. Vuoi installarla ora?
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleReject}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              <XCircle size={16} /> Più Tardi
            </button>
            
            <button 
              onClick={handleUpdate}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} style={{ animation: 'spin 4s linear infinite' }} /> Aggiorna Ora
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
