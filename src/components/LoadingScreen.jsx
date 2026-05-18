import { useState, useEffect, useCallback, useMemo } from 'react';
import logoUrl from '../assets/logo.png';

// ─── Quiz Videoludici ─────────────────────────────────────────────────────────
const ALL_QUIZ = [
  { q: 'In quale anno è uscito il primo The Legend of Zelda?', options: ['1983', '1986', '1989', '1991'], correct: 1 },
  { q: 'Chi è il protagonista della saga di Dark Souls?', options: ['Il Senza Nome', "L'Infranto", 'Il Senzaluce', 'Il Prescelto'], correct: 1 },
  { q: 'Qual è la console più venduta di sempre?', options: ['PlayStation 2', 'Nintendo DS', 'Game Boy', 'PlayStation 4'], correct: 0 },
  { q: 'In quale città si svolge GTA V?', options: ['Vice City', 'Liberty City', 'Los Santos', 'San Fierro'], correct: 2 },
  { q: 'Come si chiama il villain principale di The Last of Us Parte I?', options: ['David', 'Henry', 'Joel', 'Marlene'], correct: 0 },
  { q: 'Quanti Pokémon esistevano nella prima generazione?', options: ['100', '149', '151', '152'], correct: 2 },
  { q: 'In quale gioco si trova la Master Sword?', options: ['Dark Souls', 'The Legend of Zelda', 'Final Fantasy', 'Elden Ring'], correct: 1 },
  { q: 'Chi ha creato la saga di Metal Gear?', options: ['Shigeru Miyamoto', 'Hideo Kojima', 'Hidetaka Miyazaki', 'Yoko Taro'], correct: 1 },
  { q: 'Che genere di gioco è Stardew Valley?', options: ['FPS', 'Battle Royale', 'Farming Sim / RPG', 'Racing'], correct: 2 },
  { q: 'Qual è il nome completo di Kratos in God of War?', options: ['Kratos Spartan', 'Solo "Kratos"', 'Kratos di Sparta', 'Kratos Blades'], correct: 1 },
  { q: 'Quale studio ha sviluppato Elden Ring?', options: ['Capcom', 'FromSoftware', 'Bandai Namco', 'Square Enix'], correct: 1 },
  { q: 'Come si chiama il cavallo di Link in Ocarina of Time?', options: ['Roach', 'Epona', 'Torrent', 'Agro'], correct: 1 },
  { q: 'In quale anno è uscito il primo Half-Life?', options: ['1996', '1998', '2000', '2002'], correct: 1 },
  { q: 'In Minecraft, quale materiale serve per fare armatura più resistente?', options: ['Ferro', 'Diamante', 'Oro', 'Netherite'], correct: 3 },
  { q: 'Qual era la prima arma di Master Chief in Halo: Combat Evolved?', options: ['Shotgun', 'Battle Rifle', 'Plasma Pistol', 'Pistola M6D'], correct: 3 },
  { q: 'In quale gioco appare Solid Snake per la prima volta?', options: ['Metal Gear Solid', 'Metal Gear', 'Snake Eater', 'Guns of the Patriots'], correct: 1 },
  { q: 'Qual è il nome del regno in Super Mario Bros?', options: ['Hyrule', 'Mushroom Kingdom', 'Dreamland', 'Onett'], correct: 1 },
  { q: 'Chi è il personaggio principale di Cyberpunk 2077?', options: ['Johnny Silverhand', 'V', 'Rogue', 'Jackie'], correct: 1 },
  { q: 'Quante stelle servono per sbloccare Bowser in Super Mario 64?', options: ['30', '50', '70', '80'], correct: 3 },
  { q: 'Che cosa significa "RPG"?', options: ['Rocket Propelled Game', 'Role-Playing Game', 'Random Play Game', 'Real Performance Gaming'], correct: 1 },
  { q: 'In quale serie videoludica appare Geralt di Rivia?', options: ['Dragon Age', 'The Witcher', 'Baldur\'s Gate', 'Divinity'], correct: 1 },
  { q: 'Qual è la valuta principale di Animal Crossing?', options: ['Monete d\'oro', 'Rupie', 'Stelline', 'Campane'], correct: 3 },
  { q: 'In quale gioco si trova la mappa "Nuketown"?', options: ['Battlefield', 'Halo', 'Call of Duty', 'Counter-Strike'], correct: 2 },
  { q: 'Chi ha sviluppato Undertale?', options: ['Devolver Digital', 'Toby Fox', 'Edmund McMillen', 'Jonathan Blow'], correct: 1 },
  { q: 'In quale anno è uscito Minecraft ufficialmente (versione 1.0)?', options: ['2009', '2010', '2011', '2012'], correct: 2 },
  { q: 'Come si chiama la protagonista di Metroid?', options: ['Samus Aran', 'Zelda', 'Bayonetta', 'Lara Croft'], correct: 0 },
  { q: 'Qual è il nome del protagonista di Persona 5?', options: ['Yu Narukami', 'Ryuji Sakamoto', 'Ren Amamiya', 'Yosuke Hanamura'], correct: 2 },
  { q: 'In Hollow Knight, qual è il nome della città principale?', options: ['Hallownest', 'Dirtmouth', 'Forgotten Crossroads', 'City of Tears'], correct: 3 },
];

