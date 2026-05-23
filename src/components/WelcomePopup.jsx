import { useState, useEffect } from 'react';
import logoUrl from '../assets/logo.png';

const WELCOME_KEY = 'omnidex_welcome_shown';

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem(WELCOME_KEY);
    if (!alreadyShown) {
      // Piccolo ritardo per far caricare l'app prima di mostrare il popup
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleClose = () => {
    setClosing(true);
    localStorage.setItem(WELCOME_KEY, 'true');
    setTimeout(() => setVisible(false), 350);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: closing ? 'fadeOut 0.35s ease forwards' : 'fadeIn 0.4s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary, #1a1a2e)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: 'clamp(28px, 6vw, 48px)',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: closing ? 'slideDown 0.35s ease forwards' : 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
      >
        {/* Logo animato */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
          border: '2px solid rgba(139,92,246,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 30px rgba(139,92,246,0.3)',
        }}>
          <img src={logoUrl} alt="OmniDex" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
        </div>

        {/* Titolo di benvenuto */}
        <h2 style={{
          fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
          fontWeight: '800',
          margin: '0 0 8px',
          lineHeight: '1.2',
        }}>
          Benvenuto su{' '}
          <span style={{
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            OmniDex
          </span>
          !
        </h2>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary, #9ca3af)',
          margin: '0 0 28px',
          lineHeight: '1.6',
        }}>
          L'enciclopedia intelligente dei videogiochi. Cerca qualsiasi titolo e scopri trama, gameplay, personaggi, notizie e tanto altro.
        </p>

        {/* Feature highlights */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
          marginBottom: '28px',
          padding: '18px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {[
            { emoji: '🔍', text: 'Cerca tra migliaia di videogiochi' },
            { emoji: '🤖', text: 'Contenuti generati dall\'intelligenza artificiale' },
            { emoji: '🔔', text: 'Notifiche per le notizie dei tuoi preferiti' },
            { emoji: '⭐', text: 'Rimuovi la pubblicità con OmniDex Pro' },
          ].map(({ emoji, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>{emoji}</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: '500' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            color: '#fff',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)'; }}
        >
          Inizia a esplorare 🎮
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes slideDown { from { opacity: 1; transform: translateY(0) scale(1) } to { opacity: 0; transform: translateY(20px) scale(0.97) } }
        @keyframes pro-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(245,200,66,0.4), 0 2px 4px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 18px rgba(245,200,66,0.8), 0 2px 8px rgba(0,0,0,0.4); }
        }
      `}</style>
    </div>
  );
}
