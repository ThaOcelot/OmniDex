import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ChevronLeft } from 'lucide-react';
import RAWGService from '../services/RAWGService';
import GameService from '../services/GameService';

export default function ReleaseRadar() {
  const [upcomingFar, setUpcomingFar] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    RAWGService.getUpcomingGames().then(games => {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);
      
      // I giochi della release radar sono quelli che escono DOPO i prossimi 30 giorni (oppure tutti, a scelta. Mettiamo tutti o solo quelli futuri?)
      // Il carosello in home ha i primi 30 giorni. La release radar generale di solito li mostra tutti o quelli dal 31° giorno in poi.
      // Mostriamo tutti i prossimi 6 mesi per completezza.
      setUpcomingFar(games);
      setLoading(false);
      
      // Avvia il pre-fetch in background dei dettagli grezzi
      GameService.preFetchUpcomingGames(games).catch(err => console.warn("Pre-fetch failed:", err));
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  // Raggruppa i giochi per mese (formato YYYY-MM per ordinamento)
  const groupByMonth = (gamesList) => {
    const groups = {};
    gamesList.forEach(game => {
      if (!game.released) return;
      const date = new Date(game.released);
      if (isNaN(date.getTime())) return;
      
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      if (!groups[key]) {
        groups[key] = {
          label: date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
          games: []
        };
        // Capitalizza l'iniziale del mese
        groups[key].label = groups[key].label.charAt(0).toUpperCase() + groups[key].label.slice(1);
      }
      groups[key].games.push(game);
    });
    return groups;
  };

  const groupedGames = groupByMonth(upcomingFar);
  const sortedMonthKeys = Object.keys(groupedGames).sort();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarClock size={28} color="var(--accent-secondary)" />
          Release Radar
        </h1>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Scopri i titoli in arrivo nei prossimi 6 mesi suddivisi per mese d'uscita.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="animate-pulse">Caricamento uscite...</div>
        </div>
      ) : sortedMonthKeys.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sortedMonthKeys.map((key) => {
            const group = groupedGames[key];
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Intestazione Mese Premium */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid var(--glass-border)',
                  paddingBottom: '8px',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-gradient)'
                  }} />
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    letterSpacing: '-0.01em',
                    color: 'var(--text-primary)'
                  }}>
                    {group.label}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)'
                  }}>
                    {group.games.length} {group.games.length === 1 ? 'titolo' : 'titoli'}
                  </span>
                </div>

                {/* Lista Giochi */}
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  {group.games.map((game) => (
                    <div 
                      key={game.id}
                      onClick={() => navigate(`/game/${encodeURIComponent(game.name)}`, { state: { game: { id: game.id } } })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '12px',
                        border: '1px solid var(--glass-border)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateX(6px)';
                        e.currentTarget.style.borderColor = 'rgba(109, 40, 217, 0.4)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                      }}
                    >
                      <img 
                        src={game.background_image || 'https://via.placeholder.com/60x80?text=No+Cover'} 
                        alt={game.name} 
                        style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                        loading="lazy"
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                          {game.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(game.released).toLocaleDateString('it-IT')}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {game.parent_platforms?.slice(0, 3).map((p, i) => (
                            <span key={i} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                              {p.platform.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Nessun gioco in uscita nei prossimi 6 mesi.</div>
      )}
    </div>
  );
}
