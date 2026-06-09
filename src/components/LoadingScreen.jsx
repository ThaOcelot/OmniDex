import { useState, useEffect, useCallback, useMemo } from 'react';
import logoUrl from '../assets/logo.png';
import { loadQuizState, saveQuizState } from '../services/QuizService';

import ALL_QUIZ from '../data/quizzes.json';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

function seededShuffle(arr, seed) {
  const a = [...arr.keys()]; // indici dell'array originale
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a; // ritorna gli indici mescolati
}



// ─── Componente ───────────────────────────────────────────────────────────────
export default function LoadingScreen({ title, subtitle }) {
  const week = getWeekNumber();
  const year = new Date().getFullYear();

  // Ordine casuale ma stabile per la sessione o in generale
  const weeklyOrder = useMemo(() => seededShuffle(ALL_QUIZ, week * 100 + year), [week, year]);

  // Stato persistente: statistiche totali
  const [quizState, setQuizState] = useState(() => {
    const saved = loadQuizState();
    return { seen: saved?.seen || [], stats: saved?.stats || { correct: 0, total: 0 } };
  });

  // Ordine degli indici (usiamo un seed fisso così l'ordine cambia solo ai riavvii o mai)
  // Per ruotare di continuo usiamo semplicemente lo stato `seen`
  const nextQuestionIndex = useMemo(() => {
    // Mescoliamo i quiz, usando un po' di entropia o un seme base
    const order = seededShuffle(ALL_QUIZ, 42); // seed statico o variabile
    const unseen = order.filter(i => !quizState.seen.includes(i));
    if (unseen.length === 0) return order[Math.floor(Math.random() * order.length)]; // se tutti visti, casuale
    return unseen[0];
  }, [quizState.seen]);

  const [currentQ, setCurrentQ] = useState(nextQuestionIndex);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const quiz = ALL_QUIZ[currentQ];

  const handleAnswer = useCallback((idx) => {
    if (revealed || transitioning) return;
    const isCorrect = idx === quiz.correct;

    const newState = {
      seen: [...quizState.seen, currentQ],
      stats: {
        correct: quizState.stats.correct + (isCorrect ? 1 : 0),
        total: quizState.stats.total + 1,
      },
    };
    setQuizState(newState);
    saveQuizState(newState);
    setSelected(idx);
    setRevealed(true);
  }, [revealed, transitioning, quiz, currentQ, quizState]);

  // Avanza alla prossima domanda dopo 2s
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => {
      setTransitioning(true);
      setTimeout(() => {
        // Calcola la prossima domanda
        const updatedSeen = [...quizState.seen, currentQ];
        const order = seededShuffle(ALL_QUIZ, 42);
        const unseen = order.filter(i => !updatedSeen.includes(i));
        const next = unseen.length > 0 ? unseen[0] : order[Math.floor(Math.random() * order.length)];
        setCurrentQ(next);
        setSelected(null);
        setRevealed(false);
        setTransitioning(false);
      }, 350);
    }, 2000);
    return () => clearTimeout(t);
  }, [revealed]); // eslint-disable-line

  const isCorrect = selected === quiz?.correct;
  const { correct, total } = quizState.stats;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh',
      textAlign: 'center', padding: '24px',
    }}>
      {/* Logo */}
      <div className="dynamic-loader" style={{ marginBottom: '24px' }}>
        <img src={logoUrl} alt="OmniDex Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
      </div>

      {title && (
        <h2 key={title} className="animate-fade-in" style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', marginBottom: '6px', fontWeight: '800', lineHeight: 1.2 }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px', maxWidth: '380px' }}>
          {subtitle}
        </p>
      )}

      <div style={{ width: '40px', height: '3px', background: 'var(--accent-gradient)', borderRadius: '99px', margin: '0 auto 20px' }} />

      {/* Card Quiz */}
      <div
        className="glass-panel"
        style={{
          maxWidth: '480px', width: '100%', padding: '20px', textAlign: 'left',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{
            background: 'var(--accent-gradient)', borderRadius: 'var(--radius-full)',
            padding: '3px 12px', fontSize: '0.7rem', fontWeight: '800', color: 'white',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            🎮 Quiz Gaming
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {total > 0 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {correct}/{total} ⭐
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.97rem', fontWeight: '700', lineHeight: '1.5', marginBottom: '14px', color: 'var(--text-primary)' }}>
          {quiz.q}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {quiz.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.04)';
            let border = 'var(--glass-border)';
            let color = 'var(--text-secondary)';
            let fw = '400';

            if (revealed) {
              if (i === quiz.correct)  { bg = 'rgba(16,185,129,0.15)'; border = 'rgba(16,185,129,0.5)'; color = '#10B981'; fw = '700'; }
              else if (i === selected) { bg = 'rgba(239,68,68,0.12)';  border = 'rgba(239,68,68,0.4)';  color = '#ef4444'; }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={revealed}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: 'var(--radius-md)', color,
                  fontSize: '0.88rem', fontWeight: fw,
                  cursor: revealed ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
                onMouseOver={e => { if (!revealed) e.currentTarget.style.background = 'rgba(109,40,217,0.12)'; }}
                onMouseOut={e => { if (!revealed) e.currentTarget.style.background = bg; }}
              >
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: revealed && i === quiz.correct ? '#10B981'
                    : revealed && i === selected ? '#ef4444'
                    : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '800', color: 'white',
                  transition: 'background 0.2s',
                }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div style={{ marginTop: '12px', textAlign: 'center', animation: 'animate-fade-in 0.3s ease' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '6px' }}>
              {isCorrect ? '🏆 Corretto! Prossima domanda...' : `💡 Risposta: "${quiz.options[quiz.correct]}" — Prossima...`}
            </p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent-gradient)', animation: 'progress-bar 2s linear forwards' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
