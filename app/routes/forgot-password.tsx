import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPhone, 
  FaKey, 
  FaArrowLeft, 
  FaShieldAlt, 
  FaUserLock, 
  FaCheck 
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../components/auth/Auth.css';

export default function ForgotPasswordRoute() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Show message and redirect after a delay
    toast.info('We now use phone authentication. Redirecting to login...');
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="auth-container">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <div className="auth-card">
        {/* Left banner section */}
        <div className="auth-banner">
          <div className="banner-content">
            <div className="banner-logo">
              <FaPhone className="logo-icon" />
              <span>URMI</span>
            </div>
            
            <h2 className="banner-title">Account Recovery</h2>
            <p className="banner-subtitle">We've simplified the process for you</p>
            
            <div className="banner-features">
              <div className="feature-item">
                <span className="feature-icon">
                  <FaShieldAlt />
                </span>
                <span>Secure OTP</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <FaCheck />
                </span>
                <span>Instant Access</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <FaUserLock />
                </span>
                <span>Phone Verification</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right form section */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h1 className="auth-title">No Password Reset Needed</h1>
            <p className="auth-subtitle">
              We now use phone number authentication with OTP verification
            </p>
          </div>
          
          <div className="success-container">
            <div className="success-message">
              <strong>Good news!</strong> You don't need to reset your password anymore. 
              We've switched to a more secure phone-based authentication system.
            </div>
            
            <div className="reset-info">
              <p>Here's how it works:</p>
              <ul>
                <li>Enter your phone number on the login page</li>
                <li>Receive an instant OTP via SMS</li>
                <li>Enter the code to access your account</li>
                <li>No passwords to remember!</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '2rem' }}>
              <button 
                type="button" 
                className="auth-btn primary-btn"
                onClick={handleGoToLogin}
              >
                <FaPhone /> Go to Login
              </button>
              
              <button 
                type="button"
                className="auth-btn secondary-btn"
                onClick={handleGoToLogin}
              >
                <FaArrowLeft /> Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 