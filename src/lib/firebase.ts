import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpvY6pRP2R7xnuSJ4nho-ISAipKXpwtys",
  authDomain: "blankoot-4ae7c.firebaseapp.com",
  projectId: "blankoot-4ae7c",
  storageBucket: "blankoot-4ae7c.firebasestorage.app",
  messagingSenderId: "1076207639115",
  appId: "1:1076207639115:web:1e46c59b18d3a2ae4acbce",
  measurementId: "G-R88M7CETJX"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
