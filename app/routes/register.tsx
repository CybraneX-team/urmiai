import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaGoogle, 
  FaGithub, 
  FaTwitter, 
  FaPhone, 
  FaLock, 
  FaUser, 
  FaUserPlus, 
  FaCheckCircle, 
  FaShieldAlt,
  FaUserLock,
  FaCheck
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import '../components/auth/Auth.css';

export default function RegisterRoute() {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const { phoneSignUp, verifyPhoneOtp, googleSignIn, githubSignIn, twitterSignIn } = useAuth();
  const navigate = useNavigate();

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
    
    if (!username.trim()) {
      return toast.error('Please enter a username');
    }
    
    if (!phoneNumber.trim()) {
      return toast.error('Please enter your phone number');
    }
    
    if (!termsAccepted) {
      return toast.error('Please accept the terms and conditions');
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Basic phone number validation
    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
      return toast.error('Please enter a valid phone number');
    }
    
    try {
      setLoading(true);
      await phoneSignUp(formattedPhone);
      
      setOtpSent(true);
      toast.success('OTP sent to your phone number!');
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
      const userCredential = await verifyPhoneOtp(otp);
      
      // This is where you would save additional user data like username to your database
      // For example, using Firebase Firestore:
      // await setDoc(doc(db, "users", userCredential.user.uid), {
      //   username,
      //   phoneNumber,
      //   createdAt: new Date(),
      // });
      
      toast.success('Account created successfully!');
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login', { state: { registered: true } });
      }, 1500);
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

  const handleSocialSignIn = async (provider: () => Promise<any>, providerName: string) => {
    try {
      setLoading(true);
      await provider();
      
      toast.success(`Signed up with ${providerName}!`);
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      let errorMessage = `Failed to sign up with ${providerName}`;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign up was cancelled';
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

  const resetForm = () => {
    setOtpSent(false);
    setOtp('');
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
              <FaUserPlus className="logo-icon" />
              <span>URMI</span>
            </div>
            
            <h2 className="banner-title">Join Our Community</h2>
            <p className="banner-subtitle">Create an account to access exclusive features and personalized services</p>
            
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
                <span>Personalized Experience</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <FaUserLock />
                </span>
                <span>Data Privacy</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right form section */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Fill in your details to get started</p>
          </div>
        
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="auth-form">
            {!otpSent ? (
              <>
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    <FaUser className="input-icon" /> Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    disabled={loading}
                    autoFocus
                  />
                </div>
            
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
                  />
                </div>
                
                <div className="form-options">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    I agree to the &nbsp;{'  '}
                    <Link to="/terms" className="auth-link">Terms & Conditions</Link>{'  '}
                    &nbsp;and&nbsp;{'  '}
                    <Link to="/privacy" className="auth-link">Privacy Policy</Link>
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
                  {loading ? 'Creating Account...' : 'Create Account'}
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
              <span>or sign up with</span>
            </div>
            
            <div className="social-login">
              <button
                type="button"
                className="social-btn google-btn"
                onClick={() => handleSocialSignIn(googleSignIn, 'Google')}
                disabled={loading}
              >
                <FaGoogle />
              </button>
              
              <button
                type="button"
                className="social-btn github-btn"
                onClick={() => handleSocialSignIn(githubSignIn, 'GitHub')}
                disabled={loading}
              >
                <FaGithub />
              </button>
              
              <button
                type="button"
                className="social-btn twitter-btn"
                onClick={() => handleSocialSignIn(twitterSignIn, 'X')}
                disabled={loading}
              >
                <FaTwitter />
              </button>
            </div>
            
            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 