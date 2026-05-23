import React, { useState, useEffect } from 'react';
import IAPService from '../services/IAPService';
import AdService from '../services/AdService';
import { Sparkles, X } from 'lucide-react';

const AdBanner = () => {
  const [isPro, setIsPro] = useState(IAPService.isPro());
  const [showWebMockup, setShowWebMockup] = useState(false);

  useEffect(() => {
    // Sottoscrizione allo stato Pro
    const unsubscribePro = IAPService.subscribe((proState) => {
      setIsPro(proState);
      if (proState) {
        setShowWebMockup(false);
      }
    });

    // Ascolta gli eventi di visibilità del banner (per mockup desktop)
    const handleAdVisibility = (e) => {
      if (!isPro) {
        setShowWebMockup(e.detail);
      }
    };

    window.addEventListener('ad-banner-visibility', handleAdVisibility);

    // Avvia il caricamento del banner
    AdService.showBanner();

    return () => {
      unsubscribePro();
      window.removeEventListener('ad-banner-visibility', handleAdVisibility);
      AdService.hideBanner();
    };
  }, [isPro]);

  if (isPro) return null;

  const handleUpgradeClick = () => {
    // Trova o attiva l'apertura del popup delle impostazioni per passare a Pro
    window.dispatchEvent(new CustomEvent('open-settings'));
  };

  const isNative = window.Capacitor?.isNativePlatform?.();

  // Se siamo su piattaforma nativa, AdMob gestisce il banner nativo come overlay fisso in fondo allo schermo.
  // Il paddingBottom dell'app-wrapper in App.jsx è l'unico spazio riservato — non serve un div nel flusso.
  if (isNative) {
    return null;
  }

  // Se siamo su desktop/browser e showWebMockup è vero, mostriamo un banner simulato di design.
  if (!showWebMockup) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(139, 92, 246, 0.3)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div 
          style={{ 
            background: 'var(--accent-gradient)', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '0.65rem', 
            fontWeight: 'bold', 
            color: 'white',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          Annuncio
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
          Vuoi rimuovere le pubblicità? Passa a <strong style={{ color: 'white' }}>OmniDex Pro</strong> e sblocca l'esperienza pura!
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={handleUpgradeClick}
          style={{
            background: 'var(--accent-gradient)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            padding: '6px 14px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Sparkles size={12} /> Scopri Pro
        </button>

        <button
          onClick={() => setShowWebMockup(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'color 0.2s, background 0.2s'
          }}
          onMouseOver={e => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdBanner;
