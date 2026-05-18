import { useState, useEffect, useCallback, useMemo } from 'react';
import logoUrl from '../assets/logo.png';
import { loadQuizState, saveQuizState } from '../services/QuizService';

// ─── 50 Domande di Gaming ─────────────────────────────────────────────────────
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
  { q: 'Quale studio ha sviluppato Elden Ring?', options: ['Capcom', 'FromSoftware', 'Bandai Namco', 'Square Enix'], correct: 1 },
  { q: 'Come si chiama il cavallo di Link in Ocarina of Time?', options: ['Roach', 'Epona', 'Torrent', 'Agro'], correct: 1 },
  { q: 'In quale anno è uscito il primo Half-Life?', options: ['1996', '1998', '2000', '2002'], correct: 1 },
  { q: 'In Minecraft, quale materiale dà l\'armatura più resistente?', options: ['Ferro', 'Diamante', 'Oro', 'Netherite'], correct: 3 },
  { q: 'In quale gioco appare Solid Snake per la prima volta?', options: ['Metal Gear Solid', 'Metal Gear', 'Snake Eater', 'Guns of the Patriots'], correct: 1 },
  { q: 'Qual è il nome del regno in Super Mario Bros?', options: ['Hyrule', 'Mushroom Kingdom', 'Dreamland', 'Onett'], correct: 1 },
  { q: 'Chi è il personaggio principale di Cyberpunk 2077?', options: ['Johnny Silverhand', 'V', 'Rogue', 'Jackie'], correct: 1 },
  { q: 'Che cosa significa "RPG"?', options: ['Rocket Propelled Game', 'Role-Playing Game', 'Random Play Game', 'Real Performance Gaming'], correct: 1 },
  { q: 'In quale serie videoludica appare Geralt di Rivia?', options: ['Dragon Age', 'The Witcher', "Baldur's Gate", 'Divinity'], correct: 1 },
  { q: 'Qual è la valuta principale di Animal Crossing?', options: ["Monete d'oro", 'Rupie', 'Stelline', 'Campane'], correct: 3 },
  { q: 'Chi ha sviluppato Undertale?', options: ['Devolver Digital', 'Toby Fox', 'Edmund McMillen', 'Jonathan Blow'], correct: 1 },
  { q: 'In quale anno è uscito Minecraft ufficialmente (versione 1.0)?', options: ['2009', '2010', '2011', '2012'], correct: 2 },
  { q: 'Come si chiama la protagonista di Metroid?', options: ['Samus Aran', 'Zelda', 'Bayonetta', 'Lara Croft'], correct: 0 },
  { q: 'Qual è il nome del protagonista di Persona 5?', options: ['Yu Narukami', 'Ryuji Sakamoto', 'Ren Amamiya', 'Yosuke Hanamura'], correct: 2 },
  { q: 'In Hollow Knight, qual è la destinazione finale del Cavaliere?', options: ['Hallownest', 'Dirtmouth', 'Forgotten Crossroads', 'City of Tears'], correct: 0 },
  { q: 'Come si chiama la protagonista di Horizon Zero Dawn?', options: ['Freya', 'Aloy', 'Sylens', 'Erend'], correct: 1 },
  { q: 'Quanti capitoli ha la storia principale di Red Dead Redemption 2?', options: ['4', '5', '6', '8'], correct: 2 },
  { q: 'Qual è il nome completo del protagonista di The Witcher?', options: ['Geralt di Rivia', 'Geralt il Bianco', 'Geralt dei Lupi', 'Geralt Witcher'], correct: 0 },
  { q: 'In quale anno è uscito Doom originale?', options: ['1990', '1991', '1993', '1995'], correct: 2 },
  { q: 'Chi è il boss finale di Cuphead?', options: ['King Dice', 'Dr. Kahl', 'Grim Matchstick', 'Il Diavolo'], correct: 3 },
  { q: 'Qual è la caratteristica principale del genere "Roguelike"?', options: ['Grafica 3D', 'Generazione procedurale e morte permanente', 'Multiplayer obbligatorio', 'Storia lineare'], correct: 1 },
  { q: 'In quale gioco si usa la frase "The cake is a lie"?', options: ['Half-Life 2', 'Portal', 'Bioshock', 'Mirror\'s Edge'], correct: 1 },
  { q: 'Qual è il nome del protagonista di Assassin\'s Creed Origins?', options: ['Altaïr', 'Ezio', 'Bayek', 'Kassandra'], correct: 2 },
  { q: 'In quale città si svolge Bioshock Infinite?', options: ['Rapture', 'Columbia', 'Dunwall', 'Yharnam'], correct: 1 },
  { q: 'Chi è il creatore di Super Mario?', options: ['Satoru Iwata', 'Shigeru Miyamoto', 'Gunpei Yokoi', 'Masahiro Sakurai'], correct: 1 },
  { q: 'In quale gioco appare il personaggio "Big Boss"?', options: ['Splinter Cell', 'Metal Gear', 'Ghost Recon', 'Rainbow Six'], correct: 1 },
  { q: 'Qual è il nome del protagonista di Sekiro?', options: ['Wolf', 'Sekiro', 'Sculptor', 'Genichiro'], correct: 0 },
  { q: 'In Fortnite, cosa cadono dal cielo all\'inizio della partita?', options: ['Casse', 'Battle Bus', 'Paracadute', 'Loot Llama'], correct: 1 },
  { q: 'Qual è il titolo completo del secondo episodio di Half-Life?', options: ['Half-Life 2: Episode Two', 'Half-Life 2: Uprising', 'Half-Life 2: Chapter 2', 'Half-Life: Alyx 2'], correct: 0 },
  { q: 'Quale compagnia produce la serie Fire Emblem?', options: ['Sega', 'Nintendo / Intelligent Systems', 'Square Enix', 'Atlus'], correct: 1 },
  { q: 'In quale gioco si trova il nemico chiamato "Psycho Mantis"?', options: ['Metal Gear Solid', 'Resident Evil', 'Silent Hill', 'Dino Crisis'], correct: 0 },
  { q: 'Quante stagioni ha Fortnite dalla sua uscita a fine 2023?', options: ['Più di 10', 'Esattamente 10', 'Meno di 10', '20'], correct: 0 },
  { q: 'In quale gioco il protagonista è un astronauta intrappolato su Marte?', options: ['No Man\'s Sky', 'Surviving Mars', 'The Martian Game', 'DOOM (2016)'], correct: 3 },
  { q: 'Come si chiama il sistema di combattimento di Devil May Cry?', options: ['Stylish Rank', 'Combo Meter', 'Flair System', 'Cool Gauge'], correct: 0 },
  { q: 'In The Witcher 3, quante finali diversi esistono?', options: ['2', '3', '4', '6'], correct: 1 },
  { q: 'Qual è il nome originale giapponese di "Bomberman"?', options: ['Dyna Blaster', 'Bakudan Hoshi', 'Bomber Boy', 'Explosive Hero'], correct: 2 },
  { q: 'In quale gioco si guida un kart con personaggi Nintendo?', options: ['F-Zero', 'Mario Kart', 'Diddy Kong Racing', 'Kirby Air Ride'], correct: 1 },
  { q: 'Qual è il genere di Disco Elysium?', options: ['Action RPG', 'FPS', 'CRPG / Avventura testuale', 'Platformer'], correct: 2 },
  { q: 'Chi ha composto la colonna sonora di DOOM (2016)?', options: ['Hans Zimmer', 'Mick Gordon', 'Nobuo Uematsu', 'Koji Kondo'], correct: 1 },
  { q: 'In quale anno è stato lanciato il servizio Xbox Game Pass?', options: ['2015', '2016', '2017', '2018'], correct: 2 },
  { q: 'Qual è il nemico più iconico di Pac-Man?', options: ['Blinky', 'Pinky', 'Inky', 'Tutti e quattro i fantasmi'], correct: 3 },
];

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

  // Ordine settimanale degli indici (stabile per tutta la settimana)
  const weeklyOrder = useMemo(() => seededShuffle(ALL_QUIZ, week * 100 + year), [week, year]);

  // Stato persistente: viste questa settimana + statistiche totali
  const [quizState, setQuizState] = useState(() => {
    const saved = loadQuizState();
    const savedWeek = saved?.week;
    if (saved && savedWeek === week) return saved;
    return { week, seen: [], stats: saved?.stats || { correct: 0, total: 0 } };
  });

  // Calcola la prossima domanda non ancora vista questa settimana
  const nextQuestionIndex = useMemo(() => {
    const unseen = weeklyOrder.filter(i => !quizState.seen.includes(i));
    if (unseen.length === 0) return weeklyOrder[0]; // tutte viste → ricomincia
    return unseen[0];
  }, [weeklyOrder, quizState.seen]);

  const [currentQ, setCurrentQ] = useState(nextQuestionIndex);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const quiz = ALL_QUIZ[currentQ];

  const handleAnswer = useCallback((idx) => {
    if (revealed || transitioning) return;
    const isCorrect = idx === quiz.correct;

    const newState = {
      week,
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
  }, [revealed, transitioning, quiz, currentQ, quizState, week]);

  // Avanza alla prossima domanda dopo 2s
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => {
      setTransitioning(true);
      setTimeout(() => {
        // Calcola la prossima domanda dalla lista aggiornata
        const updatedSeen = [...quizState.seen, currentQ];
        const unseen = weeklyOrder.filter(i => !updatedSeen.includes(i));
        const next = unseen.length > 0 ? unseen[0] : weeklyOrder[0];
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
        <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', marginBottom: '6px', fontWeight: '800', lineHeight: 1.2 }}>
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
            <span style={{
              fontSize: '0.66rem', color: 'var(--accent-primary)', fontWeight: '700',
              border: '1px solid rgba(109,40,217,0.35)', borderRadius: 'var(--radius-full)',
              padding: '2px 9px', whiteSpace: 'nowrap',
            }}>
              🗓 Nuove domande ogni lunedì
            </span>
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

      <p style={{ marginTop: '14px', fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.7 }}>
        Le domande ruotano ogni settimana — torna lunedì per nuove sfide! 🎯
      </p>
    </div>
  );
}
