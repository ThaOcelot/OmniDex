import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#333', minHeight: '100vh', wordBreak: 'break-word' }}>
          <h2>Ops! Qualcosa è andato storto.</h2>
          <details style={{ whiteSpace: 'pre-wrap', background: '#000', padding: '10px', marginTop: '10px' }}>
            <summary>Clicca per i dettagli tecnici (mandami uno screenshot di questo)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent-ultra)', border: 'none', borderRadius: '5px', color: '#000', fontWeight: 'bold' }}
          >
            Torna alla Home
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}
