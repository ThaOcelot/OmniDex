import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bell, Trash2 } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([
    { id: 1, title: 'Helldivers 2', newUpdates: 2 },
    { id: 2, title: 'Final Fantasy VII Rebirth', newUpdates: 0 }
  ]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem' }}>I tuoi <span className="text-gradient">Preferiti</span></h1>
        <button className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}>
          <Bell size={18} /> Notifiche Attive
        </button>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Heart size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <p style={{ fontSize: '1.2rem' }}>Non hai ancora aggiunto giochi ai preferiti.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {favorites.map(game => (
            <div key={game.id} className="glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: '24px' }}>
              {game.newUpdates > 0 && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {game.newUpdates} Novità
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{game.title}</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <Link to={`/game/${encodeURIComponent(game.title)}`} className="text-gradient" style={{ fontWeight: '600' }}>
                  Vedi dettagli
                </Link>
                <button className="btn-icon" style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} onClick={() => setFavorites(favorites.filter(f => f.id !== game.id))}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
