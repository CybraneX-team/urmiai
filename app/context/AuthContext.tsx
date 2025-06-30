import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, twitterProvider } from '../config/firebase';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  authError: string | null;
  signUp: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  phoneLogin: (phoneNumber: string) => Promise<any>;
  phoneSignUp: (phoneNumber: string) => Promise<any>;
  verifyPhoneOtp: (otp: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: () => Promise<any>;
  githubSignIn: () => Promise<any>;
  twitterSignIn: () => Promise<any>;
  setupRecaptcha: (phoneNumber: string) => Promise<any>;
  verifyOtp: (otp: string) => Promise<any>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Set a timeout to ensure loading state doesn't get stuck
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    // Clean up the timeout and auth listener
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Initialize RecaptchaVerifier
  const initializeRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  // Phone Number Authentication
  const phoneLogin = async (phoneNumber: string) => {
    try {
      const verifier = initializeRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmationResult);
      return confirmationResult;
    } catch (error: any) {
      console.error('Error during phone login:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const phoneSignUp = async (phoneNumber: string) => {
    // For phone number, signup and login are the same process
    return phoneLogin(phoneNumber);
  };

  const verifyPhoneOtp = async (otp: string) => {
    if (!confirmationResult) {
      const error = 'No confirmation result available';
      setAuthError(error);
      throw new Error(error);
    }
    try {
      const result = await confirmationResult.confirm(otp);
      return result;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Email/Password Authentication (keeping for backward compatibility)
  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    // Clean up recaptcha verifier on logout
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
    setConfirmationResult(null);
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Social Authentication
  const googleSignIn = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const githubSignIn = () => {
    return signInWithPopup(auth, githubProvider);
  };

  const twitterSignIn = () => {
    return signInWithPopup(auth, twitterProvider);
  };

  // Phone Authentication (legacy methods for backward compatibility)
  const setupRecaptcha = async (phoneNumber: string) => {
    return phoneLogin(phoneNumber);
  };

  const verifyOtp = async (otp: string) => {
    return verifyPhoneOtp(otp);
  };

  const value = {
    currentUser,
    loading,
    authError,
    signUp,
    login,
    phoneLogin,
    phoneSignUp,
    verifyPhoneOtp,
    logout,
    resetPassword,
    googleSignIn,
    githubSignIn,
    twitterSignIn,
    setupRecaptcha,
    verifyOtp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 