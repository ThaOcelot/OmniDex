import { useState, useEffect } from 'react';
import { X, Sun, Moon, CheckCircle, ShieldCheck, Info, Mail, Sparkles, Award } from 'lucide-react';
import IAPService from '../services/IAPService';

export default function SettingsPopup({ onClose }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });
  
  // Stati per IAP (Pro/Ultra)
  const [tier, setTier] = useState(IAPService.getTier());
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [debugClicks, setDebugClicks] = useState(0);
  const [ultraPlan, setUltraPlan] = useState('monthly'); // 'monthly' | 'yearly'

  // Sincronizza il tema con l'attributo data-theme del documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Sottoscrizione allo stato Tier
  useEffect(() => {
    return IAPService.subscribe((t) => {
      setTier(t);
    });
  }, []);

  const handlePurchase = async (type) => {
    const purchaseType = type === 'ultra' ? `ultra_${ultraPlan}` : type;
    setPurchasing(purchaseType);
    try {
      await IAPService.purchaseTier(purchaseType);
    } catch (err) {
      console.error(err);
    } finally {
      setPurchasing(false);
    }
  };

  const handleManageSubscription = async () => {
    await IAPService.manageSubscription();
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      await IAPService.restorePurchases();
    } catch (err) {
      console.error(err);
    } finally {
      setRestoring(false);
    }
  };

  const handleDebugClick = () => {
    const clicks = debugClicks + 1;
    setDebugClicks(clicks);
    if (clicks >= 5) {
      if (tier === 'free') {
        IAPService.setTier('pro');
        alert("⚙️ [Debug] OmniDex sbloccata a PRO!");
      } else if (tier === 'pro') {
        IAPService.setTier('ultra');
        alert("⚙️ [Debug] OmniDex sbloccata a ULTRA!");
      } else {
        IAPService.resetToFree();
        alert("⚙️ [Debug] OmniDex tornata a FREE!");
      }
      setDebugClicks(0);
    }
  };

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 30000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', backdropFilter: 'blur(8px)',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '92%', maxWidth: '380px',
          padding: '20px', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          background: 'var(--bg-secondary)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }} className="text-gradient">
            Impostazioni
          </h3>
          <button 
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            onClick={onClose}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tema Scuro / Chiaro */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
            {theme === 'dark' ? <Moon size={16} color="var(--accent-primary)" /> : <Sun size={16} color="var(--accent-primary)" />}
            <span>Tema dell'Applicazione</span>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', padding: '3px', border: '1px solid var(--glass-border)', boxSizing: 'border-box' }}>
            <button 
              onClick={() => setTheme('dark')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: theme === 'dark' ? 'var(--accent-gradient)' : 'transparent',
                color: theme === 'dark' ? 'white' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Moon size={14} />
              <span>Tema Scuro</span>
            </button>
            <button 
              onClick={() => setTheme('light')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: theme === 'light' ? 'var(--accent-gradient)' : 'transparent',
                color: theme === 'light' ? 'white' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Sun size={14} />
              <span>Tema Chiaro</span>
            </button>
          </div>
        </div>

        {/* OmniDex Tiers Promo Card */}
        <div style={{ 
          background: tier === 'ultra' 
            ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(79, 172, 254, 0.05) 100%)'
            : tier === 'pro'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(109, 40, 217, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)',
          border: tier === 'ultra'
            ? '1px solid rgba(0, 242, 254, 0.4)'
            : tier === 'pro' 
              ? '1px solid rgba(16, 185, 129, 0.25)'
              : '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '24px',
          boxSizing: 'border-box',
          boxShadow: tier === 'ultra' ? '0 0 15px rgba(0, 242, 254, 0.15)' : tier === 'pro' ? 'none' : '0 8px 24px rgba(109, 40, 217, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                onClick={handleDebugClick}
                style={{ 
                  fontSize: '1.4rem', 
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'inline-block',
                  animation: tier === 'free' ? 'pulse 2s infinite' : 'none'
                }}
                title="Debug: Clicca 5 volte per resettare"
              >
                {tier === 'ultra' ? '💎' : '👑'}
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'white' }}>
                  {tier === 'ultra' ? 'OmniDex Ultra' : tier === 'pro' ? 'OmniDex Pro' : 'OmniDex Base'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: tier === 'ultra' ? '#00f2fe' : tier === 'pro' ? '#10B981' : 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {tier === 'ultra' ? 'AI Sbloccata al 100%' : tier === 'pro' ? 'No Pubblicità' : 'Versione Gratuita'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color={tier === 'free' ? 'var(--text-muted)' : '#10B981'} />
              <span style={{ color: tier === 'free' ? 'var(--text-muted)' : 'var(--text-primary)' }}>Nessuna pubblicità nativa</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color={tier === 'free' ? 'var(--text-muted)' : '#10B981'} />
              <span style={{ color: tier === 'free' ? 'var(--text-muted)' : 'var(--text-primary)' }}>Richieste AI illimitate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color={tier === 'ultra' ? '#00f2fe' : 'var(--text-muted)'} />
              <span style={{ color: tier === 'ultra' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Modello AI Supremo (Gemini 2.5 Pro)</span>
            </div>
          </div>

          {tier === 'free' && (
            <div style={{ marginBottom: '14px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Analisi AI gratuite oggi:</span>
                <span style={{ color: IAPService.getDailyAiCount() >= 10 ? 'var(--danger)' : 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {IAPService.getDailyAiCount()} / 10
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (IAPService.getDailyAiCount() / 10) * 100)}%`, height: '100%', background: IAPService.getDailyAiCount() >= 10 ? 'var(--danger)' : 'var(--accent-primary)', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {tier !== 'ultra' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handlePurchase('ultra')}
                disabled={purchasing}
                className="btn-primary"
                style={{
                  width: '100%', padding: '10px', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: purchasing ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#002538', border: 'none', boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)'
                }}
              >
                <Sparkles size={14} />
                {purchasing ? 'Elaborazione...' : '7 giorni gratis, poi...'}
              </button>

              {/* Selettore Piano */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setUltraPlan('monthly')}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)',
                    fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer',
                    border: ultraPlan === 'monthly' ? '2px solid #00f2fe' : '1.5px solid rgba(255,255,255,0.12)',
                    background: ultraPlan === 'monthly' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.04)',
                    color: ultraPlan === 'monthly' ? '#00f2fe' : 'var(--text-secondary)',
                    transition: 'all 0.2s', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1rem', marginBottom: '2px' }}>€2,99</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>al mese</div>
                </button>
                <button
                  onClick={() => setUltraPlan('yearly')}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)',
                    fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer', position: 'relative',
                    border: ultraPlan === 'yearly' ? '2px solid #00f2fe' : '1.5px solid rgba(255,255,255,0.12)',
                    background: ultraPlan === 'yearly' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.04)',
                    color: ultraPlan === 'yearly' ? '#00f2fe' : 'var(--text-secondary)',
                    transition: 'all 0.2s', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.6rem', position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: 'white', padding: '1px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>2 MESI GRATIS</div>
                  <div style={{ fontSize: '1rem', marginBottom: '2px' }}>€14,99</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>all'anno</div>
                </button>
              </div>

              {tier === 'free' && (
                <button
                  onClick={() => handlePurchase('pro')}
                  disabled={purchasing}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: purchasing ? 'not-allowed' : 'pointer',
                    background: 'rgba(109, 40, 217, 0.15)', color: 'var(--accent-primary)', border: '1.5px solid var(--accent-primary)', boxShadow: '0 2px 10px rgba(109, 40, 217, 0.2)'
                  }}
                >
                  <Award size={14} />
                  {purchasing === 'pro' ? 'Elaborazione...' : 'Oppure passa a PRO'}
                </button>
              )}
              
              <button
                onClick={handleRestorePurchases}
                disabled={restoring}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: restoring ? 'not-allowed' : 'pointer', textDecoration: 'underline', textAlign: 'center', padding: '6px'
                }}
              >
                {restoring ? 'Verifica in corso...' : 'Ripristina Acquisti precedenti'}
              </button>
            </div>
          )}

          {tier === 'ultra' && (
            <button
              onClick={handleManageSubscription}
              style={{
                width: '100%', padding: '9px', borderRadius: 'var(--radius-full)',
                fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px'
              }}
            >
              ⚙️ Gestisci Abbonamento
            </button>
          )}
        </div>

        {/* Info & Privacy */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '12px', fontSize: '0.95rem' }}>
            <Info size={16} color="var(--accent-primary)" />
            <span>Informazioni su OmniDex</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <div style={{ background: 'rgba(16,185,129,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.1)', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 'bold', marginBottom: '4px' }}>
                <ShieldCheck size={14} />
                <span>Tutela della Privacy</span>
              </div>
              Ci impegniamo al massimo per la tua privacy: **non raccogliamo, non tracciamo e non condividiamo alcun dato personale**. I tuoi giochi preferiti sono salvati esclusivamente in locale sulla memoria del tuo dispositivo.
              <div style={{ marginTop: '8px', fontSize: '0.75rem', borderTop: '1px solid rgba(16,185,129,0.15)', paddingTop: '6px' }}>
                <a 
                  href="https://thaocelot.github.io/OmniDex/privacy.html" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: '#10B981', textDecoration: 'underline', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Leggi l'Informativa completa
                </a>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>
                <Mail size={14} color="var(--accent-primary)" />
                <span>Contatti e Supporto</span>
              </div>
              Per qualsiasi feedback, richiesta di funzionalità o segnalazione di bug, puoi scrivere direttamente all'indirizzo email: <a href="mailto:thaocelot@gmail.com" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>thaocelot@gmail.com</a>.
            </div>

            <div style={{ padding: '0 4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Progetto indipendente e senza scopo di lucro. Dati di gioco gentilmente offerti dalle API di RAWG.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
