import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Gamepad2, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Qui andrà l'integrazione con Firebase Auth
    console.log("Tentativo di", isLogin ? "login" : "registrazione", { email, password, name });
    alert("Funzionalità in attesa delle API Key di Firebase!");
    navigate('/');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-primary)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '30px' }}>
          <Gamepad2 size={48} color="var(--accent-primary)" style={{ margin: '0 auto 15px' }} />
          <h2 style={{ fontSize: '2rem' }}>{isLogin ? 'Bentornato' : 'Unisciti a noi'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            {isLogin ? 'Accedi per vedere i tuoi giochi preferiti' : 'Crea un account per salvare i giochi'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Nome utente"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '15px 20px', paddingLeft: '50px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
              />
              <User size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '15px 20px', paddingLeft: '50px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
            />
            <Mail size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '15px 20px', paddingLeft: '50px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
            />
            <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {isLogin ? 'Accedi' : 'Registrati'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '25px', color: 'var(--text-secondary)' }}>
          {isLogin ? "Non hai un account? " : "Hai già un account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? "Registrati" : "Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
}
