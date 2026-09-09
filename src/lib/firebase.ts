import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBCNPitlAGE_A4t0vQeyFxT78l9qAkvCj4",
  authDomain: "blankspaceorientation.firebaseapp.com",
  projectId: "blankspaceorientation",
  storageBucket: "blankspaceorientation.firebasestorage.app",
  messagingSenderId: "1037961024158",
  appId: "1:1037961024158:web:583299947d5262365d218f",
  measurementId: "G-8FYKEVDNW2"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
