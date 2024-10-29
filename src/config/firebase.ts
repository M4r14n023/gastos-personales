import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAYqFK3PhdSb6rJw2hbHRkbqxN0Z_PYOyU",
  authDomain: "expense-tracker-bolt.firebaseapp.com",
  projectId: "expense-tracker-bolt",
  storageBucket: "expense-tracker-bolt.appspot.com",
  messagingSenderId: "475275015176",
  appId: "1:475275015176:web:fb91af6b64bccc0f1d0dbd",
  measurementId: "G-LVP209YV1D" // Opcional
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth, db };