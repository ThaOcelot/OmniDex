import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, Plus, Check, Star } from 'lucide-react';
import { db } from '../services/db';
import HapticService from '../services/HapticService';
import { motion } from 'framer-motion';

const STATUS_OPTIONS = [
  { key: 'backlog',    label: 'Da Giocare',  emoji: '🕹️', color: '#6366f1' },
  { key: 'playing',   label: 'In Corso',    emoji: '▶️',  color: '#f59e0b' },
  { key: 'completed', label: 'Completato',  emoji: '✅',  color: '#10B981' },
  { key: 'dropped',   label: 'Abbandonato', emoji: '❌',  color: '#ef4444' },
];

// Colori per genere — usati sul badge genere in basso
const GENRE_COLORS = {
  'Action': '#ef4444',
  'RPG': '#8b5cf6',
  'Adventure': '#06b6d4',
  'Shooter': '#f97316',
  'Strategy': '#10b981',
  'Simulation': '#3b82f6',
  'Puzzle': '#ec4899',
  'Racing': '#f59e0b',
  'Fighting': '#dc2626',
  'Sports': '#22c55e',
  'Platformer': '#a78bfa',
  'Horror': '#6b7280',
  'default': '#6d28d9',
};

function getRatingColor(rating) {
  if (!rating || rating === 0) return null;
  if (rating >= 4.0) return '#10b981'; // verde
  if (rating >= 3.0) return '#f59e0b'; // giallo
  return '#ef4444'; // rosso
}

const GameCard = ({ game, onClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedStatus, setSavedStatus] = useState(null);

  // ── Tilt 3D via DOM ref (zero re-render) ──────────────────────────────────
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 14;
      const rotateX = ((y / rect.height) - 0.5) * -14;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow = '0 20px 40px rgba(109, 40, 217, 0.3)';
      card.style.borderColor = 'rgba(236, 72, 153, 0.5)';
      if (glareRef.current) {
        const gx = (x / rect.width) * 100;
        const gy = (y / rect.height) * 100;
        glareRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`;
        glareRef.current.style.opacity = '1';
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    card.style.boxShadow = 'var(--shadow-glass)';
    card.style.borderColor = 'var(--glass-border)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  }, []);

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
  const ratingColor = getRatingColor(game.rating);
  const genreColor = GENRE_COLORS[game.genre] || GENRE_COLORS['default'];

  return (
    <motion.div
      ref={cardRef}
      className="glass-panel"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={{
        padding: '0',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        position: 'relative',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare Overlay */}
      <div ref={glareRef} style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
        zIndex: 40,
        borderRadius: 'inherit',
      }} />

      {/* Pulsante + */}
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
            color: 'var(--text-on-accent)', cursor: 'pointer',
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

      {/* Immagine */}
      <div style={{ height: '180px', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
        {game.cover ? (
          <img
            src={game.cover}
            alt={game.title}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(236,72,153,0.1) 100%)' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)' }} />

        {/* Rating bar colorata in fondo all'immagine */}
        {ratingColor && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
            background: `linear-gradient(90deg, ${ratingColor}, ${ratingColor}88)`,
          }} />
        )}

        <div style={{ position: 'absolute', bottom: '15px', left: '15px', right: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h2 style={{ fontSize: '1.2rem', lineHeight: '1.2', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0, color: 'var(--text-on-accent)' }}>
            {game.title}
          </h2>
          {game.year && (
            <span style={{ background: 'var(--accent-gradient)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-on-accent)', fontWeight: 'bold', flexShrink: 0 }}>
              {game.year}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
          {game.platforms?.slice(0, 3).map(p => (
            <span key={p} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {p}
            </span>
          ))}
          {/* Badge genere colorato */}
          <span style={{ background: `${genreColor}22`, border: `1px solid ${genreColor}44`, padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', color: genreColor, fontWeight: '700', marginLeft: 'auto' }}>
            {game.genre}
          </span>
        </div>

        {/* Rating + CTA */}
        <div style={{ padding: '10px 0', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {game.rating > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={13} fill={ratingColor || 'gold'} color={ratingColor || 'gold'} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: ratingColor || 'var(--text-primary)' }}>
                {game.rating.toFixed(1)}
              </span>
            </div>
          ) : <div />}
          <span style={{ fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-secondary)' }}>
            Dettagli <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
