import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'smart-shop-vid.firebaseapp.com',
  projectId: 'smart-shop-vid',
  storageBucket: 'smart-shop-vid.appspot.com',
  messagingSenderId: '840205212566',
  appId: '1:840205212566:web:7bd1675eecdd424c231bb7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and export
const storage = getStorage(app);
export { storage };
