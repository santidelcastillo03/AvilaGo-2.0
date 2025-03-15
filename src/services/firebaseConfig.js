// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDBNUldFVFjHbR1P3fIklcjISOuMEmEOtc",
  authDomain: "avilago-e8168.firebaseapp.com",
  projectId: "avilago-e8168",
  storageBucket: "avilago-e8168.firebasestorage.app",
  messagingSenderId: "1017551095077",
  appId: "1:1017551095077:web:5dfc374d7449fc491f86cc",
  measurementId: "G-JKC895H49E"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
