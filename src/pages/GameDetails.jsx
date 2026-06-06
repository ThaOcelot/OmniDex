import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Loader2, Heart, ExternalLink, Calendar, Gamepad, Users,
  AlertTriangle, Trophy, Star, Globe, ArrowLeft, BookOpen, Sparkles, Lock,
  Cpu, Info, Zap, ChevronRight, Film, Package, Layers, Award, User, Video, ThumbsUp, X, ChevronLeft, ZoomIn, ZoomOut, Share2
} from 'lucide-react';
import GameService from '../services/GameService';
import { db } from '../services/db';
import NewsCard from '../components/NewsCard';
import LoadingScreen from '../components/LoadingScreen';
import Modal from '../components/Modal';
import { LOADING_MESSAGES } from '../data/loadingMessages';
import NotificationService from '../services/NotificationService';
import HapticService from '../services/HapticService';
import IAPService from '../services/IAPService';
import AdService from '../services/AdService';
import FirebaseService from '../services/FirebaseService';
import logoUrl from '../assets/logo.png';

export default function GameDetails() {
  const { gameName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // App States
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Modal States
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterDeepDive, setCharacterDeepDive] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsSummary, setNewsSummary] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [touchStartX, setTouchStartX] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const heroRef = useRef(null);

  // Ultra AI States
  const [tier, setTier] = useState(IAPService.getTier());
  const [compatibility, setCompatibility] = useState(null);
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);
  const [previousSummary, setPreviousSummary] = useState(null);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  useEffect(() => {
    return IAPService.subscribe((t) => setTier(t));
  }, []);

  // Report AI States
  const [reportAIData, setReportAIData] = useState(null);
  const [reportReason, setReportReason] = useState('inaccurate');
  const [reportComment, setReportComment] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Rewarded Ads States
  const [loadingAd, setLoadingAd] = useState(false);

  // Character Voting States
  const [characterVotes, setCharacterVotes] = useState({ votes: {}, totalVotes: 0 });
  const [userVote, setUserVote] = useState(null);
  const [votesLoading, setVotesLoading] = useState(false);

  useEffect(() => {
    if (modalLoading) {
      const msg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      setLoadingMessage(msg);
    }
  }, [modalLoading]);

  const decodedName = decodeURIComponent(gameName);

  // Deep-link da notifica: apre direttamente la notizia specifica che ha generato la notifica
  const openNewsUrl = location.state?.openNewsUrl || null;
  const openNewsTitle = location.state?.openNewsTitle || null;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const gameId = location.state?.game?.id;
      const info = await GameService.getGameDetails(gameId, decodedName);
      setGameData(info);
      if (info) {
        const isFav = await db.isFavorite(info.id);
        setIsFavorite(isFav);
      }
      GameService.getGameNews(decodedName).then(setNewsData).catch(console.error);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError({ message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!gameData) return;
    setLoading(true);
    try {
      const gameId = location.state?.game?.id || gameData.id;
      const info = await GameService.getGameDetails(gameId, decodedName, true);
      if (info) {
        setGameData(info);
        const isFav = await db.isFavorite(info.id);
        setIsFavorite(isFav);
      }
    } catch (err) {
      console.error("❌ Error regenerating data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gameName]);

  // Quando le notizie si caricano e c'è un deep-link da notifica, apri quella notizia
  useEffect(() => {
    if (!openNewsUrl || newsData.length === 0) return;

    // Switcha al tab notizie
    setActiveTab('news');

    // Cerca la notizia specifica nella lista caricata
    const targetNews = newsData.find(n => n.url === openNewsUrl);
    const newsToOpen = targetNews || {
      title: openNewsTitle || 'Notizia',
      url: openNewsUrl,
      source: '',
      date: '',
      summary: null
    };

    // Simula il click sulla notizia per aprire il modal con il riassunto AI
    const fakeEvent = { preventDefault: () => {} };
    handleNewsClick(newsToOpen, fakeEvent);
  }, [newsData, openNewsUrl]);

  // Caricamento dei voti dei personaggi quando si apre il tab
  useEffect(() => {
    if (activeTab === 'characters' && gameData?.id) {
      setVotesLoading(true);
      // Carica il voto salvato in locale
      const savedVote = localStorage.getItem(`voted_chars_${gameData.id}`);
      if (savedVote) {
        setUserVote(savedVote);
      }
      
      // Carica i voti globali
      FirebaseService.getCharacterVotes(gameData.id).then(data => {
        setCharacterVotes(data);
        setVotesLoading(false);
      });
    }
  }, [activeTab, gameData?.id]);

  const handleToggleFavorite = async () => {
    if (!gameData) return;
    if (isFavorite) {
      await db.removeFavorite(gameData.id);
      setIsFavorite(false);
      await HapticService.light();
    } else {
      await db.addFavorite({
        id: gameData.id,
        title: gameData.title,
        cover: gameData.cover,
        rating: gameData.rating,
        genres: gameData.genres || [],
        status: 'backlog',
      });
      setIsFavorite(true);
      await HapticService.success();
      NotificationService.initFavoriteLatestNews(gameData.id, gameData.title);
    }
  };

  const handleShare = async () => {
    await HapticService.medium();
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: gameData.title,
        text: `Scopri ${gameData.title} su OmniDex — l'enciclopedia intelligente dei videogiochi!`,
        url: `https://thaocelot.github.io/OmniDex/#/game/${encodeURIComponent(gameData.title)}`,
        dialogTitle: `Condividi ${gameData.title}`,
      });
    } catch {
      // Fallback per browser: copia negli appunti
      try {
        await navigator.clipboard.writeText(`https://thaocelot.github.io/OmniDex/#/game/${encodeURIComponent(gameData.title)}`);
        alert('Link copiato negli appunti!');
      } catch { /* niente */ }
    }
  };



  // ─── Early returns ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="game-details-page animate-fade-in" style={{ padding: 'clamp(15px, 4vw, 30px)', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '120px', height: '20px', borderRadius: '4px' }} />
        </div>
        <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 40px)', marginBottom: '30px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div className="skeleton" style={{ width: '40%', height: '48px', marginBottom: '16px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '20%', height: '24px', marginBottom: '32px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '95%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '20px' }} />
        </div>
        <div className="glass-panel" style={{ padding: '24px', minHeight: '200px' }}>
          <div className="skeleton" style={{ width: '30%', height: '24px', marginBottom: '20px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '95%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

  if (!gameData && !error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertTriangle size={64} style={{ margin: '0 auto 20px', color: 'var(--warning)' }} />
        <h2>Gioco non trovato</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Non siamo riusciti a recuperare i dettagli per questo titolo.</p>
        <button onClick={() => navigate(-1)} className="btn-primary" style={{ marginTop: '20px' }}>Torna indietro</button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '20px' }} />
        <h2>Errore di Caricamento</h2>
        <p>{error.message}</p>
        <button onClick={fetchData} className="btn-primary" style={{ marginTop: '20px' }}>Riprova</button>
      </div>
    );
  }

  const handleOpenReportAI = (section, gameTitle) => {
    setReportAIData({ section, gameTitle });
    setReportReason('inaccurate');
    setReportComment('');
    setReportSubmitted(false);
  };

  const handleCloseReportAI = () => {
    setReportAIData(null);
  };

  const handleSubmitReportAI = async () => {
    await HapticService.medium();
    
    // Costruisci il template precompilato dell'email
    const subject = `Segnalazione Contenuto IA - ${reportAIData.gameTitle} (${reportAIData.section})`;
    const body = `Segnalazione da OmniDex\n\nGioco: ${reportAIData.gameTitle}\nSezione: ${reportAIData.section}\nMotivo: ${reportReason === 'inaccurate' ? 'Non accurato/allucinazione' : reportReason === 'offensive' ? 'Offensivo/inappropriato' : 'Altro'}\nDettagli:\n${reportComment}`;
    const mailtoUrl = `mailto:thaocelot@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      if (window.Capacitor?.isNativePlatform?.()) {
        window.open(mailtoUrl, '_system');
      } else {
        window.location.href = mailtoUrl;
      }
    } catch (e) {
      console.warn("🔔 Impossibile aprire il client email:", e);
    }
    
    setReportSubmitted(true);
  };

  const handleCharacterClick = (character) => {
    if (tier !== 'ultra') {
      window.dispatchEvent(new CustomEvent('open-settings'));
      return;
    }
    navigate(`/character/${encodeURIComponent(character.name)}`);
  };

  const handleNewsClick = async (news, e) => {
    e.preventDefault();
    setSelectedNews(news);
    setNewsSummary(null);
    setModalLoading(true);
    try {
      const data = await GameService.summarizeNews(news.title, news.url);
      setNewsSummary(data);
    } catch (err) {
      console.error(err);
      setNewsSummary({ summary: "Errore durante il caricamento del riassunto della notizia." });
    } finally {
      setModalLoading(false);
    }
  };

  const handleCompatibilityCheck = async () => {
    if (tier !== 'ultra') {
      window.dispatchEvent(new CustomEvent('open-settings'));
      return;
    }
    setLoadingCompatibility(true);
    try {
      const res = await GameService.analyzeCompatibility(gameData.title, typeof gameData.plot === 'string' ? gameData.plot : '');
      setCompatibility(res);
    } catch (e) {
      console.error(e);
      setCompatibility({ score: 50, reason: "Errore durante l'analisi." });
    } finally {
      setLoadingCompatibility(false);
    }
  };

  const handlePreviousSummary = async () => {
    if (tier !== 'ultra') {
      window.dispatchEvent(new CustomEvent('open-settings'));
      return;
    }
    setLoadingPrevious(true);
    try {
      const res = await GameService.summarizePreviousGames(gameData.title);
      setPreviousSummary(res);
    } catch (e) {
      console.error(e);
      setPreviousSummary("Impossibile recuperare il riassunto in questo momento.");
    } finally {
      setLoadingPrevious(false);
    }
  };

  const handleWatchAdForTokens = async () => {
    setLoadingAd(true);
    await AdService.showRewardedAd(
      () => {
        // Premiato!
        setLoadingAd(false);
        IAPService.addExtraAiToken();
        // Aggiorna lo stato localmente per ricaricare i dati o rimuovere il blocco
        setGameData(prev => ({ ...prev, _aiLimitReached: false }));
        // Ricarica i dati per sicurezza o solo il tab corrente
        fetchData(); 
      },
      (errorMsg) => {
        setLoadingAd(false);
        if (errorMsg) alert(errorMsg);
      }
    );
  };

  const handleVoteCharacter = async (e, characterName) => {
    e.stopPropagation(); // Evita di aprire il deep dive del personaggio
    if (!gameData || userVote === characterName) return;
    
    await HapticService.medium();
    
    const previousVote = userVote;
    
    // Aggiorna lo stato ottimisticamente
    setUserVote(characterName);
    localStorage.setItem(`voted_chars_${gameData.id}`, characterName);
    
    setCharacterVotes(prev => {
      const newVotes = { ...prev.votes };
      if (previousVote && newVotes[previousVote] > 0) {
        newVotes[previousVote] -= 1;
      }
      newVotes[characterName] = (newVotes[characterName] || 0) + 1;
      
      return {
        votes: newVotes,
        totalVotes: previousVote ? prev.totalVotes : prev.totalVotes + 1
      };
    });

    // Invia al server
    await FirebaseService.voteCharacter(gameData.id, characterName, previousVote);
  };

  const tabs = [
    { id: 'info', label: 'Informazioni', icon: <Info size={18} /> },
    { id: 'story', label: 'Trama', icon: <BookOpen size={18} /> },
    { id: 'characters', label: 'Personaggi', icon: <Users size={18} /> },
    { id: 'gameplay', label: 'Gameplay', icon: <Zap size={18} /> },
    { id: 'news', label: 'Notizie', icon: <Calendar size={18} /> },
  ];


  const formatText = (text) => {
    if (!text) return { __html: '' };
    // Prima rimuoviamo i tag HTML grezzi (es. <br>, <p>, <b> da RAWG)
    // poi applichiamo le conversioni markdown di Gemini
    const stripped = text
      .replace(/<br\s*\/?>/gi, '\n')      // <br> → a-capo
      .replace(/<\/p>/gi, '\n')          // </p> → a-capo
      .replace(/<[^>]+>/g, '');           // rimuovi tutti gli altri tag HTML
    const html = stripped
      .replace(/###?\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/__(.*?)__/g, '<b>$1</b>')
      .replace(/_(.*?)_/g, '<i>$1</i>');
    return { __html: html };
  };

  return (
    <div className="game-details-page animate-fade-in" style={{ padding: 'clamp(15px, 4vw, 30px)', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontSize: '0.95rem', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} /> Torna ai risultati
      </button>

      {/* Hero Header con Parallax */}
      <div
        ref={heroRef}
        className="glass-panel"
        style={{ padding: 'clamp(20px, 5vw, 40px)', position: 'relative', overflow: 'hidden', marginBottom: '30px', width: '100%' }}
        onScroll={e => setParallaxY(e.target.scrollTop * 0.3)}
      >
        {/* Cover con effetto parallax */}
        {gameData.cover && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${gameData.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: `center ${parallaxY}px`,
            transform: `translateY(${parallaxY * 0.4}px) scale(1.1)`,
            filter: 'blur(2px) brightness(0.25)',
            zIndex: 0,
            transition: 'transform 0.05s linear',
          }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(109,40,217,0.35) 0%, rgba(236,72,153,0.15) 100%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0, minWidth: '280px' }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', marginBottom: '8px', lineHeight: 1.1, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{gameData.title}</h1>
              {gameData.originalTitle && gameData.originalTitle !== gameData.title && (
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '12px', fontStyle: 'italic', wordBreak: 'break-word' }}>{gameData.originalTitle}</p>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {gameData.genres?.map(g => (
                  <span key={g} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.4)', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{g}</span>
                ))}
              </div>
              
              {/* Descrizione / Panoramica — usa plot (traduzione RAWG, la panoramica ufficiale) */}
              <div style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '16px' }}>
                <span dangerouslySetInnerHTML={formatText(
                  typeof gameData.plot === 'string' 
                    ? (isDescriptionExpanded 
                        ? gameData.plot 
                        : (gameData.plot.length > 500 ? gameData.plot.substring(0, 500) + '...' : gameData.plot))
                    : ''
                )} />
                {gameData.plot?.length > 500 && (
                  <span onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600', marginLeft: '8px', borderBottom: '1px solid var(--accent-primary)' }}>
                    {isDescriptionExpanded ? ' Mostra meno' : ' Leggi tutto'}
                  </span>
                )}
              </div>

            </div>
            <div className="hero-stats" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <button className="btn-icon" onClick={handleToggleFavorite}
                style={{ color: isFavorite ? 'var(--accent-secondary)' : 'var(--text-primary)', border: `1px solid ${isFavorite ? 'var(--accent-secondary)' : 'var(--glass-border)'}` }}>
                <Heart fill={isFavorite ? 'var(--accent-secondary)' : 'none'} />
              </button>
              <button className="btn-icon" onClick={handleShare}
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }} title="Condividi">
                <Share2 size={18} />
              </button>
              {gameData.metacritic && (
                <div style={{ textAlign: 'center', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>{gameData.metacritic}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Metacritic</div>
                </div>
              )}
              {gameData.rating > 0 && (
                <div style={{ textAlign: 'center', background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.4)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-primary)' }}>⭐ {gameData.rating.toFixed(1)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>RAWG ({gameData.ratingsCount})</div>
                </div>
              )}
            </div>
          </div>

          <div className="quick-stats" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
            {gameData.developers?.length > 0 && (
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sviluppatore</div>
                <div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.developers.map(d => d.name || d).join(', ')}</div>
              </div>
            )}
            {gameData.publishers?.length > 0 && (
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Publisher</div>
                <div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.publishers.map(p => p.name || p).join(', ')}</div>
              </div>
            )}
            {gameData.releaseDate && (
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Uscita</div>
                <div style={{ fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {gameData.releaseDate}
                  {gameData.tba && <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>TBA</span>}
                </div>
              </div>
            )}
            {gameData.esrb && (
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>ESRB</div>
                <div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.esrb}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parent Games Banner */}
      {gameData.parentGames?.length > 0 && (
        <div style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '12px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Questo contenuto è un'espansione. Il gioco base è: <strong onClick={() => navigate(`/game/${encodeURIComponent(gameData.parentGames[0].name)}`, { state: { game: { id: gameData.parentGames[0].id } } })} style={{ color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline' }}>{gameData.parentGames[0].name}</strong>
          </span>
        </div>
      )}

      {/* Matchmaker AI Banner */}
      {!gameData._aiLimitReached && (
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(to right, rgba(0, 242, 254, 0.05), rgba(79, 172, 254, 0.05))', borderLeft: '3px solid #00f2fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#00f2fe" />
              <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Matchmaker AI</strong>
            </div>
            {!compatibility && !loadingCompatibility && (
              <button 
                onClick={handleCompatibilityCheck}
                style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid #00f2fe', color: '#00f2fe', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Analizza Compatibilità
                {tier !== 'ultra' && <Lock size={12} />}
              </button>
            )}
          </div>
          {loadingCompatibility && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Loader2 size={16} className="spin" /> Analisi della tua raccolta in corso...
            </div>
          )}
          {compatibility && (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', border: `3px solid ${compatibility.score >= 80 ? '#10b981' : compatibility.score >= 50 ? '#f59e0b' : '#ef4444'}` }}>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{compatibility.score}%</strong>
              </div>
              <div style={{ flex: 1, minWidth: '200px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {compatibility.reason}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="tab-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: 'var(--radius-full)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--glass-border)',
              background: activeTab === tab.id ? 'var(--accent-gradient)' : 'var(--bg-glass)',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
              whiteSpace: 'nowrap', transition: 'all 0.2s ease'
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>


          {/* Valutazioni / Ratings */}
          {gameData.ratings?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Star size={16} /> Valutazioni Giocatori</h3>
                {gameData.reviewsCount > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{gameData.reviewsCount} recensioni testuali</span>}
              </div>
              <div style={{ display: 'flex', height: '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '16px' }}>
                {gameData.ratings.map((r, i) => {
                  const colors = { exceptional: '#10b981', recommended: '#3b82f6', meh: '#f59e0b', skip: '#ef4444' };
                  return <div key={i} style={{ width: `${r.percent}%`, backgroundColor: colors[r.title] || '#6d28d9' }} title={`${r.title}: ${r.percent}%`} />
                })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {gameData.ratings.map((r, i) => {
                  const colors = { exceptional: '#10b981', recommended: '#3b82f6', meh: '#f59e0b', skip: '#ef4444' };
                  const labels = { exceptional: 'Eccezionale', recommended: 'Consigliato', meh: 'Così così', skip: 'Da evitare' };
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[r.title] || '#6d28d9' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{labels[r.title] || r.title} ({r.count})</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Player Status */}
          {gameData.addedByStatus && Object.keys(gameData.addedByStatus).length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Users size={16} /> Stato Giocatori</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {Object.entries(gameData.addedByStatus).map(([status, count]) => {
                  const labels = { yet: 'In coda', owned: 'Posseduto', beaten: 'Completato', toplay: 'Da giocare', dropped: 'Abbandonato', playing: 'In corso' };
                  return (
                    <div key={status} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{labels[status] || status}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Links Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><ExternalLink size={16} /> Collegamenti</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gameData.website && (
                <a href={gameData.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>
                  <Globe size={14} /> Sito Ufficiale
                </a>
              )}
              {gameData.metacriticUrl && (
                <a href={gameData.metacriticUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', textDecoration: 'none', fontSize: '0.95rem' }}>
                  <Star size={14} /> Metacritic Review
                </a>
              )}
            </div>
          </div>

          {/* Reddit Community */}
          {(gameData.redditUrl || gameData.redditPosts?.length > 0) && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Users size={16} /> Community Reddit</h3>
              <a href={gameData.redditUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#FF4500', textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                {gameData.redditName || 'r/Reddit'} <ExternalLink size={14} />
              </a>
              {gameData.redditDescription && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '8px' }}>
                  {gameData.cleanHTML ? gameData.cleanHTML(gameData.redditDescription) : gameData.redditDescription.replace(/<[^>]*>/g, '')}
                </p>
              )}
              {gameData.redditCount > 0 && (
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{gameData.redditCount} post discussi</div>
              )}
              {gameData.redditPosts?.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Ultime Discussioni</div>
                  {gameData.redditPosts.slice(0, 3).map(post => (
                    <a key={post.id} href={post.url} target="_blank" rel="noreferrer" style={{ display: 'block', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', textDecoration: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(post.created).toLocaleDateString()} • {post.username}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Platforms Card */}
          {gameData.platforms?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Gamepad size={16} /> Piattaforme</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {gameData.platforms.map(p => (
                  <span key={p.platform?.id || p.id || (typeof p === 'string' ? p : Math.random())} style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
                    {p.platform?.name || p.name || (typeof p === 'string' ? p : 'Sconosciuta')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* System Requirements */}
          {gameData.platforms?.find(p => p.slug === 'pc' && p.requirements && (p.requirements.minimum || p.requirements.recommended)) && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Cpu size={16} /> Requisiti di Sistema (PC)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {gameData.platforms.find(p => p.slug === 'pc').requirements.minimum && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Minimi</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {gameData.platforms.find(p => p.slug === 'pc').requirements.minimum.replace('Minimum:', '').trim()}
                    </p>
                  </div>
                )}
                {gameData.platforms.find(p => p.slug === 'pc').requirements.recommended && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '8px' }}>Consigliati</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {gameData.platforms.find(p => p.slug === 'pc').requirements.recommended.replace('Recommended:', '').trim()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stores Card */}
          {gameData.stores?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Trophy size={16} /> Dove Acquistare</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {gameData.stores.map(s => (
                  <a key={s.name} href={s.url} target="_blank" rel="noreferrer" style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid var(--accent-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Card */}
          {(gameData.screenshots?.length > 0 || gameData.clip) && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Galleria</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'thin' }}>
                {gameData.clip && (
                  <video controls poster={gameData.clipPreview} style={{ height: '200px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                    <source src={gameData.clip} type="video/mp4" />
                  </video>
                )}
                {gameData.screenshots?.map((s, i) => (
                  <img 
                    key={i} 
                    src={s} 
                    alt={`Screenshot ${i}`} 
                    onClick={() => { setSelectedScreenshotIndex(i); setZoomScale(1); }}
                    style={{ height: '200px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--glass-border)', cursor: 'zoom-in', transition: 'transform 0.2s', flexShrink: 0 }} 
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trivia Card */}
          {gameData.trivia?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 Lo sapevi?</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {gameData.trivia.map((t, i) => <li key={i} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={formatText(t)} />)}
              </ul>
            </div>
          )}

          {/* Trailers */}
          {gameData.trailers?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Film size={16} /> Trailer</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {gameData.trailers.map((t, i) => (
                  <div key={i} style={{ minWidth: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <video controls poster={t.preview} style={{ width: '100%', display: 'block' }}>
                      <source src={t.videoHigh || t.videoLow} type="video/mp4" />
                    </video>
                    <div style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* DLC */}
          {gameData.dlc?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Package size={16} /> DLC & Edizioni</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {gameData.dlc.map((d, i) => (
                  <div key={i} onClick={() => navigate(`/game/${encodeURIComponent(d.name)}`, { state: { game: { id: d.id } } })} style={{ minWidth: '200px', cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--bg-glass)', transition: 'all 0.2s' }}>
                    {d.cover && <img src={d.cover} alt={d.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: '1.3' }}>{d.name}</div>
                      {d.released && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(d.released).toLocaleDateString('it-IT')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Series */}
          {gameData.gameSeries?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Layers size={16} /> Nella stessa serie</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {gameData.gameSeries.map((s, i) => (
                  <div key={i} onClick={() => navigate(`/game/${encodeURIComponent(s.name)}`, { state: { game: { id: s.id } } })} style={{ minWidth: '200px', cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--bg-glass)', transition: 'all 0.2s' }}>
                    {s.cover && <img src={s.cover} alt={s.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: '1.3' }}>{s.name}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                        {s.rating > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>⭐ {s.rating.toFixed(1)}</span>}
                        {s.metacritic && <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700' }}>{s.metacritic}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Games */}
          {gameData.suggested?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><ThumbsUp size={16} /> Giochi Consigliati</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {gameData.suggested.map((s, i) => (
                  <div key={i} onClick={() => navigate(`/game/${encodeURIComponent(s.name)}`, { state: { game: { id: s.id } } })} style={{ minWidth: '200px', cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--bg-glass)', transition: 'all 0.2s' }}>
                    {s.cover && <img src={s.cover} alt={s.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: '1.3' }}>{s.name}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                        {s.rating > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>⭐ {s.rating.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {gameData.achievements?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Award size={16} /> Obiettivi ({gameData.achievementsCount})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {gameData.achievements.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                    {a.image && <img src={a.image} alt={a.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{a.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{a.description}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginTop: '4px', fontWeight: '700' }}>{a.percent}% giocatori</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Modes */}
          {gameData.gameModes?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Users size={16} /> Modalità</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {gameData.gameModes.map(m => (
                  <span key={m} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--success)' }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Development Team */}
          {gameData.developmentTeam?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Cpu size={16} /> Team di Sviluppo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {gameData.developmentTeam.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                    {c.image ? (
                      <img src={c.image} alt={c.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(109,40,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{c.name.charAt(0)}</div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{c.name}</div>
                      {c.positions?.length > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.positions[0]}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Tags */}
          {gameData.tags?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Info size={16} /> Tutti i Tag</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {gameData.tags.filter(t => t.language === 'eng').map(t => (
                  <span key={t.slug} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {['story', 'characters', 'gameplay', 'trivia'].includes(activeTab) && gameData._aiLimitReached ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center', gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(0, 242, 254, 0.4))' }}>💎</div>
          <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1.8rem' }}>Limite Giornaliero Raggiunto</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 24px' }}>
            Hai esaurito le tue analisi gratuite per oggi. Passa al piano <strong style={{ color: '#00f2fe' }}>Ultra</strong> per sbloccare richieste illimitate e accedere a <b>Gemini 2.5 Pro</b>, oppure guarda una pubblicità per sbloccare +1 analisi.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#002538', border: 'none', boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)' }}
              onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
            >
              Scopri OmniDex Ultra
            </button>
            {tier === 'free' && (
              <button 
                onClick={handleWatchAdForTokens}
                disabled={loadingAd}
                style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', cursor: loadingAd ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loadingAd ? <Loader2 size={20} className="spin" /> : '📺 Guarda Pubblicità (+1)'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'story' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen size={22} color="var(--accent-primary)" /> Trama</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handlePreviousSummary} 
                style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid #00f2fe', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 'bold', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Sparkles size={14} /> Cosa è successo prima? {tier !== 'ultra' && <Lock size={12} />}
              </button>
              <button 
                onClick={() => handleOpenReportAI('Trama', gameData.title)} 
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <AlertTriangle size={12} /> Segnala Contenuto IA
              </button>
            </div>
          </div>
          
          {loadingPrevious && (
            <div style={{ padding: '20px', background: 'rgba(0,242,254,0.05)', borderLeft: '3px solid #00f2fe', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
              <Loader2 size={18} className="spin" /> Generazione riassunto saga in corso...
            </div>
          )}
          
          {previousSummary && (
            <div className="animate-fade-in" style={{ padding: '20px', background: 'rgba(0,242,254,0.05)', borderLeft: '3px solid #00f2fe', borderRadius: '4px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#00f2fe', fontWeight: 'bold' }}>
                <BookOpen size={16} /> Riassunto Precedenti
                <button onClick={() => setPreviousSummary(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16}/></button>
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={formatText(previousSummary)} />
            </div>
          )}
          {gameData.description ? (
            <div style={{ fontSize: '1.05rem', lineHeight: '2', color: 'var(--text-secondary)' }}>
              {gameData.description.split('\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={formatText(para)} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '20px' }}>Trama non disponibile per questo titolo.</p>
              <button onClick={handleRegenerate} className="btn-primary" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Rigenera con IA
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'characters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {gameData.protagonists?.length > 0 ? (
            <div>
              <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={22} color="var(--accent-primary)" /> Personaggi Principali</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {gameData.protagonists.map((c, i) => (
                  <div key={i} className="glass-panel" onClick={() => handleCharacterClick(c)} 
                    style={{ padding: '0', cursor: 'pointer', transition: 'all 0.2s ease', overflow: 'hidden' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{c.name}</h3>
                        {c.role && <span style={{ background: 'rgba(109,40,217,0.15)', color: 'var(--accent-primary)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{c.role}</span>}
                      </div>
                      {c.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }} dangerouslySetInnerHTML={formatText(c.description)} />}
                      
                      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Approfondisci <ChevronRight size={14} />
                        </div>
                        
                        {/* Vote System */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                          {votesLoading ? (
                            <Loader2 size={16} className="spin" />
                          ) : (
                            <>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {characterVotes.totalVotes > 0 
                                  ? `${Math.round(((characterVotes.votes[c.name] || 0) / characterVotes.totalVotes) * 100)}%` 
                                  : '0%'}
                              </div>
                              <button 
                                onClick={(e) => handleVoteCharacter(e, c.name)}
                                disabled={userVote === c.name}
                                className={userVote === c.name ? '' : 'btn-primary'}
                                style={userVote === c.name ? {
                                  background: 'rgba(255,255,255,0.05)',
                                  color: 'var(--text-muted)',
                                  border: '1px solid var(--glass-border)',
                                  padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
                                  cursor: 'default', display: 'flex', alignItems: 'center', gap: '6px'
                                } : {
                                  padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                  boxShadow: '0 2px 10px rgba(139,92,246,0.3)'
                                }}
                              >
                                <Trophy size={14} />
                                {userVote === c.name ? 'Hai Votato' : 'Vota'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {!votesLoading && characterVotes.totalVotes > 0 && (
                        <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            background: 'var(--accent-primary)', 
                            width: `${((characterVotes.votes[c.name] || 0) / characterVotes.totalVotes) * 100}%`,
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <button 
                  onClick={handleRegenerate} 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}
                  onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  <Sparkles size={16} /> Personaggi incompleti? Rigenera Dati con IA
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <User size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '20px' }}>Nessun personaggio disponibile per questo titolo.</p>
              <button 
                onClick={handleRegenerate} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
              >
                <Sparkles size={16} /> Estrai Personaggi con IA
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gameplay' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={22} color="var(--accent-primary)" /> Gameplay & Meccaniche</h2>
            <button 
              onClick={() => handleOpenReportAI('Gameplay', gameData.title)} 
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <AlertTriangle size={12} /> Segnala Contenuto IA
            </button>
          </div>
          {gameData.gameplay ? (
            <div style={{ fontSize: '1.05rem', lineHeight: '2', color: 'var(--text-secondary)' }}>
              {gameData.gameplay.split('\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={formatText(para)} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '20px' }}>Analisi gameplay non disponibile per questo titolo.</p>
              <button onClick={handleRegenerate} className="btn-primary" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Rigenera con IA
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'news' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {newsData.length > 0 ? (
            newsData.map((news, i) => (
              <NewsCard key={i} news={news} onClick={(e) => handleNewsClick(news, e)} />
            ))
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nessuna notizia trovata per questo titolo.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Trivia — Easter Egg & Curiosità */}
      {activeTab === 'trivia' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="var(--accent-primary)" /> Trivia & Easter Egg
            </h2>
            <button 
              onClick={() => handleOpenReportAI('Trivia', gameData.title)} 
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <AlertTriangle size={12} /> Segnala Contenuto IA
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Curiosità, retroscena e segreti nascosti generati dall'AI.
          </p>
          {triviaLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '16px' }}>
              <div className="dynamic-loader">
                <img src={logoUrl} alt="OmniDex" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sto scavando negli archivi segreti...</p>
            </div>
          ) : trivia ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {trivia.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.03)', padding: '16px 18px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)',
                  lineHeight: '1.7'
                }}>
                  <span style={{
                    flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: '800', color: 'white', marginTop: '1px'
                  }}>{i + 1}</span>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}
                    dangerouslySetInnerHTML={formatText(item.fact || item)} />
                </div>
              ))}
            </div>
          ) : (
            <button
              className="btn-primary"
              style={{ margin: '20px auto', display: 'flex' }}
              onClick={handleTriviaTab}
            >
              <Sparkles size={16} /> Genera Trivia con AI
            </button>
          )}
        </div>
      )}
      </>
      )}


      <Modal 
        isOpen={!!selectedCharacter} 
        onClose={() => setSelectedCharacter(null)}
        title={selectedCharacter?.name}
      >
        {modalLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', textAlign: 'center' }}>
            <div className="dynamic-loader">
              <img 
                src={logoUrl} 
                alt="OmniDex Logo" 
                style={{ width: '48px', height: '48px', objectFit: 'contain' }} 
              />
            </div>
            <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '300px' }}>
              "{loadingMessage}"
            </p>
          </div>
        ) : characterDeepDive ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} /> Biografia & Dettagli
                </h4>
                <button 
                  onClick={() => handleOpenReportAI(`Personaggio: ${selectedCharacter.name}`, gameData.title)} 
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <AlertTriangle size={10} /> Segnala IA
                </button>
              </div>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
                {characterDeepDive.description?.split('\n').map((p, i) => p.trim() && (
                  <p key={i} style={{ marginBottom: '15px' }} dangerouslySetInnerHTML={formatText(p)} />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modale News */}
      <Modal 
        isOpen={!!selectedNews} 
        onClose={() => setSelectedNews(null)}
        title="Riassunto Notizia"
      >
        {selectedNews && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{selectedNews.title}</h3>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{selectedNews.source}</span>
              <span>•</span>
              <span>{selectedNews.date}</span>
            </div>
          </div>
        )}

        {modalLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 40px', textAlign: 'center' }}>
            <div className="dynamic-loader">
              <img 
                src={logoUrl} 
                alt="OmniDex Logo" 
                style={{ width: '48px', height: '48px', objectFit: 'contain' }} 
              />
            </div>
            <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '400px' }}>
              "{loadingMessage}"
            </p>
          </div>
        ) : newsSummary ? (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', margin: 0 }}>Riassunto generato dall'IA</h4>
              <button 
                onClick={() => handleOpenReportAI(`Riassunto Notizia: ${selectedNews.title}`, gameData.title)} 
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <AlertTriangle size={10} /> Segnala IA
              </button>
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-primary)', marginBottom: '30px' }} dangerouslySetInnerHTML={formatText(newsSummary.summary)} />
            
            <a 
              href={selectedNews?.url} 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--accent-primary)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--accent-primary)'}
            >
              Leggi articolo completo originale <ExternalLink size={18} />
            </a>
          </div>
        ) : null}
      </Modal>

      {/* Fullscreen Screenshot Viewer */}
      {selectedScreenshotIndex !== null && gameData.screenshots && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 20000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backdropFilter: 'blur(12px)',
            overflow: zoomScale > 1 ? 'auto' : 'hidden'
          }}
          onClick={() => setSelectedScreenshotIndex(null)}
          onTouchStart={(e) => setTouchStartX(e.changedTouches[0].clientX)}
          onTouchEnd={(e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (zoomScale === 1) {
              if (diff > 50) {
                setZoomScale(1);
                setSelectedScreenshotIndex(prev => (prev === gameData.screenshots.length - 1 ? 0 : prev + 1));
              } else if (diff < -50) {
                setZoomScale(1);
                setSelectedScreenshotIndex(prev => (prev === 0 ? gameData.screenshots.length - 1 : prev - 1));
              }
            }
          }}
        >
          {/* Centered Image Wrapper */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              position: 'relative', 
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `scale(${zoomScale})`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in',
              maxWidth: '90%',
              maxHeight: '90%'
            }}
          >
            <img 
              src={gameData.screenshots[selectedScreenshotIndex]} 
              alt={`Fullscreen ${selectedScreenshotIndex}`} 
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale(prev => (prev === 1 ? 2.2 : 1));
              }}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh', 
                borderRadius: 'var(--radius-md)', 
                boxShadow: '0 0 50px rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.08)',
                userSelect: 'none',
                pointerEvents: 'auto'
              }} 
            />
            {zoomScale === 1 && (
              <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', pointerEvents: 'none' }}>
                Swipe laterale per scorrere • Tocca l'immagine per lo Zoom
              </div>
            )}
          </div>

          {/* Navigation Controls (Visible only when zoomScale is 1) */}
          {zoomScale === 1 && (
            <>
              {/* Left Arrow Button */}
              <button 
                style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', width: '56px', height: '56px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20005, transition: 'background 0.2s' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                  setSelectedScreenshotIndex(prev => (prev === 0 ? gameData.screenshots.length - 1 : prev - 1));
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <ChevronLeft size={28} />
              </button>

              {/* Right Arrow Button */}
              <button 
                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', width: '56px', height: '56px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20005, transition: 'background 0.2s' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                  setSelectedScreenshotIndex(prev => (prev === gameData.screenshots.length - 1 ? 0 : prev + 1));
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <ChevronRight size={28} />
              </button>

              {/* Top Controls: Zoom Toggle & Close */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 20005 }}>
                {/* Manual Zoom Button */}
                <button 
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomScale(prev => (prev === 1 ? 2.2 : 1));
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  <ZoomIn size={22} />
                </button>

                {/* Close Button */}
                <button 
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedScreenshotIndex(null); }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Index Indicator */}
              <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', color: 'var(--text-primary)', zIndex: 20005, fontWeight: '600' }}>
                {selectedScreenshotIndex + 1} / {gameData.screenshots.length}
              </div>
            </>
          )}

          {/* Zoom Controls when zoomed in */}
          {zoomScale > 1 && (
            <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 20005 }}>
              <button 
                style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent-primary)', color: 'white', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                }}
              >
                <ZoomOut size={22} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modale Segnalazione Contenuto IA */}
      <Modal 
        isOpen={!!reportAIData} 
        onClose={handleCloseReportAI}
        title="Segnala Contenuto IA"
      >
        {reportAIData && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-primary)' }}>
            {!reportSubmitted ? (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                  Ci impegniamo a offrire informazioni accurate e sicure. Se ritieni che il testo generato automaticamente per la sezione <strong>{reportAIData.section}</strong> di <strong>{reportAIData.gameTitle}</strong> sia errato, offensivo o non conforme, compila questa segnalazione.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Motivo della Segnalazione</label>
                  <select 
                    value={reportReason} 
                    onChange={e => setReportReason(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      padding: '12px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  >
                    <option value="inaccurate" style={{ background: 'var(--bg-secondary)' }}>Contenuto non accurato o inventato (Allucinazione)</option>
                    <option value="offensive" style={{ background: 'var(--bg-secondary)' }}>Contenuto offensivo, inappropriato o dannoso</option>
                    <option value="other" style={{ background: 'var(--bg-secondary)' }}>Altro (specifica nei dettagli)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dettagli Aggiuntivi</label>
                  <textarea 
                    value={reportComment}
                    onChange={e => setReportComment(e.target.value)}
                    placeholder="Descrivi brevemente cosa c'è di sbagliato nel testo generato..."
                    rows={4}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      padding: '12px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button 
                    onClick={handleCloseReportAI}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-full)',
                      padding: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    Annulla
                  </button>
                  <button 
                    onClick={handleSubmitReportAI}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    Invia Segnalazione
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)',
                  border: '2px solid var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'var(--success)'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Client Email Aperto!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.5' }}>
                  Abbiamo avviato l'applicazione email con la segnalazione precompilata. Invia l'email per recapitarla direttamente a <strong>thaocelot@gmail.com</strong>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={handleCloseReportAI}
                    className="btn-primary"
                    style={{
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    Chiudi finestra
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
