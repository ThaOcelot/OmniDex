import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import GameService from '../services/GameService';
import GameCard from '../components/GameCard';
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
        const list = await GameService.searchGames(decodedQuery);
        setResults(list);
      } catch (err) {
        if (err.code === 'MODEL_MISSING') {
          setError({ isModelMissing: true });
        } else {
          setError({ message: err.message });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query]);

  if (loading) {
    return <LoadingScreen title={`Sto cercando tutti i giochi con "${decodedQuery}"...`} />;
  }

  if (error) {
    if (error.isModelMissing) {
      return <ModelDownloader onDownloadComplete={() => window.location.reload()} />;
    }
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertTriangle size={64} style={{ margin: '0 auto 20px', color: 'var(--danger)' }} />
        <h2>Ops! Errore di ricerca.</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <Search size={32} color="var(--accent-primary)" />
          <h1 className="search-title" style={{ fontSize: '2rem', fontWeight: '800' }}>
            Risultati per "<span className="text-gradient">{decodedQuery}</span>"
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {results.length > 0 ? `Trovati ${results.length} giochi monumentali.` : 'Nessun gioco trovato negli archivi.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {results.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => navigate(`/game/${encodeURIComponent(game.title)}`, { state: { game } })}
          />
        ))}
      </div>
    </div>
  );
}
