import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Loader2, Heart, ExternalLink, Calendar, Gamepad, Users,
  AlertTriangle, Trophy, Star, Globe, ArrowLeft, BookOpen,
  Cpu, Info, Zap, ChevronRight, Film, Package, Layers, Award, User, Video, ThumbsUp, Gamepad2, X, ChevronLeft, ZoomIn, ZoomOut
} from 'lucide-react';
import GameService from '../services/GameService';
import { db } from '../services/db';
import NewsCard from '../components/NewsCard';
import LoadingScreen from '../components/LoadingScreen';
import Modal from '../components/Modal';
import { LOADING_MESSAGES } from '../data/loadingMessages';
import NotificationService from '../services/NotificationService';

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

  useEffect(() => {
    if (modalLoading) {
      const msg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      setLoadingMessage(msg);
    }
  }, [modalLoading]);

  const decodedName = decodeURIComponent(gameName);

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

  useEffect(() => {
    fetchData();
  }, [gameName]);

  const handleToggleFavorite = async () => {
    if (!gameData) return;
    if (isFavorite) {
      await db.removeFavorite(gameData.id);
      setIsFavorite(false);
    } else {
      await db.addFavorite({
        id: gameData.id,
        title: gameData.title,
        cover: gameData.cover,
        rating: gameData.rating
      });
      setIsFavorite(true);
      // Inizializza l'ultima notizia per questo gioco preferito
      NotificationService.initFavoriteLatestNews(gameData.id, gameData.title);
    }
  };



  if (loading) {
    return <LoadingScreen title={`Sto costruendo l'enciclopedia di ${decodedName}...`} subtitle="Potrebbe volerci qualche secondo, stiamo raccogliendo tonnellate di dati." />;
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

  const handleCharacterClick = async (character) => {
    setSelectedCharacter(character);
    setCharacterDeepDive(null);
    setModalLoading(true);
    try {
      const data = await GameService.getCharacterDeepDive(gameData.title, character.name);
      setCharacterDeepDive(data);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
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

  const tabs = [
    { id: 'info', label: 'Informazioni', icon: <Info size={18} /> },
    { id: 'story', label: 'Trama', icon: <BookOpen size={18} /> },
    { id: 'characters', label: 'Personaggi', icon: <Users size={18} /> },
    { id: 'gameplay', label: 'Gameplay', icon: <Zap size={18} /> },
    { id: 'news', label: 'Notizie', icon: <Calendar size={18} /> }
  ];

  const formatText = (text) => {
    if (!text) return { __html: '' };
    const html = text
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

      {/* Hero Header */}
      <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 40px)', position: 'relative', overflow: 'hidden', marginBottom: '30px', width: '100%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(236,72,153,0.1) 100%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', marginBottom: '8px', lineHeight: 1.1, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{gameData.title}</h1>
              {gameData.originalTitle && gameData.originalTitle !== gameData.title && (
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '12px', fontStyle: 'italic', wordBreak: 'break-word' }}>{gameData.originalTitle}</p>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {gameData.genres?.map(g => (
                  <span key={g} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.4)', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{g}</span>
                ))}
              </div>
              
              {/* Descrizione / Panoramica */}
              <div style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '16px' }}>
                <span dangerouslySetInnerHTML={formatText(
                  typeof gameData.description === 'string' 
                    ? (isDescriptionExpanded 
                        ? gameData.description 
                        : (gameData.description.length > 500 ? gameData.description.substring(0, 500) + '...' : gameData.description))
                    : ''
                )} />
                {gameData.description?.length > 500 && (
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
                <div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.releaseDate}</div>
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
          {/* Stats Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Zap size={16} /> Statistiche</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Playtime</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{gameData.playtime}h</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Obiettivi</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{gameData.achievementsCount}</div>
              </div>
            </div>
          </div>

          {/* Valutazioni / Ratings */}
          {gameData.ratings?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Star size={16} /> Valutazioni Giocatori</h3>
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
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}><Gamepad size={16} /> Piattaforme</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {gameData.platforms?.map(p => (
                <span key={p.name} style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>

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
          {gameData.screenshots?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Galleria Screenshot</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'thin' }}>
                {gameData.screenshots.map((s, i) => (
                  <img 
                    key={i} 
                    src={s} 
                    alt={`Screenshot ${i}`} 
                    onClick={() => { setSelectedScreenshotIndex(i); setZoomScale(1); }}
                    style={{ height: '200px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--glass-border)', cursor: 'zoom-in', transition: 'transform 0.2s' }} 
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
                {gameData.trivia.map((t, i) => <li key={i} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{t}</li>)}
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

      {activeTab === 'story' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen size={22} color="var(--accent-primary)" /> Trama</h2>
          {gameData.plot ? (
            <div style={{ fontSize: '1.05rem', lineHeight: '2', color: 'var(--text-secondary)' }}>
              {gameData.plot.split('\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={formatText(para)} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Trama non disponibile per questo titolo.</p>
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
                      {c.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{c.description}</p>}
                      <div style={{ marginTop: '14px', fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Approfondisci <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <User size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Nessun personaggio disponibile per questo titolo.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gameplay' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={22} color="var(--accent-primary)" /> Gameplay & Meccaniche</h2>
          {gameData.gameplay ? (
            <div style={{ fontSize: '1.05rem', lineHeight: '2', color: 'var(--text-secondary)' }}>
              {gameData.gameplay.split('\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={formatText(para)} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Analisi gameplay non disponibile per questo titolo.</p>
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
              <p style={{ color: 'var(--text-muted)' }}>Nessuna notizia monumentale trovata per questo titolo.</p>
            </div>
          )}
        </div>
      )}

      {/* Modale Personaggio */}
      <Modal 
        isOpen={!!selectedCharacter} 
        onClose={() => setSelectedCharacter(null)}
        title={selectedCharacter?.name}
      >
        {modalLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', textAlign: 'center' }}>
            <div className="dynamic-loader">
              <Gamepad2 size={48} color="var(--accent-primary)" />
            </div>
            <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '300px' }}>
              "{loadingMessage}"
            </p>
          </div>
        ) : characterDeepDive ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> Biografia & Dettagli
              </h4>
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
              <Gamepad2 size={48} color="var(--accent-primary)" />
            </div>
            <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '400px' }}>
              "{loadingMessage}"
            </p>
          </div>
        ) : newsSummary ? (
          <div className="animate-fade-in">
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px' }}>Riassunto generato dall'IA</h4>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-primary)', marginBottom: '30px' }}>
              {newsSummary.summary}
            </p>
            
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

    </div>
  );
}
