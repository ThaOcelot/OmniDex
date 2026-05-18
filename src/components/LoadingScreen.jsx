import { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../data/loadingMessages';
import logoUrl from '../assets/logo.png';

export default function LoadingScreen({ title, subtitle }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState('fade-in');

  useEffect(() => {
    // Scegli un messaggio casuale all'avvio
    const initialIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    setMessageIndex(initialIndex);

    // Ruota i messaggi ogni 3.5 secondi
    const interval = setInterval(() => {
      setFade('fade-out');
      
      setTimeout(() => {
        setMessageIndex(prev => {
          let next;
          do {
            next = Math.floor(Math.random() * LOADING_MESSAGES.length);
          } while (next === prev); // Evita di mostrare lo stesso messaggio due volte di fila
          return next;
        });
        setFade('fade-in');
      }, 500); // Tempo dell'animazione CSS
      
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div className="dynamic-loader" style={{ marginBottom: '40px' }}>
        <img 
          src={logoUrl} 
          alt="OmniDex Logo" 
          style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
        />
      </div>
      
      {title && (
        <h2 style={{ fontSize: '2.2rem', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '800' }}>
          {title}
        </h2>
      )}
      
      {subtitle && (
        <p style={{ color: 'var(--accent-secondary)', fontSize: '1.2rem', marginBottom: '30px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {subtitle}
        </p>
      )}

      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p 
          style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.2rem', 
            fontStyle: 'italic',
            maxWidth: '600px',
            lineHeight: '1.6',
            transition: 'opacity 0.5s ease',
            opacity: fade === 'fade-in' ? 1 : 0
          }}
        >
          "{LOADING_MESSAGES[messageIndex]}"
        </p>
      </div>
    </div>
  );
}