// Shuffle deterministico basato su un seed numerico (la settimana dell'anno)
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Numero settimana corrente dell'anno (1-52)
function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function LoadingScreen({ title, subtitle }) {
  const week = getWeekNumber();
  const year = new Date().getFullYear();

  // Ordine domande shuffle settimanale — stabile durante il caricamento
  const weeklyQuiz = useMemo(() => seededShuffle(ALL_QUIZ, week * 100 + year), [week, year]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const quiz = weeklyQuiz[currentIdx % weeklyQuiz.length];

  const handleAnswer = useCallback((idx) => {
    if (revealed || transitioning) return;
    setSelected(idx);
    setRevealed(true);
    setAnswered(v => v + 1);
    if (idx === quiz.correct) setScore(v => v + 1);
  }, [revealed, transitioning, quiz.correct]);

  // Auto-avanza dopo 2s dalla risposta
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIdx(v => v + 1);
        setSelected(null);
        setRevealed(false);
        setTransitioning(false);
      }, 350);
    }, 2000);
    return () => clearTimeout(t);
  }, [revealed]);

  const isCorrect = selected === quiz?.correct;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh',
      textAlign: 'center', padding: '24px',
    }}>
      {/* Logo animato */}
      <div className="dynamic-loader" style={{ marginBottom: '24px' }}>
        <img src={logoUrl} alt="OmniDex Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
      </div>

      {/* Testi caricamento */}
      {title && (
        <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', marginBottom: '6px', fontWeight: '800', lineHeight: 1.2 }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px', maxWidth: '380px' }}>
          {subtitle}
        </p>
      )}

      {/* Separatore */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'var(--accent-gradient)', borderRadius: 'var(--radius-full)',
              padding: '3px 12px', fontSize: '0.7rem', fontWeight: '800', color: 'white',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              🎮 Quiz Gaming
            </span>
            {answered > 0 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {score}/{answered} ⭐
              </span>
            )}
          </div>
          {/* Badge settimanale */}
          <span style={{
            fontSize: '0.66rem', color: 'var(--accent-primary)', fontWeight: '700',
            border: '1px solid rgba(109,40,217,0.35)', borderRadius: 'var(--radius-full)',
            padding: '2px 9px', whiteSpace: 'nowrap',
          }}>
            🗓 Settimana {week} — nuove domande ogni lunedì
          </span>
        </div>

        {/* Domanda */}
        <p style={{ fontSize: '0.97rem', fontWeight: '700', lineHeight: '1.5', marginBottom: '14px', color: 'var(--text-primary)' }}>
          {quiz.q}
        </p>

        {/* Opzioni */}
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
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback + avanzamento automatico */}
        {revealed && (
          <div style={{ marginTop: '12px', textAlign: 'center', animation: 'animate-fade-in 0.3s ease' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '6px' }}>
              {isCorrect
                ? '🏆 Corretto! Prossima domanda tra poco...'
                : `💡 Risposta: "${quiz.options[quiz.correct]}" — Prossima domanda tra poco...`}
            </p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--accent-gradient)',
                animation: 'progress-bar 2s linear forwards',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Note settimanali */}
      <p style={{ marginTop: '14px', fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.7 }}>
        Le domande ruotano ogni settimana — torna lunedì per nuove sfide! 🎯
      </p>
    </div>
  );
}
