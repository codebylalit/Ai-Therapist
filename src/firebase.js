import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCAMkW_XmSSX1xGhoHgLTHclEYWZRX4-2E",
  authDomain: "ai-therapist-e4509.firebaseapp.com",
  projectId: "ai-therapist-e4509",
  storageBucket: "ai-therapist-e4509.firebasestorage.app",
  messagingSenderId: "995166068306",
  appId: "1:995166068306:web:843d51fb3ae9514c6d098b",
  measurementId: "G-ZVQZ0XMN0W"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); 