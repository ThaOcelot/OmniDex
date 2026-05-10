import { useState, useEffect } from 'react';
import { DownloadCloud, CheckCircle2, AlertTriangle, HardDrive, Cpu, Zap } from 'lucide-react';

export default function ModelDownloader({ onDownloadComplete }) {
  const [downloadState, setDownloadState] = useState('idle'); // idle, downloading, installing, complete, error
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);

  const startDownload = () => {
    setDownloadState('downloading');
    setProgress(0);
    
    // Simula il download di un file da 2.5GB
    const totalSize = 2500; // 2500 MB
    let downloaded = 0;
    
    const interval = setInterval(() => {
      // Simula velocità di download variabile tra 15 e 45 MB/s
      const currentSpeed = Math.floor(Math.random() * 30) + 15;
      setSpeed(currentSpeed);
      
      downloaded += currentSpeed / 2; // aggiorna ogni 500ms
      
      if (downloaded >= totalSize) {
        clearInterval(interval);
        setDownloadState('installing');
        
        // Simula decompressione e installazione del modello
        setTimeout(() => {
          setDownloadState('complete');
          setTimeout(() => {
            if (onDownloadComplete) onDownloadComplete();
          }, 2000);
        }, 4000);
      } else {
        setProgress(Math.min(99, Math.floor((downloaded / totalSize) * 100)));
      }
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', 
          background: 'var(--bg-glass)', border: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
          boxShadow: downloadState === 'downloading' ? '0 0 30px rgba(109, 40, 217, 0.4)' : 'none',
          transition: 'all 0.5s ease'
        }}>
          {downloadState === 'complete' ? (
            <CheckCircle2 size={48} color="var(--success)" />
          ) : downloadState === 'error' ? (
            <AlertTriangle size={48} color="var(--danger)" />
          ) : (
            <Cpu size={48} color="var(--accent-primary)" />
          )}
        </div>
      </div>

      <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>
        {downloadState === 'idle' && 'Intelligenza Artificiale Locale Richiesta'}
        {downloadState === 'downloading' && 'Download Modello Gemma 4'}
        {downloadState === 'installing' && 'Installazione nell\'NPU...'}
        {downloadState === 'complete' && 'Modello Installato!'}
      </h2>

      {downloadState === 'idle' && (
        <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>
            Questa enciclopedia utilizza <strong style={{ color: 'white' }}>Gemma 4 (MediaPipe)</strong> per funzionare completamente offline, 
            garantire la tua privacy e azzerare i costi API. Il tuo dispositivo attualmente non ha il modello installato.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <HardDrive size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <span style={{ fontWeight: 'bold' }}>2.5 GB</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Spazio Richiesto</span>
            </div>
            <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Zap size={24} color="var(--warning)" style={{ marginBottom: '8px' }} />
              <span style={{ fontWeight: 'bold' }}>Offline</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nessuna connessione</span>
            </div>
          </div>

          <button 
            onClick={startDownload}
            style={{
              background: 'var(--accent-gradient)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(109, 40, 217, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <DownloadCloud size={24} /> Scarica Modello Local-First
          </button>
        </div>
      )}

      {(downloadState === 'downloading' || downloadState === 'installing') && (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-secondary)' }}>
            <span>{downloadState === 'installing' ? 'Compilazione Shaders...' : `${progress}% completato`}</span>
            {downloadState === 'downloading' && <span>~ {speed} MB/s</span>}
          </div>
          
          <div style={{ height: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'var(--accent-gradient)', 
                width: `${downloadState === 'installing' ? 100 : progress}%`,
                transition: 'width 0.5s ease',
                position: 'relative'
              }}
            >
              {downloadState === 'installing' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 1.5s infinite' }} />
              )}
            </div>
          </div>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Non chiudere l'applicazione durante l'operazione.
          </p>
        </div>
      )}

      {downloadState === 'complete' && (
        <div className="animate-fade-in">
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Il motore IA locale è ora pronto all'uso!
          </p>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
