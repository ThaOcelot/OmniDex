import React from 'react';
import { ExternalLink, Zap, Newspaper } from 'lucide-react';

const NewsCard = ({ news, onClick }) => {
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
        height: '100%'
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(109,40,217,0.2)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
      }}
    >
      {/* Header con icona */}
      <div style={{ 
        padding: '16px 20px', 
        background: 'linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(236,72,153,0.08) 100%)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Newspaper size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {news.source}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{news.date}</span>
      </div>

      {/* Corpo */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ 
          fontSize: '1rem', 
          lineHeight: '1.5', 
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {news.title}
        </h4>

        {news.summary && (
          <p style={{ 
            fontSize: '0.85rem', 
            lineHeight: '1.6', 
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {news.summary}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>
            <Zap size={14} /> Leggi Riassunto
          </div>
          <ExternalLink size={14} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
