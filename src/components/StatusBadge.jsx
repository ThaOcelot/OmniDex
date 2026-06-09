import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { db } from '../services/db';
import HapticService from '../services/HapticService';

export const STATUS_CONFIG = {
  backlog:   { label: 'Da Giocare', emoji: '🕹️', color: '#6366f1' },
  playing:   { label: 'In Corso',   emoji: '▶️',  color: '#f59e0b' },
  completed: { label: 'Completato', emoji: '✅',  color: '#10B981' },
  dropped:   { label: 'Abbandonato',emoji: '❌',  color: '#ef4444' },
};

export default function StatusBadge({ status, onChange, gameId, gameData = null }) {
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
    <div style={{ position: 'relative', display: 'inline-block' }}>
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
        <span>{cfg.emoji}</span> {status ? cfg.label : "Aggiungi Stato"} <ChevronDown size={11} />
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
                // Se non è nei preferiti, lo inseriamo
                const inDb = await db.isFavorite(gameId); // This currently checks if !!fav
                if (gameData) {
                  // Siamo in GameDetails, potremmo doverlo salvare per la prima volta
                  await db.addFavorite(gameData, false); // false = non è esplicitamente preferito (isFavorite flag)
                }
                await db.updateStatus(gameId, key);
                await HapticService.light();
                if (onChange) onChange(key);
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
