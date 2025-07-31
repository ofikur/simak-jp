import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUoVoKglr0nYHkwZ6oIDf13lO9Zki0vnw",
  authDomain: "simpelkas-70ed9.firebaseapp.com",
  projectId: "simpelkas-70ed9",
  storageBucket: "simpelkas-70ed9.firebasestorage.app",
  messagingSenderId: "719170749400",
  appId: "1:719170749400:web:1fe1c4918922cbcd47e8ad"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
