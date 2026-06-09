import { useState } from 'react';
import { X, Sparkles, AlertTriangle, Wand } from 'lucide-react';
import GeminiCloudService from '../services/GeminiCloudService';

export default function SosGamerModal({ onClose }) {
  const [gameName, setGameName] = useState('');
  const [situation, setSituation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!gameName.trim() || !situation.trim()) {
      setError("Compila sia il nome del gioco che il problema.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await GeminiCloudService.solveGameplayText(gameName, situation);
      if (analysis) {
        setResult(analysis);
      } else {
        setError("Si è verificato un errore durante la ricerca della soluzione. Riprova.");
      }
    } catch (e) {
      setError("Connessione ai server Gemini fallita.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      zIndex: 10000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-glass)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--accent-ultra)', padding: '30px',
        width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', boxShadow: '0 0 40px rgba(0, 242, 254, 0.15)'
      }}>
        
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent' }}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Wand size={28} color="var(--accent-ultra)" />
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>Omni<span style={{color: 'var(--accent-ultra)'}}>Lens</span> <span style={{fontSize: '0.8rem', verticalAlign: 'super', color: '#ff6b6b'}}>SOS</span></h2>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.5' }}>
          Sei bloccato in un gioco? Scrivi il nome del gioco e descrivi a parole cosa vedi o quale enigma non riesci a superare. La Guida Strategica Suprema ti aiuterà!
        </p>

        {!result && !isAnalyzing && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-ultra)', fontWeight: 'bold' }}>Nome del Gioco</label>
              <input 
                type="text" 
                placeholder="es. Uncharted 4" 
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                style={{ 
                  width: '100%', padding: '15px', borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', 
                  color: 'white', fontSize: '1rem', outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-ultra)', fontWeight: 'bold' }}>Il tuo problema</label>
              <textarea 
                placeholder="es. Mi trovo nella stanza dei pirati a Libertalia e non capisco in che ordine girare i quadri." 
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={4}
                style={{ 
                  width: '100%', padding: '15px', borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', 
                  color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical'
                }}
              />
            </div>

            <button 
              onClick={handleAnalyze} 
              disabled={!gameName.trim() || !situation.trim()}
              style={{ 
                width: '100%', padding: '16px', borderRadius: 'var(--radius-full)', 
                border: 'none', background: 'var(--accent-ultra-gradient)', 
                color: '#002538', fontSize: '1.1rem', fontWeight: 'bold', 
                cursor: gameName.trim() && situation.trim() ? 'pointer' : 'not-allowed', 
                opacity: gameName.trim() && situation.trim() ? 1 : 0.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              <Sparkles size={20} />
              Chiedi la Soluzione
            </button>
          </>
        )}

        {isAnalyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-ultra)', width: '50px', height: '50px', marginBottom: '20px' }}></div>
            <p style={{ color: 'var(--accent-ultra)', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
              Elaborazione soluzione in corso...
            </p>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', borderRadius: 'var(--radius-md)', color: '#ff6b6b', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {result && !isAnalyzing && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-ultra)' }}>
              <div dangerouslySetInnerHTML={{ __html: result }} style={{ lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }} />
            </div>

            <button 
              onClick={() => { setResult(null); setSituation(''); }}
              style={{ 
                width: '100%', padding: '15px', borderRadius: 'var(--radius-full)', 
                border: '1px solid var(--accent-ultra)', background: 'transparent', 
                color: 'var(--accent-ultra)', fontSize: '1rem', fontWeight: 'bold', 
                cursor: 'pointer', marginTop: '20px'
              }}
            >
              Chiedi un altro aiuto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
