import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAYqFK3PhdSb6rJw2hbHRkbqxN0Z_PYOyU",
  authDomain: "expense-tracker-bolt.firebaseapp.com",
  projectId: "expense-tracker-bolt",
  storageBucket: "expense-tracker-bolt.appspot.com",
  messagingSenderId: "475275015176",
  appId: "1:475275015176:web:fb91af6b64bccc0f1d0dbd",
  measurementId: "G-LVP209YV1D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence with unlimited cache size
enableIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firebase persistence failed to enable: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firebase persistence not supported in this browser');
  }
});

const auth = getAuth(app);
auth.useDeviceLanguage();

// Set session persistence to require login after closing the window
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export { auth, db };
