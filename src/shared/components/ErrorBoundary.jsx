import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-ivory, #FFFDF7)',
            color: 'var(--text-ink, #111111)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-red, #D52B1E)', marginBottom: '12px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6B7280', maxWidth: '480px', marginBottom: '24px', fontSize: '14px' }}>
            An unexpected application error occurred. You can return home or try reloading the page.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--primary-red, #D52B1E)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '10px 20px',
                backgroundColor: '#E5E7EB',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
