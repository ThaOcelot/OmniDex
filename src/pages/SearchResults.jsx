import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, AlertTriangle, Search } from 'lucide-react';
import { searchGamesList, setModelInstalledNative } from '../services/gemini';
import LoadingScreen from '../components/LoadingScreen';
import ModelDownloader from '../components/ModelDownloader';

export default function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();
  const decodedQuery = decodeURIComponent(query);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        const list = await searchGamesList(decodedQuery);
        setResults(list);
      } catch (err) {
        if (err.code === 'MODEL_MISSING') {
          setError({ isModelMissing: true });
        } else {
          const isQuota = err.message?.includes('429') || err.message?.toLowerCase().includes('quota');
          setError({ message: err.message, isQuota });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query]);

  const handleDownloadComplete = async () => {
    await setModelInstalledNative();
    window.location.reload();
  };

  if (loading) {
    return <LoadingScreen title={`Sto cercando tutti i giochi con "${decodedQuery}"...`} />;
  }

  if (error) {
    if (error.isModelMissing) {
      return <ModelDownloader onDownloadComplete={handleDownloadComplete} />;
    }
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertTriangle size={64} style={{ margin: '0 auto 20px', color: error.isQuota ? 'var(--warning)' : 'var(--danger)' }} />
        <h2>{error.isQuota ? '⚠️ Limite API raggiunto' : 'Ops! Errore di ricerca.'}</h2>
        {error.isQuota && (
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            Attiva la fatturazione su <a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Google Cloud Console</a> per continuare.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <Search size={32} color="var(--accent-primary)" />
          <h1 className="search-title">
            Risultati per "<span className="text-gradient">{decodedQuery}</span>"
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          {results.length > 0 ? `Trovati ${results.length} giochi. Scegli il capitolo che ti interessa.` : 'Nessun gioco trovato per questa ricerca.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {results.map((game, i) => (
          <div
            key={i}
            className="glass-panel"
            onClick={() => navigate(`/game/${encodeURIComponent(game.title)}`)}
            style={{ 
              padding: '0', 
              cursor: 'pointer', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              position: 'relative'
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
            {/* Header Card (Gradiente) */}
            <div style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(236,72,153,0.1) 100%)', padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                <h2 style={{ fontSize: '1.4rem', lineHeight: '1.3', fontWeight: '800' }}>{game.title}</h2>
                {game.year && (
                  <span style={{ background: 'var(--accent-gradient)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', color: 'white', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    {game.year}
                  </span>
                )}
              </div>
            </div>

            {/* Body Card */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {game.description}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {game.developer && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
                    <span style={{ color: 'var(--text-primary)' }}>{game.developer}</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏷️</div>
                  <span style={{ color: 'var(--text-primary)' }}>{game.genre || 'Vari'}</span>
                </div>

                {game.platforms?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {game.platforms.slice(0, 3).map(p => (
                      <span key={p} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {p}
                      </span>
                    ))}
                    {game.platforms.length > 3 && (
                      <span style={{ padding: '3px 4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{game.platforms.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Card */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-secondary)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>Scopri enciclopedia <ChevronRight size={16} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
