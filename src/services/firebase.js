// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA3M-Z-Eekpo2L0OF77uAmW09Akz9-qDCM",
  authDomain: "datahive-9033c.firebaseapp.com",
  projectId: "datahive-9033c",
  storageBucket: "datahive-9033c.firebasestorage.app",
  messagingSenderId: "1025548735169",
  appId: "1:1025548735169:web:18adab1488249f1d1e7a40",
  measurementId: "G-JCFGLDZK6B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const registerUser = async (email, password, userType, username) => {
  try {
    console.log('Attempting to register user:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    try {
      // Store user type and username in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username,
        userType,
        createdAt: new Date().toISOString()
      });
    } catch (firestoreError) {
      // If Firestore write fails, delete the created auth user
      console.error('Firestore error:', firestoreError);
      await userCredential.user.delete();
      throw new Error('Registration failed: Database access error. Please try again.');
    }
    
    console.log('Registration successful:', userCredential);
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email, password, expectedUserType) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.data();
    
    if (userData.userType !== expectedUserType) {
      await signOut(auth);
      throw new Error(`Invalid account type. Please use the ${expectedUserType} login.`);
    }
    
    return {
      user: userCredential.user,
      userData
    };
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
  } catch (error) {
    throw error;
  }
};

export { auth, db };