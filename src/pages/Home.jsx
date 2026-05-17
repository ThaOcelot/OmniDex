import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';
import RAWGService from '../services/RAWGService';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [trending, setTrending] = useState(['Helldivers 2', 'Final Fantasy VII Rebirth', "Dragon's Dogma 2"]);

  useEffect(() => {
    const loadTrendingGames = async () => {
      try {
        const cached = localStorage.getItem('trending_games');
        const lastUpdated = localStorage.getItem('trending_last_updated');
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        // Se abbiamo i dati in cache e risalgono a meno di una settimana fa, usiamoli!
        if (cached && lastUpdated && (now - parseInt(lastUpdated, 10) < oneWeek)) {
          setTrending(JSON.parse(cached));
          return;
        }

        // Altrimenti interroghiamo RAWG per ottenere i trend delle ultime 40 giornate
        const today = new Date();
        const lastMonth = new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000);
        const todayStr = today.toISOString().split('T')[0];
        const lastMonthStr = lastMonth.toISOString().split('T')[0];

        console.log("📡 Aggiornamento settimanale dei giochi in trend...");
        const data = await RAWGService.get('/games', {
          dates: `${lastMonthStr},${todayStr}`,
          ordering: '-added',
          page_size: 4
        });

        if (data && data.results && data.results.length > 0) {
          const names = data.results.map(g => g.name).filter(Boolean).slice(0, 4);
          if (names.length > 0) {
            setTrending(names);
            localStorage.setItem('trending_games', JSON.stringify(names));
            localStorage.setItem('trending_last_updated', now.toString());
            return;
          }
        }
      } catch (err) {
        console.warn('Errore nel caricamento dei giochi in trend:', err);
      }
      
      // Fallback in caso di assenza di rete o errore
      const cached = localStorage.getItem('trending_games');
      if (cached) {
        setTrending(JSON.parse(cached));
      }
    };

    loadTrendingGames();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      {/* Badge Versione e IA */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(109, 40, 217, 0.1)',
        border: '1px solid rgba(109, 40, 217, 0.3)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--accent-primary)',
        fontWeight: '600',
        marginBottom: '24px',
        fontSize: '0.9rem'
      }}>
        <Sparkles size={16} />
        <span>Potenziato dall'IA • v{CHANGELOG.version}</span>
      </div>

      {/* Obiettivo dell'app (Titolo principale ora che OmniDex è solo in Navbar) */}
      <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--text-primary)', marginBottom: '20px', fontWeight: '900', letterSpacing: '-0.02em', maxWidth: '800px', lineHeight: '1.2' }}>
        L'Enciclopedia Intelligente dei <br/>
        <span className="text-gradient">Videogiochi</span>
      </h1>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 3vw, 1.15rem)', maxWidth: '650px', marginBottom: '40px', lineHeight: '1.6' }}>
        Il tuo hub local-first per esplorare in profondità qualsiasi titolo. Trova all'istante biografie dettagliate dei personaggi, approfondimenti sulle trame, analisi di gameplay e ultime notizie in tempo reale, tutto elaborato e sintetizzato dall'Intelligenza Artificiale.
      </p>

      {/* Modulo di ricerca centrale */}
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Cerca il gioco (es. The Witcher, GTA)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '20px 24px',
            paddingLeft: '60px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            background: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            fontSize: '1.2rem',
            outline: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        <Search size={24} color="var(--text-secondary)" style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)' }} />
        <button type="submit" className="btn-primary" style={{ position: 'absolute', right: '10px', top: '10px', bottom: '10px', padding: '0 24px' }}>
          Cerca
        </button>
      </form>
      
      {/* Sezione Trending Dinamica */}
      <div style={{ marginTop: '60px', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <span>Trending:</span>
        {trending.map((gameName, index) => (
          <span 
            key={index} 
            style={{cursor: 'pointer', transition: 'color 0.3s'}} 
            onMouseOver={e=>e.target.style.color='var(--text-primary)'} 
            onMouseOut={e=>e.target.style.color='var(--text-muted)'} 
            onClick={()=>navigate(`/game/${encodeURIComponent(gameName)}`)}
          >
            {gameName}
          </span>
        ))}
      </div>
    </div>
  );
}
