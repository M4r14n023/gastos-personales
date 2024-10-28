import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBj8PFJOkpu6hS_5GTWnqGOi_lyy4El_2I",
  authDomain: "expense-tracker-bolt.firebaseapp.com",
  projectId: "expense-tracker-bolt",
  storageBucket: "expense-tracker-bolt.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth, db };