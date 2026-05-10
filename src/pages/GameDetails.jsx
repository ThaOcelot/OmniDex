import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Loader2, Heart, ExternalLink, Calendar, Gamepad, Users,
  AlertTriangle, Trophy, Star, Globe, ArrowLeft, BookOpen,
  Cpu, Info, Zap, ChevronRight
} from 'lucide-react';
import { searchGameInfo, searchGameNews, getCharacterDeepDive, summarizeNews, setModelInstalledNative } from '../services/gemini';
import LoadingScreen from '../components/LoadingScreen';
import Modal from '../components/Modal';
import ModelDownloader from '../components/ModelDownloader';

export default function GameDetails() {
  const { gameName } = useParams();
  const navigate = useNavigate();
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

  const decodedName = decodeURIComponent(gameName);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [info, news] = await Promise.all([
          searchGameInfo(decodedName),
          searchGameNews(decodedName)
        ]);
        setGameData(info);
        setNewsData(news);
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
    fetchData();
  }, [gameName]);

  const handleDownloadComplete = async () => {
    await setModelInstalledNative();
    window.location.reload();
  };

  if (loading) {
    return <LoadingScreen title={`Sto costruendo l'enciclopedia di ${decodedName}...`} subtitle="Potrebbe volerci qualche secondo, stiamo raccogliendo tonnellate di dati." />;
  }

  if (error) {
    if (error.isModelMissing) {
      return <ModelDownloader onDownloadComplete={handleDownloadComplete} />;
    }
    const isQuota = error.isQuota;
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertTriangle size={64} style={{ margin: '0 auto 20px', color: isQuota ? 'var(--warning)' : 'var(--danger)' }} />
        <h2 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>
          {isQuota ? '⚠️ Limite API raggiunto' : 'Ops! Qualcosa è andato storto.'}
        </h2>
        {isQuota ? (
          <div style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.8' }}>
            <p>La chiave API di Gemini ha esaurito il piano gratuito.</p>
            <ol style={{ textAlign: 'left', marginTop: '10px', paddingLeft: '20px' }}>
              <li>Vai su <a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Google Cloud Console → Fatturazione</a></li>
              <li>Aggiungi un metodo di pagamento al progetto</li>
              <li>Ricarica la pagina e riprova</li>
            </ol>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>{error.message}</p>
        )}
      </div>
    );
  }

  const handleCharacterClick = async (character) => {
    setSelectedCharacter(character);
    setCharacterDeepDive(null);
    setModalLoading(true);
    try {
      const charName = typeof character === 'string' ? character : character.name;
      const data = await getCharacterDeepDive(decodedName, charName);
      setCharacterDeepDive(data);
    } catch (err) {
      console.error(err);
      if (err.code === 'MODEL_MISSING') {
        setSelectedCharacter(null);
        setError({ isModelMissing: true });
      } else {
        setCharacterDeepDive({ description: "Errore durante il caricamento dell'approfondimento." });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleNewsClick = async (e, news) => {
    e.preventDefault();
    setSelectedNews(news);
    setNewsSummary(null);
    setModalLoading(true);
    try {
      const data = await summarizeNews(news.title, news.url);
      setNewsSummary(data);
    } catch (err) {
      console.error(err);
      if (err.code === 'MODEL_MISSING') {
        setSelectedNews(null);
        setError({ isModelMissing: true });
      } else {
        setNewsSummary({ summary: "Errore durante il caricamento del riassunto della notizia." });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Informazioni', icon: <Info size={16} /> },
    { id: 'story', label: 'Trama', icon: <BookOpen size={16} /> },
    { id: 'characters', label: 'Personaggi', icon: <Users size={16} /> },
    { id: 'gameplay', label: 'Gameplay', icon: <Zap size={16} /> },
    { id: 'news', label: `News ${newsData.length > 0 ? `(${newsData.length})` : ''}`, icon: <Globe size={16} /> },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>

      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontSize: '0.95rem', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} /> Torna ai risultati
      </button>

      {/* Hero Header */}
      <div className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden', marginBottom: '30px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(236,72,153,0.1) 100%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '8px', lineHeight: 1.1 }}>{gameData.title}</h1>
              {gameData.originalTitle && gameData.originalTitle !== gameData.title && (
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '12px', fontStyle: 'italic' }}>{gameData.originalTitle}</p>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {gameData.genres?.map(g => (
                  <span key={g} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.4)', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{g}</span>
                ))}
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', maxWidth: '700px' }}>{gameData.description}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <button className="btn-icon" onClick={() => setIsFavorite(!isFavorite)}
                style={{ color: isFavorite ? 'var(--accent-secondary)' : 'var(--text-primary)', border: `1px solid ${isFavorite ? 'var(--accent-secondary)' : 'var(--glass-border)'}` }}>
                <Heart fill={isFavorite ? 'var(--accent-secondary)' : 'none'} />
              </button>
              {gameData.metacriticScore && (
                <div style={{ textAlign: 'center', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>{gameData.metacriticScore}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Metacritic</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
            {gameData.developer && <div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sviluppatore</div><div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.developer}</div></div>}
            {gameData.publisher && <div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publisher</div><div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.publisher}</div></div>}
            {gameData.releaseDate && <div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uscita</div><div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.releaseDate}</div></div>}
            {gameData.salesFigures && <div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendite</div><div style={{ fontWeight: '600', marginTop: '4px' }}>{gameData.salesFigures}</div></div>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
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
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Gamepad size={16} /> Piattaforme</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {gameData.platforms?.map(p => <span key={p} style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>{p}</span>)}
            </div>
          </div>
          {gameData.gameEngine && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Cpu size={16} /> Motore Grafico</h3>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{gameData.gameEngine}</p>
            </div>
          )}
          {gameData.modes?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Users size={16} /> Modalità</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {gameData.modes.map(m => <span key={m} style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>{m}</span>)}
              </div>
            </div>
          )}
          {gameData.awards?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Trophy size={16} /> Premi</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {gameData.awards.map((a, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}><Star size={14} color="var(--warning)" />{a}</li>)}
              </ul>
            </div>
          )}
          {gameData.setting && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ambientazione</h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>{gameData.setting}</p>
            </div>
          )}
          {(gameData.prequels?.length > 0 || gameData.sequels?.length > 0) && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saga / Correlati</h3>
              {gameData.prequels?.length > 0 && <div style={{ marginBottom: '10px' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>PREQUEL</p>{gameData.prequels.map((p, i) => <p key={i} onClick={() => navigate(`/game/${encodeURIComponent(p)}`)} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.95rem' }}>{p}</p>)}</div>}
              {gameData.sequels?.length > 0 && <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>SEQUEL</p>{gameData.sequels.map((s, i) => <p key={i} onClick={() => navigate(`/game/${encodeURIComponent(s)}`)} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.95rem' }}>{s}</p>)}</div>}
            </div>
          )}
          {gameData.trivia?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 Lo sapevi?</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {gameData.trivia.map((t, i) => <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-primary)', fontWeight: '800', flexShrink: 0 }}>#{i + 1}</span>{t}</li>)}
              </ul>
            </div>
          )}
          {gameData.similarGames?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giochi Simili</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {gameData.similarGames.map((g, i) => (
                  <button key={i} onClick={() => navigate(`/search/${encodeURIComponent(g)}`)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  >
                    {g} <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'story' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen size={22} color="var(--accent-primary)" /> Trama</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '2', color: 'var(--text-secondary)' }}>{gameData.plot || 'Trama non disponibile.'}</p>
        </div>
      )}

      {activeTab === 'characters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {gameData.protagonists?.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--success)' }}>●</span> Protagonisti</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {gameData.protagonists.map((c, i) => (
                  <div key={i} className="glass-panel" onClick={() => handleCharacterClick(c)} 
                    style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{c.name || c}</h3>
                    {c.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{c.description}</p>}
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Approfondisci <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {gameData.antagonists?.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--danger)' }}>●</span> Antagonisti</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {gameData.antagonists.map((c, i) => (
                  <div key={i} className="glass-panel" onClick={() => handleCharacterClick(c)} 
                    style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{c.name || c}</h3>
                    {c.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{c.description}</p>}
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--danger)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Approfondisci <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {gameData.supportingCharacters?.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--text-muted)' }}>●</span> Personaggi Secondari</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {gameData.supportingCharacters.map((c, i) => (
                  <div key={i} className="glass-panel" onClick={() => handleCharacterClick(c)} 
                    style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{c.name || c}</h3>
                    {c.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{c.description}</p>}
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Approfondisci <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gameplay' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={22} color="var(--accent-primary)" /> Gameplay & Meccaniche</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '2', color: 'var(--text-secondary)' }}>{gameData.gameplay || 'Informazioni sul gameplay non disponibili.'}</p>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={22} color="var(--accent-primary)" /> Ultime Notizie
            <span style={{ fontSize: '0.85rem', background: 'var(--accent-primary)', padding: '3px 10px', borderRadius: '6px', fontWeight: 'normal' }}>Ultimo Mese</span>
          </h2>
          {newsData.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Globe size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p style={{ fontSize: '1.1rem' }}>Nessuna notizia recente trovata per questo gioco.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '8px', color: 'var(--text-muted)' }}>Le notizie vengono cercate su IGN, Multiplayer.it, Spaziogames, Round Two e Reddit.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {newsData.map((n, i) => (
                <a href={n.url} key={i} onClick={(e) => handleNewsClick(e, n)} className="glass-panel"
                  style={{ padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.4)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{n.title}</h4>
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.88rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{n.source}</span>
                      <span>•</span>
                      <span>{n.date}</span>
                    </div>
                  </div>
                  <ExternalLink size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '16px' }} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Modale Personaggio */}
      <Modal 
        isOpen={!!selectedCharacter} 
        onClose={() => setSelectedCharacter(null)}
        title={selectedCharacter?.name || selectedCharacter}
      >
        {modalLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <Loader2 size={48} className="animate-spin text-gradient" style={{ animation: 'spin 1.5s linear infinite' }} />
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Ricerca negli archivi del lore in corso...</p>
          </div>
        ) : characterDeepDive ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(109,40,217,0.2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{characterDeepDive.role}</span>
              {characterDeepDive.voiceActor && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🎤 {characterDeepDive.voiceActor}</span>}
            </div>
            
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Descrizione</h4>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{characterDeepDive.description}</p>
            </div>
            
            {characterDeepDive.background && (
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Storia e Origini</h4>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{characterDeepDive.background}</p>
              </div>
            )}
            
            {characterDeepDive.personality && (
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Personalità</h4>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{characterDeepDive.personality}</p>
              </div>
            )}
            
            {characterDeepDive.trivia?.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={16} /> Curiosità</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {characterDeepDive.trivia.map((t, i) => <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t}</li>)}
                </ul>
              </div>
            )}
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 40px' }}>
            <Loader2 size={48} className="animate-spin text-gradient" style={{ animation: 'spin 1.5s linear infinite' }} />
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Lettura e riassunto dell'articolo in corso...</p>
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

    </div>
  );
}
