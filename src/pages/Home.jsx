import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
        <span>Potenziato dall'IA</span>
      </div>

      <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', marginBottom: '8px', fontWeight: '900', letterSpacing: '-0.03em', textShadow: '0 0 50px rgba(109, 40, 217, 0.3)' }}>
        <span className="text-gradient">OmniDex</span>
      </h1>
      
      <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '700' }}>
        L'Enciclopedia Intelligente dei Videogiochi
      </h2>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 3vw, 1.15rem)', maxWidth: '650px', marginBottom: '40px', lineHeight: '1.6' }}>
        Il tuo hub local-first per esplorare in profondità qualsiasi titolo. Trova all'istante biografie dettagliate dei personaggi, approfondimenti sulle trame, analisi di gameplay e ultime notizie in tempo reale, tutto elaborato e sintetizzato dall'Intelligenza Artificiale.
      </p>

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
      
      <div style={{ marginTop: '60px', display: 'flex', gap: '20px', color: 'var(--text-muted)' }}>
        <span>Trending:</span>
        <span style={{cursor: 'pointer', transition: 'color 0.3s'}} onMouseOver={e=>e.target.style.color='var(--text-primary)'} onMouseOut={e=>e.target.style.color='var(--text-muted)'} onClick={()=>navigate('/game/Helldivers 2')}>Helldivers 2</span>
        <span style={{cursor: 'pointer', transition: 'color 0.3s'}} onMouseOver={e=>e.target.style.color='var(--text-primary)'} onMouseOut={e=>e.target.style.color='var(--text-muted)'} onClick={()=>navigate('/game/Final Fantasy VII Rebirth')}>FFVII Rebirth</span>
        <span style={{cursor: 'pointer', transition: 'color 0.3s'}} onMouseOver={e=>e.target.style.color='var(--text-primary)'} onMouseOut={e=>e.target.style.color='var(--text-muted)'} onClick={()=>navigate('/game/Dragons Dogma 2')}>Dragon's Dogma 2</span>
      </div>
    </div>
  );
}
