import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: "pennywise-1271f.firebaseapp.com",
	projectId: "pennywise-1271f",
	storageBucket: "pennywise-1271f.firebasestorage.app",
	messagingSenderId: "809034201893",
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
// const firebaseConfig = {
// 	apiKey: "AIzaSyCdhQtW5j2Nidrw1Gzjdfv2svNyOnzbNqY",
// 	authDomain: "pennywise-1271f.firebaseapp.com",
// 	projectId: "pennywise-1271f",
// 	storageBucket: "pennywise-1271f.firebasestorage.app",
// 	messagingSenderId: "809034201893",
// 	appId: "1:809034201893:web:92c5a5bee2b7177bd0b8cc",
// 	measurementId: "G-51PVYK3CLQ",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
// console.log(analytics);
