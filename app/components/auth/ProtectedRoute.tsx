import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Handle SSR case - if we're on the server, don't try to access auth
  if (typeof window === 'undefined') {
    // Return a loading state for SSR
    return (
      <div className="auth-container" style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1C1A1C',
        color: '#C2C2C2'
      }}>
        <div className="loading-spinner" style={{ 
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #FF335F',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p>Loading...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const { currentUser, loading, authError } = useAuth();
  const location = useLocation();

  // If loading, show a simple spinner
  if (loading) {
    return (
      <div className="auth-container" style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1C1A1C',
        color: '#C2C2C2'
      }}>
        <div className="loading-spinner" style={{ 
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #FF335F',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p>Loading...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Handle auth errors
  if (authError) {
    return (
      <div className="auth-container" style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1C1A1C',
        color: '#C2C2C2'
      }}>
        <h2 style={{ color: '#FF335F', marginBottom: '16px' }}>Authentication Error</h2>
        <p>{authError}</p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            marginTop: '20px',
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
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 