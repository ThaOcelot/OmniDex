import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import GameService from '../services/GameService';
import GameCard from '../components/GameCard';
import LoadingScreen from '../components/LoadingScreen';
import ModelDownloader from '../components/ModelDownloader';

export default function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedQuery = decodeURIComponent(query);
  const isAiSearch = new URLSearchParams(location.search).get('ai') === 'true';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const isPersonalized = isAiSearch && decodedQuery.startsWith("Consigliami dei nuovi giochi");
  const displayQuery = isPersonalized ? "giochi in base ai tuoi gusti" : decodedQuery;

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        const list = isAiSearch ? await GameService.searchGamesAI(decodedQuery) : await GameService.searchGames(decodedQuery);
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
    return <LoadingScreen title={isPersonalized ? "Sto analizzando i tuoi gusti..." : `Sto cercando tutti i giochi con "${decodedQuery}"...`} />;
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
          <Search size={32} color={isAiSearch ? "var(--accent-ultra)" : "var(--accent-primary)"} />
          <h1 className="search-title" style={{ fontSize: '2rem', fontWeight: '800' }}>
            {isAiSearch ? "Il Sommelier consiglia:" : "Risultati per"} "<span className="text-gradient">{displayQuery}</span>"
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {results.length > 0 ? (isAiSearch ? "Ecco i giochi perfetti per te:" : `Trovati ${results.length} giochi.`) : 'Nessun gioco trovato negli archivi.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {results.map((game) => (
          <div key={game.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {game.aiReason && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,242,254,0.1)', borderLeft: '3px solid var(--accent-ultra)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                " {game.aiReason} "
              </div>
            )}
            <GameCard
              game={game}
              onClick={() => navigate(`/game/${encodeURIComponent(game.title)}`, { state: { game } })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
