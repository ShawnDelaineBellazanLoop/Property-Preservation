import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'monospace' }}>
          <div style={{ background: '#1a0808', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 24, maxWidth: 600, width: '100%' }}>
            <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: 8 }}>⚠ App Error</div>
            <pre style={{ color: '#f87171', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{this.state.error.message}</pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 16px', background: '#00FF87', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
