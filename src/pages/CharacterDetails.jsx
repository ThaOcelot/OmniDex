import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Gamepad2, Info, Users, Mic, Star } from 'lucide-react';
import GeminiCloudService from '../services/GeminiCloudService';
import IAPService from '../services/IAPService';
import AdService from '../services/AdService';
import FirebaseService from '../services/FirebaseService';

export default function CharacterDetails() {
  const { characterName } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tier, setTier] = useState(IAPService.getTier());

  useEffect(() => {
    const unsub = IAPService.subscribe(setTier);
    return unsub;
  }, []);

  const fetchProfile = async (forceRegenerate = false) => {
    // Controllo Tier
    if (!IAPService.isUltra()) {
      setError("locked");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Controlla la cache globale su Firebase
      if (!forceRegenerate) {
        const cachedProfile = await FirebaseService.getGlobalCharacter(characterName);
        if (cachedProfile) {
          setProfile(cachedProfile);
          setLoading(false);
          return;
        }
      }

      // 2. Se non c'è in cache o si forza, usa Gemini per generare
      const data = await GeminiCloudService.getCharacterProfile(characterName);
      if (!data) throw new Error("Impossibile generare il profilo al momento.");
      
      setProfile(data);
      
      // 3. Salva in cache globale per futuri utenti
      await FirebaseService.saveGlobalCharacter(characterName, data);
    } catch (err) {
      console.error(err);
      setError("Errore durante la generazione del profilo. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [characterName, tier]);

  const handleRegenerate = () => {
    fetchProfile(true);
  };

  const formatText = (text) => {
    if (!text) return { __html: '' };
    const stripped = String(text)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '');
    const html = stripped
      .replace(/###?\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/__(.*?)__/g, '<b>$1</b>')
      .replace(/_(.*?)_/g, '<i>$1</i>');
    return { __html: html };
  };

  if (loading) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '80px', paddingBottom: '40px', minHeight: '100vh' }}>
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', width: '40px', height: '40px' }}>
          <ChevronLeft size={24} />
        </button>
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '20px' }} />
          <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '10px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '150px', height: '20px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="skeleton" style={{ width: '30%', height: '24px', marginBottom: '16px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '95%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }} />
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="skeleton" style={{ width: '40%', height: '24px', marginBottom: '16px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '10px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '10px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error === "locked") {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '40px', minHeight: '100vh' }}>
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', width: '40px', height: '40px' }}>
          <ChevronLeft size={24} />
        </button>
        <div className="glass-panel animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center', marginTop: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))' }}>🔒</div>
          <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1.8rem' }}>Ricerca Personaggi Bloccata</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 24px' }}>
            La generazione enciclopedica dei personaggi è un'esclusiva per gli utenti <strong style={{ color: 'var(--accent-ultra)' }}>Ultra</strong>.
          </p>
          <button 
            className="btn-primary" 
            style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: 'bold' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
          >
            Scopri OmniDex Premium
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '40px', minHeight: '100vh', textAlign: 'center' }}>
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', width: '40px', height: '40px' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ marginTop: '100px', color: 'var(--text-secondary)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '80px', paddingBottom: '40px', minHeight: '100vh' }}>
      <button onClick={() => navigate(-1)} className="btn-icon" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', width: '40px', height: '40px' }}>
        <ChevronLeft size={24} />
      </button>

      {/* Header Profilo */}
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-gradient)' }}></div>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(139,92,246,0.3)' }}>
          <User size={40} color="var(--accent-primary)" />
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px', background: 'var(--text-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {profile.name}
        </h1>
        {profile.subtitle && (
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>
            {profile.subtitle}
          </h2>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Biografia */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
            <Info size={20} /> Biografia e Storia
          </h3>
          <div 
            style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={formatText(profile.biography)}
          />
        </div>

        {/* Giochi */}
        {profile.games?.length > 0 && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#10B981', fontSize: '1.1rem' }}>
              <Gamepad2 size={20} /> Giochi in cui compare
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {profile.games.map((g, i) => (
                <li 
                  key={i} 
                  onClick={() => navigate(`/game/${encodeURIComponent(g)}`)}
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', 
                    border: '1px solid var(--glass-border)', fontSize: '0.95rem', cursor: 'pointer',
                    transition: 'background 0.2s, borderColor 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  🎮 <span style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }} dangerouslySetInnerHTML={formatText(g)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Relazioni e Doppiatori (Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {profile.relationships?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f59e0b', fontSize: '1.1rem' }}>
                <Users size={20} /> Relazioni
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.relationships.map((r, i) => (
                  <div 
                    key={i} 
                    onClick={() => navigate(`/character/${encodeURIComponent(r.name)}`)}
                    style={{ 
                      borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: '4px' }} dangerouslySetInnerHTML={formatText(r.name)} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }} dangerouslySetInnerHTML={formatText(r.relation)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.voiceActors?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#ec4899', fontSize: '1.1rem' }}>
                <Mic size={20} /> Doppiatori
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profile.voiceActors.map((v, i) => (
                  <li key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }} dangerouslySetInnerHTML={formatText(`🎙️ ${v}`)} />
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Trivia */}
        {profile.trivia?.length > 0 && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--accent-ultra)', fontSize: '1.1rem' }}>
              <Star size={20} /> Curiosità
            </h3>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {profile.trivia.map((t, i) => (
                <li key={i} dangerouslySetInnerHTML={formatText(t)} />
              ))}
            </ul>
          </div>
        )}

      </div>

      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)', marginTop: '24px' }}>
        {(!profile.biography || !profile.games?.length || !profile.relationships?.length) && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '20px' }}>Alcune informazioni di questo profilo sembrano mancanti o incomplete.</p>
        )}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
          Pensi che questa scheda sia incompleta o inaccurata?
        </p>
        <button onClick={handleRegenerate} className="btn-primary" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Rigenera con IA
        </button>
      </div>

    </div>
  );
}
