import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser
} from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDMh2P3p2BvylKKZS43C18PUlx0U8L9DMU",
  authDomain: "quita-tudo.firebaseapp.com",
  projectId: "quita-tudo",
  storageBucket: "quita-tudo.firebasestorage.app",
  messagingSenderId: "310196713115",
  appId: "1:310196713115:web:0c7bd0db0f7011306a383e",
  measurementId: "G-JFDGM655DK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Habilitar Persistência Offline no Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistência offline falhou: Múltiplas abas abertas.');
  } else if (err.code === 'unimplemented') {
    console.warn('O navegador atual não suporta persistência offline.');
  }
});