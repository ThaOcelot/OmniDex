import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, Info } from 'lucide-react';
import { db } from '../services/db';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadFavorites = async () => {
    const data = await db.getFavorites();
    // Ordina per data di aggiunta (i più recenti prima)
    if (data) {
      data.sort((a, b) => b.addedAt - a.addedAt);
      setFavorites(data);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (id) => {
    await db.removeFavorite(id);
    loadFavorites();
  };



  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>I tuoi <span className="text-gradient">Preferiti</span></h1>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Heart size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <p style={{ fontSize: '1.2rem' }}>Non hai ancora aggiunto giochi ai preferiti.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {favorites.map(game => (
            <div key={game.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div 
                style={{ height: '160px', width: '100%', background: `url(${game.cover}) center/cover no-repeat`, borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }} 
                onClick={() => navigate(`/game/${encodeURIComponent(game.title)}`, { state: { game: { id: game.id } } })}
              />
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', lineHeight: 1.3 }}>{game.title}</h3>
                {game.rating > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '15px' }}>⭐ {game.rating.toFixed(1)}</div>}
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/game/${encodeURIComponent(game.title)}`} state={{ game: { id: game.id } }} className="text-gradient" style={{ fontWeight: '600' }}>
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
