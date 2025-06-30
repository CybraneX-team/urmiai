import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaGoogle, 
  FaGithub, 
  FaTwitter, 
  FaPhone, 
  FaLock, 
  FaUserCircle, 
  FaShieldAlt, 
  FaUserLock, 
  FaCheck 
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import '../components/auth/Auth.css';

export default function LoginRoute() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { phoneLogin, verifyPhoneOtp, googleSignIn, githubSignIn, twitterSignIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);
  
  useEffect(() => {
    // Check if coming from registration or password reset
    if (location.state?.registered) {
      toast.success('Registration successful! Please log in.');
    } else if (location.state?.passwordReset) {
      toast.success('Password reset link sent! Please check your email.');
    }
  }, [location]);

  // Format phone number with country code
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add +91 if not present (assuming Indian numbers)
    if (digits.length === 10) {
      return `+91${digits}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    } else if (digits.length === 13 && digits.startsWith('91')) {
      return `+${digits}`;
    }
    
    return phone.startsWith('+') ? phone : `+${digits}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      return toast.error('Please enter your phone number');
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Basic phone number validation
    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
      return toast.error('Please enter a valid phone number');
    }
    
    try {
      setLoading(true);
      await phoneLogin(formattedPhone);
      
      setOtpSent(true);
      toast.success('OTP sent to your phone number!');
      
      // Store phone number in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedPhone', phoneNumber);
      } else {
        localStorage.removeItem('rememberedPhone');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to send OTP';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      return toast.error('Please enter the OTP');
    }
    
    if (otp.length !== 6) {
      return toast.error('OTP must be 6 digits');
    }
    
    try {
      setLoading(true);
      await verifyPhoneOtp(otp);
      
      toast.success('Login successful!');
      
      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error: any) {
      let errorMessage = 'Invalid OTP';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: () => Promise<any>, providerName: string) => {
    try {
      setLoading(true);
      await provider();
      
      toast.success(`Logged in with ${providerName}!`);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error: any) {
      let errorMessage = `Failed to sign in with ${providerName}`;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered phone number on component mount
  useEffect(() => {
    const rememberedPhone = localStorage.getItem('rememberedPhone');
    if (rememberedPhone) {
      setPhoneNumber(rememberedPhone);
      setRememberMe(true);
    }
  }, []);

  const resetForm = () => {
    setOtpSent(false);
    setOtp('');
    setPhoneNumber('');
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
              <FaUserLock className="logo-icon" />
              <span>URMI</span>
            </div>
            
            <h2 className="banner-title">Welcome Back!</h2>
            <p className="banner-subtitle">Sign in to access your dashboard and manage your account</p>
            
            <div className="banner-features">
              <div className="feature-item">
                <span className="feature-icon">
                  <FaShieldAlt />
                </span>
                <span>Secure Authentication</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <FaCheck />
                </span>
                <span>Easy Login Options</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <FaUserCircle />
                </span>
                <span>Personalized Dashboard</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right form section */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="auth-form">
            {!otpSent ? (
              <>
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    <FaPhone className="input-icon" /> Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    className="form-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    placeholder="+91XXXXXXXXXX"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="form-options">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    Remember phone number
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  className="auth-btn primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    <FaLock className="input-icon" /> Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    className="form-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="Enter 6-digit OTP"
                    disabled={loading}
                    autoFocus
                    maxLength={6}
                  />
                  <small className="form-help">
                    OTP sent to {phoneNumber}
                  </small>
                </div>
                
                <button 
                  type="submit" 
                  className="auth-btn primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                
                <button 
                  type="button" 
                  className="auth-btn secondary-btn"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Change Phone Number
                </button>
              </>
            )}
            
            {/* Hidden recaptcha container */}
            <div id="recaptcha-container"></div>
            
            <div className="social-divider">
              <span>or continue with</span>
            </div>
            
            <div className="social-login">
              <button
                type="button"
                className="social-btn google-btn"
                onClick={() => handleSocialLogin(googleSignIn, 'Google')}
                disabled={loading}
              >
                <FaGoogle />
              </button>
              
              <button
                type="button"
                className="social-btn github-btn"
                onClick={() => handleSocialLogin(githubSignIn, 'GitHub')}
                disabled={loading}
              >
                <FaGithub />
              </button>
              
              <button
                type="button"
                className="social-btn twitter-btn"
                onClick={() => handleSocialLogin(twitterSignIn, 'X')}
                disabled={loading}
              >
                <FaTwitter />
              </button>
            </div>
            
            <div className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
