import { useState, useEffect, useCallback } from 'react';
import logoUrl from '../assets/logo.png';

// ─── Quiz Videoludici ─────────────────────────────────────────────────────────
const QUIZ = [
  {
    q: 'In quale anno è uscito il primo The Legend of Zelda?',
    options: ['1983', '1986', '1989', '1991'],
    correct: 1,
  },
  {
    q: 'Chi è il protagonista della saga di Dark Souls?',
    options: ['Il Senza Nome', "L'Infranto", 'Il Senzaluce', 'Il Prescelto'],
    correct: 1,
  },
  {
    q: 'Qual è la console più venduta di sempre?',
    options: ['PlayStation 2', 'Nintendo DS', 'Game Boy', 'PlayStation 4'],
    correct: 0,
  },
  {
    q: 'In quale città si svolge GTA V?',
    options: ['Vice City', 'Liberty City', 'Los Santos', 'San Fierro'],
    correct: 2,
  },
  {
    q: 'Come si chiama il villain principale di The Last of Us?',
    options: ['David', 'Henry', 'Joel', 'Marlene'],
    correct: 0,
  },
  {
    q: 'Quanti Pokémon esistevano nella prima generazione?',
    options: ['100', '149', '151', '152'],
    correct: 2,
  },
  {
    q: 'In quale gioco si trova la Master Sword?',
    options: ['Dark Souls', 'The Legend of Zelda', 'Final Fantasy', 'Elden Ring'],
    correct: 1,
  },
  {
    q: 'Chi ha creato la saga di Metal Gear?',
    options: ['Shigeru Miyamoto', 'Hideo Kojima', 'Hidetaka Miyazaki', 'Yoko Taro'],
    correct: 1,
  },
  {
    q: 'Che genere di gioco è Stardew Valley?',
    options: ['FPS', 'Battle Royale', 'Farming Sim / RPG', 'Racing'],
    correct: 2,
  },
  {
    q: 'Qual è il nome completo di Kratos in God of War?',
    options: ['Kratos Spartan', 'Solo "Kratos"', 'Kratos di Sparta', 'Kratos Blades'],
    correct: 1,
  },
  {
    q: 'In Minecraft, cosa serve per fare una Pozione di Forza?',
    options: ["Blaze Powder + Fiala d'Acqua", 'Blaze Powder + Verruca del Nether', 'Ghast + Verruca', 'Zucca + Blaze'],
    correct: 1,
  },
  {
    q: 'Quale studio ha sviluppato Elden Ring?',
    options: ['Capcom', 'FromSoftware', 'Bandai Namco', 'Square Enix'],
    correct: 1,
  },
  {
    q: 'Come si chiama il cavallo di Link in Ocarina of Time?',
    options: ['Roach', 'Epona', 'Torrent', 'Agro'],
    correct: 1,
  },
  {
    q: 'Che cosa è il "Soulslike"?',
    options: [
      'Un genere musicale nei videogiochi',
      'Un gioco con molte cutscene',
      'Un sottogenere RPG punitivo ispirato a Dark Souls',
      'Un tipo di co-op online',
    ],
    correct: 2,
  },
  {
    q: 'In quale anno è uscito il primo Half-Life?',
    options: ['1996', '1998', '2000', '2002'],
    correct: 1,
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function LoadingScreen({ title, subtitle }) {
  const [quizIndex] = useState(() => Math.floor(Math.random() * QUIZ.length));
  const [selected, setSelected] = useState(null); // indice risposta scelta
  const [revealed, setRevealed] = useState(false);
  const [logoTick, setLogoTick] = useState(0); // per animare il logo

  // Ruota il logo lentamente
  useEffect(() => {
    const t = setInterval(() => setLogoTick(v => v + 1), 100);
    return () => clearInterval(t);
  }, []);

  const quiz = QUIZ[quizIndex];

  const handleAnswer = useCallback((idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  }, [revealed]);

  const isCorrect = selected === quiz.correct;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '24px',
      gap: '0',
    }}>
      {/* Logo animato */}
      <div className="dynamic-loader" style={{ marginBottom: '28px' }}>
        <img
          src={logoUrl}
          alt="OmniDex Logo"
          style={{ width: '72px', height: '72px', objectFit: 'contain' }}
        />
      </div>

      {/* Testi del caricamento */}
      {title && (
        <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', marginBottom: '8px', fontWeight: '800', lineHeight: 1.2 }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '28px', maxWidth: '400px' }}>
          {subtitle}
        </p>
      )}

      {/* Separatore */}
      <div style={{ width: '48px', height: '3px', background: 'var(--accent-gradient)', borderRadius: '99px', margin: '8px auto 28px' }} />

      {/* Card Quiz */}
      <div
        className="glass-panel"
        style={{ maxWidth: '480px', width: '100%', padding: '24px', textAlign: 'left' }}
      >
        {/* Header quiz */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{
            background: 'var(--accent-gradient)', borderRadius: 'var(--radius-full)',
            padding: '3px 12px', fontSize: '0.72rem', fontWeight: '800', color: 'white',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            🎮 Quiz
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {revealed ? (isCorrect ? '✅ Corretto!' : '❌ Risposta sbagliata') : 'Indovina mentre carichi'}
          </span>
        </div>

        {/* Domanda */}
        <p style={{ fontSize: '1rem', fontWeight: '700', lineHeight: '1.5', marginBottom: '18px', color: 'var(--text-primary)' }}>
          {quiz.q}
        </p>

        {/* Opzioni */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {quiz.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.04)';
            let border = 'var(--glass-border)';
            let color = 'var(--text-secondary)';

            if (revealed) {
              if (i === quiz.correct) {
                bg = 'rgba(16,185,129,0.15)';
                border = 'rgba(16,185,129,0.5)';
                color = '#10B981';
              } else if (i === selected) {
                bg = 'rgba(239,68,68,0.12)';
                border = 'rgba(239,68,68,0.4)';
                color = '#ef4444';
              }
            } else if (selected === i) {
              bg = 'rgba(109,40,217,0.15)';
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={revealed}
                style={{
                  width: '100%', textAlign: 'left', padding: '11px 16px',
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: 'var(--radius-md)', color,
                  fontSize: '0.9rem', fontWeight: revealed && i === quiz.correct ? '700' : '400',
                  cursor: revealed ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: revealed && i === quiz.correct
                    ? '#10B981'
                    : revealed && i === selected
                    ? '#ef4444'
                    : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: '800', color: 'white',
                  transition: 'background 0.2s',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Messaggio post-risposta */}
        {revealed && (
          <p style={{
            marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)',
            fontStyle: 'italic', textAlign: 'center',
            animation: 'animate-fade-in 0.4s ease',
          }}>
            {isCorrect
              ? '🏆 Ottima risposta! Il caricamento continua...'
              : `💡 La risposta corretta era: "${quiz.options[quiz.correct]}"`}
          </p>
        )}
      </div>
    </div>
  );
}
