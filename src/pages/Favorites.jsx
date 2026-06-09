import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Trash2, BarChart2, ChevronDown, ChevronUp, Star, Bell, BellOff, BookOpen, Camera, Loader2, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { db } from '../services/db';
import HapticService from '../services/HapticService';
import { getQuizStats } from '../services/QuizService';
import logoUrl from '../assets/logo.png';

const STATUS_CONFIG = {
  backlog:   { label: 'Da Giocare', emoji: '🕹️', color: '#6366f1' },
  playing:   { label: 'In Corso',   emoji: '▶️',  color: '#f59e0b' },
  completed: { label: 'Completato', emoji: '✅',  color: '#10B981' },
  dropped:   { label: 'Abbandonato',emoji: '❌',  color: '#ef4444' },
};

// Badge dropdown per cambiare stato gioco — corretto posizionamento su mobile
function StatusBadge({ status, onChange, gameId }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.backlog;

  // Chiudi cliccando fuori
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          background: `${cfg.color}22`, border: `1px solid ${cfg.color}55`,
          borderRadius: 'var(--radius-full)', padding: '5px 12px',
          fontSize: '0.75rem', fontWeight: '700', color: cfg.color,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{cfg.emoji}</span> {cfg.label} <ChevronDown size={11} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', bottom: '110%', left: 0, zIndex: 200,
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', minWidth: '160px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {Object.entries(STATUS_CONFIG).map(([key, c]) => (
            <button
              key={key}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', background: status === key ? `${c.color}22` : 'transparent',
                border: 'none', color: status === key ? c.color : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: status === key ? '700' : '400',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (status !== key) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (status !== key) e.currentTarget.style.background = 'transparent'; }}
              onClick={async () => {
                await db.updateStatus(gameId, key);
                await HapticService.light();
                onChange();
                setOpen(false);
              }}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsPanel({ games }) {
  if (games.length === 0) return null;
  const statusCounts = { backlog: 0, playing: 0, completed: 0, dropped: 0 };
  games.forEach(g => { if (statusCounts[g.status] !== undefined) statusCounts[g.status]++; });
  const completionRate = Math.round((statusCounts.completed / games.length) * 100);
  const genreCount = {};
  games.forEach(g => (g.genres || []).forEach(genre => {
    genreCount[genre] = (genreCount[genre] || 0) + 1;
  }));
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxGenre = topGenres[0]?.[1] || 1;

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '28px', padding: '20px' }}>
      <h3 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart2 size={16} color="var(--accent-primary)" /> Statistiche Raccolta
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Totale', value: games.length, color: 'var(--accent-primary)' },
          { label: 'In Corso', value: statusCounts.playing, color: '#f59e0b' },
          { label: 'Completati', value: statusCounts.completed, color: '#10B981' },
          { label: 'Da Giocare', value: statusCounts.backlog, color: '#6366f1' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Completamento Catalogo</span>
          <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800' }}>{completionRate}%</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #06b6d4)', borderRadius: '99px', transition: 'width 1s ease' }} />
        </div>
      </div>
      {topGenres.length > 0 && (
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '10px' }}>Generi Preferiti</div>
          {topGenres.map(([genre, count]) => (
            <div key={genre} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{genre}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{count}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${(count / maxGenre) * 100}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '99px' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Card singolo gioco — usata sia per Preferiti che per Raccolta
function GameCard({ game, onRemove, onToggleFavorite, onStatusChange, showFavoriteBell = true }) {
  const navigate = useNavigate();
  const isFav = game.isFavorite !== false; // default true per retrocompatibilità

  return (
    <div className="glass-panel" style={{ overflow: 'visible', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Cover */}
      <div
        style={{ height: '150px', width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', background: `url(${game.cover}) center/cover no-repeat`, borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
        onClick={() => navigate(`/game/${encodeURIComponent(game.title)}`, { state: { game: { id: game.id } } })}
      >
        {/* Badge notifica in alto a destra sulla cover */}
        {showFavoriteBell && (
          <div
            title={isFav ? "Rimuovi dai Preferiti (notifiche attive)" : "Aggiungi ai Preferiti (attiva notifiche)"}
            onClick={e => { e.stopPropagation(); onToggleFavorite(game); }}
            style={{
              position: 'absolute', top: '8px', right: '8px',
              background: isFav ? 'rgba(245,200,66,0.9)' : 'rgba(0,0,0,0.5)',
              borderRadius: '50%', width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)',
              border: isFav ? '1px solid rgba(245,200,66,1)' : '1px solid rgba(255,255,255,0.15)',
              transition: 'all 0.2s',
            }}
          >
            {isFav
              ? <Bell size={14} color="#3a2000" fill="#3a2000" />
              : <BellOff size={14} color="rgba(255,255,255,0.6)" />
            }
          </div>
        )}
      </div>

      {/* Contenuto card */}
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '1rem', lineHeight: 1.3, margin: 0 }}>{game.title}</h3>

        {/* Rating + Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          {game.rating > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <Star size={12} fill="currentColor" /> {game.rating.toFixed(1)}
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge status={game.status || 'backlog'} gameId={game.id} onChange={onStatusChange} />
          </div>
        </div>

        {/* Footer: link + elimina */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--glass-border)' }}>
          <Link to={`/game/${encodeURIComponent(game.title)}`} state={{ game: { id: game.id } }} className="text-gradient" style={{ fontWeight: '600', fontSize: '0.85rem' }}>
            Vedi dettagli
          </Link>
          <button
            className="btn-icon"
            style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }}
            title="Rimuovi dalla raccolta"
            onClick={() => onRemove(game.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagina principale ───────────────────────────────────────────────────────
export default function Favorites() {
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState('collection'); // 'favorites' | 'collection'
  const [activeFilter, setActiveFilter] = useState('all');
  const [showStats, setShowStats] = useState(true);
  const [sharing, setSharing] = useState(false);
  const socialCardRef = useRef(null);

  const loadGames = async () => {
    const data = await db.getFavorites();
    if (data) {
      data.sort((a, b) => b.addedAt - a.addedAt);
      // Retrocompatibilità: tutti i giochi già esistenti sono anche preferiti
      const normalized = data.map(g => ({ ...g, isFavorite: g.isFavorite !== false }));
      setGames(normalized);
    }
  };

  useEffect(() => { loadGames(); }, []);

  const handleRemove = async (id) => {
    await HapticService.medium();
    await db.removeFavorite(id);
    loadGames();
  };

  const handleToggleFavorite = async (game) => {
    await HapticService.light();
    const newVal = !(game.isFavorite === true);
    await db.updateFavoriteFlag(game.id, newVal);
    loadGames();
  };

  // Giochi preferiti (notifiche attive)
  const favorites = games.filter(g => g.isFavorite === true);
  // Tutta la raccolta
  const collection = games;

  const displayList = activeTab === 'favorites' ? favorites : collection;
  const filtered = activeFilter === 'all'
    ? displayList
    : displayList.filter(g => (g.status || 'backlog') === activeFilter);

  const quizStats = getQuizStats();
  const quizPct = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : null;

  const getRank = (correct) => {
    if (correct >= 150) return { title: 'Sommelier', emoji: '🍷', color: 'var(--accent-ultra)' };
    if (correct >= 51) return { title: 'Esperto', emoji: '👑', color: '#10B981' };
    if (correct >= 11) return { title: 'Giocatore', emoji: '🕹️', color: 'var(--accent-secondary)' };
    return { title: 'Novellino', emoji: '🌱', color: 'var(--text-muted)' };
  };
  const userRank = getRank(quizStats.correct);

  const TABS = [
    { id: 'favorites', label: 'Preferiti', emoji: '🔔', desc: `${favorites.length} giochi con notifiche attive` },
    { id: 'collection', label: 'Raccolta', emoji: '📚', desc: `${collection.length} giochi totali` },
  ];

  const handleShareCard = async () => {
    if (!socialCardRef.current || games.length === 0) return;
    setSharing(true);
    await HapticService.medium();
    
    try {
      // Cattura il div nascosto come canvas
      const canvas = await html2canvas(socialCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f0c29'
      });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      let shareUrl = dataUrl;
      
      // Su dispositivi nativi, salviamo l'immagine in cache per poterla condividere
      if (window.Capacitor?.isNativePlatform?.()) {
        const base64Data = dataUrl.split(',')[1];
        const fileName = 'omnidex-trophies-' + new Date().getTime() + '.jpeg';
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        shareUrl = savedFile.uri;
      }

      await Share.share({
        title: 'La mia Sala Trofei OmniDex',
        text: 'Guarda i miei giochi top del momento su OmniDex! 🎮',
        url: shareUrl,
        dialogTitle: 'Condividi la tua raccolta',
      });
    } catch (e) {
      console.error("Errore durante la condivisione:", e);
      alert("Impossibile generare la cartolina. Riprova più tardi.");
    } finally {
      setSharing(false);
    }
  };

  const statusCounts = { backlog: 0, playing: 0, completed: 0, dropped: 0 };
  games.forEach(g => { if (statusCounts[g.status] !== undefined) statusCounts[g.status]++; });

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      
      {/* 📸 Cartolina Social Nascosta (Renderizzata solo per screenshot) */}
      <div 
        ref={socialCardRef}
        style={{
          position: 'absolute', top: '-9999px', left: '-9999px',
          width: '1080px', height: '1920px', // formato story IG/TikTok
          maxWidth: 'none', maxHeight: 'none', // Override global max-width: 100%
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          color: 'white', padding: '80px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', fontFamily: 'sans-serif', zIndex: -100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
          <img src={logoUrl} alt="OmniDex Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
          <div style={{ fontSize: '5.5rem', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1.1', color: 'white' }}>
            <span style={{ background: 'linear-gradient(135deg, #6d28d9, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Omni</span>Dex
          </div>
        </div>
        <p style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '60px', fontWeight: '600', letterSpacing: '1px' }}>La mia Sala Trofei</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', width: '100%', padding: '0 20px', flex: 1 }}>
          {games.slice(0, 6).map(g => (
            <div key={g.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
              {g.cover
                ? <img src={g.cover} alt={g.title} loading="lazy" style={{ width: '100%', height: '280px', objectFit: 'cover' }} crossOrigin="anonymous" />
                : <div style={{ width: '100%', height: '280px', background: 'linear-gradient(135deg, #6d28d9, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🎮</div>
              }
              <div style={{ padding: '24px', flex: 1 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.title}</div>
                {g.status && g.status !== 'backlog' && (
                  <div style={{ marginTop: '10px', fontSize: '1.2rem', color: g.status === 'completed' ? '#10B981' : g.status === 'playing' ? '#f59e0b' : '#ef4444' }}>
                    {g.status === 'completed' ? '✅ Completato' : g.status === 'playing' ? '▶️ In Corso' : '❌ Abbandonato'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '60px', textAlign: 'center', width: '100%', padding: '0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(0,0,0,0.4)', padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#10B981' }}>{statusCounts.completed}</div>
              <div style={{ fontSize: '1.8rem', color: '#ccc', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }}>Completati</div>
            </div>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#f59e0b' }}>{statusCounts.playing}</div>
              <div style={{ fontSize: '1.8rem', color: '#ccc', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }}>In Corso</div>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', margin: 0 }}><span className="text-gradient">Profilo</span></h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {games.length > 0 && (
            <button
              onClick={handleShareCard}
              disabled={sharing}
              style={{ background: 'var(--accent-ultra-gradient)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 14px', cursor: sharing ? 'wait' : 'pointer', color: '#002538', fontSize: '0.82rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {sharing ? <Loader2 size={14} className="spin" /> : <Camera size={14} />} Condividi
            </button>
          )}
          <button
            onClick={() => setShowStats(v => !v)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BarChart2 size={14} /> Statistiche {showStats ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Card Quiz Stats */}
      <div className="glass-panel" style={{ padding: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--bg-glass)', border: `2px solid ${userRank.color}`, borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem', boxShadow: `0 0 15px ${userRank.color}40` }} title={`Grado: ${userRank.title}`}>
          {userRank.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <span style={{ color: userRank.color, marginRight: '6px', fontSize: '0.75rem' }}>{userRank.title}</span> • Quiz Gaming
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{quizStats.total}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Risposte</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10B981' }}>{quizStats.correct}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corrette</div>
            </div>
            {quizPct !== null && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: quizPct >= 70 ? '#10B981' : quizPct >= 40 ? '#f59e0b' : '#ef4444' }}>{quizPct}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Precisione</div>
              </div>
            )}
            {quizStats.total === 0 && (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                Apri un gioco per il tuo primo quiz! 🎯
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Stats Panel */}
      {showStats && <StatsPanel games={collection} />}

      {/* Tab Preferiti / Raccolta */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setActiveFilter('all'); }}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--glass-border)',
              background: activeTab === tab.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{tab.emoji}</span>
            {tab.label}
            <span style={{ fontSize: '0.68rem', fontWeight: '400', opacity: 0.7 }}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Info contestuale */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '20px', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {activeTab === 'favorites'
          ? <><Bell size={13} color="#f5c842" /> I giochi <b style={{ color: 'var(--text-secondary)' }}>Preferiti</b> ricevono notifiche automatiche quando escono nuove notizie. Usa l'icona 🔔 sulla card per aggiungerli o rimuoverli.</>
          : <><BookOpen size={13} color="var(--accent-primary)" /> La <b style={{ color: 'var(--text-secondary)' }}>Raccolta</b> include tutti i giochi che stai tracciando, con il loro stato di avanzamento.</>
        }
      </div>

      {/* Filtri stato */}
      {displayList.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
              fontWeight: '700', cursor: 'pointer', border: '1px solid',
              borderColor: activeFilter === 'all' ? 'var(--accent-primary)' : 'var(--glass-border)',
              background: activeFilter === 'all' ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: activeFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            🎮 Tutti ({displayList.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, { label, emoji, color }]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
                fontWeight: '700', cursor: 'pointer', border: '1px solid',
                borderColor: activeFilter === key ? color : 'var(--glass-border)',
                background: activeFilter === key ? `${color}22` : 'transparent',
                color: activeFilter === key ? color : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      )}

      {/* Lista giochi */}
      {games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <User size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem' }}>Non hai ancora aggiunto giochi.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cerca un gioco e aggiungi ai preferiti per iniziare!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          {activeTab === 'favorites' && favorites.length === 0
            ? <><Bell size={36} style={{ margin: '0 auto 14px', opacity: 0.3 }} /><p>Nessun gioco nei Preferiti.<br /><span style={{ fontSize: '0.85rem' }}>Tappa l'icona 🔔 su un gioco per attivare le notifiche notizie.</span></p></>
            : <p>Nessun gioco con lo stato "{STATUS_CONFIG[activeFilter]?.label}".</p>
          }
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {filtered.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onRemove={handleRemove}
              onToggleFavorite={handleToggleFavorite}
              onStatusChange={loadGames}
            />
          ))}
        </div>
      )}
    </div>
  );
}
