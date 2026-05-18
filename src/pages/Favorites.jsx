import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, BarChart2, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { db } from '../services/db';
import HapticService from '../services/HapticService';

const STATUS_CONFIG = {
  all:       { label: 'Tutti',       emoji: '🎮', color: 'var(--accent-primary)' },
  backlog:   { label: 'Da Giocare', emoji: '🕹️', color: '#6366f1' },
  playing:   { label: 'In Corso',   emoji: '▶️',  color: '#f59e0b' },
  completed: { label: 'Completato', emoji: '✅',  color: '#10B981' },
  dropped:   { label: 'Abbandonato',emoji: '❌',  color: '#ef4444' },
};

function StatusBadge({ status, onChange, gameId }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.backlog;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          background: `${cfg.color}22`, border: `1px solid ${cfg.color}55`,
          borderRadius: 'var(--radius-full)', padding: '3px 10px',
          fontSize: '0.72rem', fontWeight: '700', color: cfg.color,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        <span>{cfg.emoji}</span> {cfg.label} <ChevronDown size={10} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 100,
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: '150px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'all').map(([key, c]) => (
            <button
              key={key}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', background: status === key ? `${c.color}22` : 'transparent',
                border: 'none', color: status === key ? c.color : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: status === key ? '700' : '400',
              }}
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

function StatsPanel({ favorites }) {
  if (favorites.length === 0) return null;

  // Conteggi per stato
  const statusCounts = { backlog: 0, playing: 0, completed: 0, dropped: 0, none: 0 };
  favorites.forEach(g => {
    const s = g.status || 'none';
    if (statusCounts[s] !== undefined) statusCounts[s]++;
    else statusCounts.none++;
  });
  const completionRate = Math.round((statusCounts.completed / favorites.length) * 100);

  // Generi più presenti
  const genreCount = {};
  favorites.forEach(g => (g.genres || []).forEach(genre => {
    genreCount[genre] = (genreCount[genre] || 0) + 1;
  }));
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxGenre = topGenres[0]?.[1] || 1;

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '28px', padding: '20px' }}>
      <h3 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart2 size={16} color="var(--accent-primary)" /> Le tue Statistiche
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Totale', value: favorites.length, color: 'var(--accent-primary)' },
          { label: 'In Corso', value: statusCounts.playing, color: '#f59e0b' },
          { label: 'Completati', value: statusCounts.completed, color: '#10B981' },
          { label: 'Da Giocare', value: statusCounts.backlog, color: '#6366f1' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Barra completamento */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Completamento Catalogo</span>
          <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800' }}>{completionRate}%</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #06b6d4)', borderRadius: '99px', transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* Generi preferiti */}
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

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showStats, setShowStats] = useState(true);
  const navigate = useNavigate();

  const loadFavorites = async () => {
    const data = await db.getFavorites();
    if (data) {
      data.sort((a, b) => b.addedAt - a.addedAt);
      setFavorites(data);
    }
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleRemove = async (id) => {
    await HapticService.medium();
    await db.removeFavorite(id);
    loadFavorites();
  };

  const filtered = activeFilter === 'all'
    ? favorites
    : favorites.filter(g => (g.status || 'backlog') === activeFilter);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>I tuoi <span className="text-gradient">Preferiti</span></h1>
        <button
          onClick={() => setShowStats(v => !v)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <BarChart2 size={14} /> Statistiche {showStats ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Stats Panel */}
      {showStats && <StatsPanel favorites={favorites} />}

      {/* Filtri per stato */}
      {favorites.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
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
              {key === 'all' && ` (${favorites.length})`}
            </button>
          ))}
        </div>
      )}

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Heart size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <p style={{ fontSize: '1.2rem' }}>Non hai ancora aggiunto giochi ai preferiti.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <p>Nessun gioco con lo stato "{STATUS_CONFIG[activeFilter]?.label}".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map(game => (
            <div key={game.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{ height: '160px', width: '100%', background: `url(${game.cover}) center/cover no-repeat`, borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', position: 'relative' }}
                onClick={() => navigate(`/game/${encodeURIComponent(game.title)}`, { state: { game: { id: game.id } } })}
              />
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', lineHeight: 1.3 }}>{game.title}</h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {game.rating > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="currentColor" /> {game.rating.toFixed(1)}
                    </div>
                  )}
                  {/* Status Badge */}
                  <StatusBadge status={game.status || 'backlog'} gameId={game.id} onChange={loadFavorites} />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                  <Link to={`/game/${encodeURIComponent(game.title)}`} state={{ game: { id: game.id } }} className="text-gradient" style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    Vedi dettagli
                  </Link>
                  <button className="btn-icon" style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} onClick={() => handleRemove(game.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
