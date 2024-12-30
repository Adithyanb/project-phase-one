// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA3M-Z-Eekpo2L0OF77uAmW09Akz9-qDCM",
  authDomain: "datahive-9033c.firebaseapp.com",
  projectId: "datahive-9033c",
  storageBucket: "datahive-9033c.firebasestorage.app",
  messagingSenderId: "1025548735169",
  appId: "1:1025548735169:web:18adab1488249f1d1e7a40",
  measurementId: "G-JCFGLDZK6B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// In your firebase.js file, add logs to registerUser function:
export const registerUser = async (email, password) => {
    try {
      console.log('Attempting to register user:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful:', userCredential);
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export { auth };