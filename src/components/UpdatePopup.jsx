import { useState, useEffect } from 'react';
import { ArrowUpCircle, RefreshCw, XCircle } from 'lucide-react';
import UpdateService from '../services/UpdateService';

export default function UpdatePopup() {
  const [show, setShow] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    // Controllo aggiornamenti all'avvio dell'app
    const checkUpdate = async () => {
      const result = await UpdateService.checkForUpdate();
      if (result.hasUpdate) {
        setUpdateInfo(result);
        setShow(true);
      }
    };

    // Ritardo leggermente il check per non rallentare il caricamento iniziale
    const timer = setTimeout(checkUpdate, 3000);

    const handleSimulate = () => {
      setUpdateInfo({
        hasUpdate: true,
        buildTime: String(Date.now()),
        commit: 'abc1234_simulated',
        version: '0.1.6.0'
      });
      setShow(true);
    };

    window.addEventListener('simulate-update', handleSimulate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('simulate-update', handleSimulate);
    };
  }, []);

  const handleUpdate = () => {
    if (updateInfo) {
      if (updateInfo.commit === 'abc1234_simulated') {
        window.location.reload();
      } else {
        UpdateService.applyUpdate(updateInfo.buildTime);
      }
    }
  };

  const handleReject = () => {
    if (updateInfo) {
      UpdateService.dismissUpdate(updateInfo.buildTime);
    }
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
                Una nuova versione di OmniDex è pronta. Vuoi installarla ora? Riavvierà l'app in un attimo.
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
              <RefreshCw size={16} /> Aggiorna Ora
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
