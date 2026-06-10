import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Check } from 'lucide-react';
import { db } from '../services/db';
import HapticService from '../services/HapticService';
import { motion } from 'framer-motion';

const STATUS_OPTIONS = [
  { key: 'backlog',    label: 'Da Giocare',  emoji: '🕹️', color: '#6366f1' },
  { key: 'playing',   label: 'In Corso',    emoji: '▶️',  color: '#f59e0b' },
  { key: 'completed', label: 'Completato',  emoji: '✅',  color: '#10B981' },
  { key: 'dropped',   label: 'Abbandonato', emoji: '❌',  color: '#ef4444' },
];

const GameCard = ({ game, onClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedStatus, setSavedStatus] = useState(null);
  
  // 3D Tilt State
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Max 10 degrees tilt
    const rotateY = ((x / rect.width) - 0.5) * 15;
    const rotateX = ((y / rect.height) - 0.5) * -15;
    
    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ opacity: 0, x: 50, y: 50 });
  };

  useEffect(() => {
    db.isFavorite(game.id).then(async (isFav) => {
      if (isFav) {
        const favs = await db.getFavorites();
        const found = favs.find(f => f.id === game.id);
        setSavedStatus(found?.status || 'backlog');
      }
    });
  }, [game.id]);

  const handleAddWithStatus = async (e, status) => {
    e.stopPropagation();
    await db.addFavorite({
      id: game.id,
      title: game.title,
      cover: game.cover,
      rating: game.rating || 0,
      genres: game.genres || [],
      status,
    });
    setSavedStatus(status);
    await HapticService.success();
    setMenuOpen(false);
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    setMenuOpen(v => !v);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.key === savedStatus);

  return (
    <motion.div
      className="glass-panel"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: '0',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s, border-color 0.3s', // Rimuovi transition su transform perché ci pensa Framer/tilt
        display: 'flex',
        flexDirection: 'column',
        /* overflow VISIBILE sul card così il dropdown non viene tagliato */
        overflow: 'visible',
        position: 'relative',
        height: '100%',
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transformStyle: 'preserve-3d',
        boxShadow: rotate.x !== 0 || rotate.y !== 0 ? '0 20px 40px rgba(109, 40, 217, 0.3)' : 'var(--shadow-glass)',
        borderColor: rotate.x !== 0 || rotate.y !== 0 ? 'rgba(236, 72, 153, 0.5)' : 'var(--glass-border)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
        opacity: glare.opacity,
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
        zIndex: 40,
        borderRadius: 'inherit'
      }} />
      {/* Pulsante + posizionato sul CARD (overflow visible), non nell'img */}
      <div
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 50 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handlePlusClick}
          title={savedStatus ? `Stato: ${currentStatus?.label}` : 'Aggiungi alla lista'}
          style={{
            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
            background: savedStatus ? `${currentStatus?.color}ee` : 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s, background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {savedStatus ? currentStatus?.emoji : <Plus size={16} />}
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', top: '38px', right: 0, zIndex: 9999,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            minWidth: '165px',
          }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={(e) => handleAddWithStatus(e, opt.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '10px 14px',
                  border: 'none',
                  background: savedStatus === opt.key ? `${opt.color}22` : 'transparent',
                  color: savedStatus === opt.key ? opt.color : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.82rem',
                  fontWeight: savedStatus === opt.key ? '700' : '400',
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = `${opt.color}18`}
                onMouseOut={e => e.currentTarget.style.background = savedStatus === opt.key ? `${opt.color}22` : 'transparent'}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
                {savedStatus === opt.key && <Check size={12} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Immagine — overflow:hidden solo qui */}
      <div style={{ height: '180px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
        {game.cover ? (
          <img src={game.cover} alt={game.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(236,72,153,0.1) 100%)' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', right: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h2 style={{ fontSize: '1.2rem', lineHeight: '1.2', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0, color: 'white' }}>{game.title}</h2>
          {game.year && (
            <span style={{ background: 'var(--accent-gradient)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
              {game.year}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
          {game.platforms?.slice(0, 4).map(p => (
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
    </motion.div>
  );
};

export default GameCard;
