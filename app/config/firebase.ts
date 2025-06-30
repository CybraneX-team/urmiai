import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";

// Firebase configuration using environment variables with fallbacks
const firebaseConfig = {
    apiKey: "AIzaSyAGZFe_oZ_2lc_Vh6_MY4QnL_WxaaEc-is",
    authDomain: "urmi-ai-403aa.firebaseapp.com",
    projectId: "urmi-ai-403aa",
    storageBucket: "urmi-ai-403aa.firebasestorage.app",
    messagingSenderId: "693851303474",
    appId: "1:693851303474:web:0f39827a396cd17046562b",
    measurementId: "G-B1KK2ZX9VM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const twitterProvider = new TwitterAuthProvider();

export { auth, googleProvider, githubProvider, twitterProvider };
