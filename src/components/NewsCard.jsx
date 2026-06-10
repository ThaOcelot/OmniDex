import React, { useMemo } from 'react';
import { ExternalLink, Zap, Clock } from 'lucide-react';

// Colori per le fonti
const SOURCE_COLORS = {
  'Multiplayer.it': '#6d28d9',
  'IGN': '#e11d48',
  'Eurogamer': '#0891b2',
  'GameSpot': '#ea580c',
  'Kotaku': '#16a34a',
  'Polygon': '#7c3aed',
  'GamesIndustry': '#0369a1',
  'default': '#ec4899',
};

function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const now = Date.now();
    // Prova a interpretare la data (sia timestamp numerico che stringa)
    const then = typeof dateStr === 'number' ? dateStr : new Date(dateStr).getTime();
    if (isNaN(then)) return dateStr;
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return 'Adesso';
    if (mins < 60) return `${mins} min fa`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
    if (days < 7) return `${days} ${days === 1 ? 'giorno' : 'giorni'} fa`;
    return dateStr;
  } catch {
    return dateStr;
  }
}

const NewsCard = ({ news, onClick }) => {
  const sourceColor = SOURCE_COLORS[news.source] || SOURCE_COLORS['default'];
  const relTime = useMemo(() => getRelativeTime(news.rawDate || news.date), [news.rawDate, news.date]);

  return (
    <div
      className="glass-panel"
      onClick={onClick}
      style={{
        padding: '0',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = sourceColor + '88';
        e.currentTarget.style.boxShadow = `0 16px 36px ${sourceColor}30`;
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
      }}
    >
      {/* Barra laterale colorata per la fonte */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
        background: `linear-gradient(to bottom, ${sourceColor}, ${sourceColor}44)`,
        borderRadius: '3px 0 0 3px',
      }} />

      {/* Header */}
      <div style={{
        padding: '14px 18px 10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <span style={{
          fontSize: '0.72rem',
          color: sourceColor,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {news.source}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          <Clock size={11} />
          <span>{relTime}</span>
        </div>
      </div>

      {/* Corpo */}
      <div style={{ padding: '16px 18px 16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{
          fontSize: '0.97rem',
          lineHeight: '1.5',
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
        }}>
          {news.title}
        </h4>

        {news.summary && (
          <p style={{
            fontSize: '0.82rem',
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}>
            {news.summary}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: sourceColor, fontSize: '0.78rem', fontWeight: '700' }}>
            <Zap size={13} /> Leggi Riassunto
          </div>
          <ExternalLink size={13} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
