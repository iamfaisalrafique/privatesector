import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
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
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#D52B1E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '16px'
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-red, #D52B1E)', marginBottom: '12px' }}>
            Application Error Caught
          </h2>
          <p style={{ color: '#6B7280', maxWidth: '520px', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>
            An unexpected error occurred in this view section. You can try reloading or return to the main directory.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            <button
              onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
              style={{
                padding: '10px 20px',
                backgroundColor: '#F3F4F6',
                color: '#4B5563',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {this.state.showDetails ? 'Hide Error Log' : 'View Error Log'}
            </button>
          </div>

          {this.state.showDetails && this.state.error && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#1E293B',
              color: '#F8FAFC',
              borderRadius: '8px',
              textAlign: 'left',
              maxWidth: '700px',
              width: '100%',
              overflowX: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: 1.5
            }}>
              <strong>Error:</strong> {this.state.error.toString()}
              {this.state.error.stack && (
                <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', color: '#94A3B8' }}>
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
