import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Check if it's an auth-related error
      const isAuthError = this.state.error?.message?.includes('AuthProvider') || 
                         this.state.error?.message?.includes('useAuth');
      
      return (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#1C1A1C',
          color: '#C2C2C2',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#FF335F', marginBottom: '1rem' }}>
            {isAuthError ? 'Authentication Error' : 'Something went wrong'}
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            {isAuthError 
              ? 'There was an issue with authentication. Please try logging in again.'
              : 'An unexpected error occurred. Please refresh the page.'
            }
          </p>
          {this.state.error && (
            <details style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#999' }}>
              <summary>Error details</summary>
              <pre style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{
                marginRight: '10px',
                padding: '10px 20px',
                backgroundColor: '#FF335F',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary; 