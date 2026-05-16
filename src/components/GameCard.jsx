import React from 'react';
import { ChevronRight } from 'lucide-react';

const GameCard = ({ game, onClick }) => {
  return (
    <div
      className="glass-panel"
      onClick={onClick}
      style={{ 
        padding: '0', 
        cursor: 'pointer', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        position: 'relative',
        height: '100%'
      }}
      onMouseOver={e => { 
        e.currentTarget.style.transform = 'translateY(-10px)'; 
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(109, 40, 217, 0.3)';
        e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)'; 
      }}
      onMouseOut={e => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
        e.currentTarget.style.borderColor = 'var(--glass-border)'; 
      }}
    >
      {/* Header Card (Immagine) */}
      <div style={{ height: '180px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {game.cover ? (
          <img src={game.cover} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(236,72,153,0.1) 100%)' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h2 style={{ fontSize: '1.2rem', lineHeight: '1.2', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0, color: 'white' }}>{game.title}</h2>
          {game.year && (
            <span style={{ background: 'var(--accent-gradient)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
              {game.year}
            </span>
          )}
        </div>
      </div>

      {/* Body Card */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
          {game.platforms?.slice(0, 3).map(p => (
            <span key={p} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {p}
            </span>
          ))}
          <span style={{ background: 'rgba(109,40,217,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            {game.genre}
          </span>
        </div>

        <div style={{ padding: '10px 0', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-secondary)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>Dettagli <ChevronRight size={14} /></span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
