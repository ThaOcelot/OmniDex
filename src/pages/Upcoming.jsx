import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Star, ChevronRight, Gamepad } from 'lucide-react';
import RAWGService from '../services/RAWGService';

const PLATFORM_ICONS = {
  pc: '🖥️', playstation5: '🎮', playstation4: '🎮',
  'xbox-series-x': '🟢', 'xbox-one': '🟢',
  nintendo: '🔴', switch: '🔴', ios: '📱', android: '🤖',
};

function getPlatformIcon(slug) {
  for (const key of Object.keys(PLATFORM_ICONS)) {
    if (slug?.includes(key)) return PLATFORM_ICONS[key];
  }
  return '🕹️';
}

export default function Upcoming() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    RAWGService.getUpcomingGames().then(data => {
      setGames(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Raggruppa per mese
  const grouped = games.reduce((acc, game) => {
    if (!game.released) return acc;
    const date = new Date(game.released);
    const key = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(game);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', background: 'rgba(109,40,217,0.1)',
          border: '1px solid rgba(109,40,217,0.3)', borderRadius: 'var(--radius-full)',
          color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '16px'
        }}>
          <Calendar size={14} />
          <span>Prossime Uscite</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Release <span className="text-gradient">Radar</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', lineHeight: '1.6' }}>
          I giochi in arrivo nei prossimi 60 giorni. Non perdertene nessuno.
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: 'var(--text-muted)', gap: '16px' }}>
          <Gamepad size={40} className="dynamic-loader" style={{ color: 'var(--accent-primary)' }} />
          <p>Recupero uscite in corso...</p>
        </div>
      )}

      {!loading && games.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem' }}>Nessuna uscita trovata per i prossimi 60 giorni.</p>
        </div>
      )}

      {/* Timeline raggruppata per mese */}
      {Object.entries(grouped).map(([month, monthGames]) => (
        <div key={month} style={{ marginBottom: '40px' }}>
          {/* Intestazione Mese */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: 'var(--accent-gradient)', flexShrink: 0,
              boxShadow: '0 0 8px rgba(109,40,217,0.6)'
            }} />
            <h2 style={{
              fontSize: '1rem', fontWeight: '700', textTransform: 'capitalize',
              color: 'var(--text-secondary)', letterSpacing: '0.05em'
            }}>{month.toUpperCase()}</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          </div>

          {/* Card Giochi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {monthGames.map(game => (
              <div
                key={game.id}
                className="glass-panel"
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '12px 16px', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderRadius: 'var(--radius-md)',
                }}
                onClick={() => navigate(`/game/${encodeURIComponent(game.name)}`, { state: { game: { id: game.id } } })}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Cover */}
                <div style={{
                  width: '60px', height: '60px', borderRadius: 'var(--radius-sm)',
                  background: game.background_image
                    ? `url(${game.background_image}) center/cover no-repeat`
                    : 'var(--bg-glass)',
                  flexShrink: 0, border: '1px solid var(--glass-border)'
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {game.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Data */}
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                      📅 {new Date(game.released).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </span>
                    {/* Rating */}
                    {game.metacritic && (
                      <span style={{ fontSize: '0.72rem', color: game.metacritic >= 75 ? '#10B981' : game.metacritic >= 50 ? '#f59e0b' : '#ef4444', fontWeight: '700', background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                        MC {game.metacritic}
                      </span>
                    )}
                    {game.rating > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={10} fill="currentColor" /> {game.rating.toFixed(1)}
                      </span>
                    )}
                    {/* Piattaforme */}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {[...new Set(game.platforms?.map(p => getPlatformIcon(p.platform.slug)) || [])].slice(0, 4).join(' ')}
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
