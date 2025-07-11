import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
	apiKey: "AIzaSyCdhQtW5j2Nidrw1Gzjdfv2svNyOnzbNqY",
	authDomain: "pennywise-1271f.firebaseapp.com",
	projectId: "pennywise-1271f",
	storageBucket: "pennywise-1271f.firebasestorage.app",
	messagingSenderId: "809034201893",
	appId: "1:809034201893:web:92c5a5bee2b7177bd0b8cc",
	measurementId: "G-51PVYK3CLQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
