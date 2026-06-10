import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import GameService from '../services/GameService';
import GameCard from '../components/GameCard';
import LoadingScreen from '../components/LoadingScreen';
import ModelDownloader from '../components/ModelDownloader';
import { motion } from 'framer-motion';

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
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
            <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: '250px', height: '40px', borderRadius: '8px' }} />
          </div>
          <div className="skeleton" style={{ width: '180px', height: '20px', borderRadius: '4px', margin: '0 auto' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel" style={{ display: 'flex', height: '140px', overflow: 'hidden' }}>
              <div className="skeleton" style={{ width: '100px', height: '100%' }} />
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton" style={{ width: '60%', height: '24px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '40%', height: '16px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '80%', height: '16px', marginTop: 'auto', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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

  // Varianti per lo stagger dei risultati
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ paddingBottom: '60px' }}
    >
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

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {results.map((game) => (
          <motion.div key={game.id} variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {game.aiReason && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,242,254,0.1)', borderLeft: '3px solid var(--accent-ultra)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                " {game.aiReason} "
              </div>
            )}
            <GameCard
              game={game}
              onClick={() => navigate(`/game/${encodeURIComponent(game.title)}`, { state: { game } })}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
