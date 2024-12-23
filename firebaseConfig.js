import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA9o5Ed-Ye0JiMSNGfsUbDBXl8b6r248YE",
  authDomain: "dev-surangacell.firebaseapp.com",
  projectId: "dev-surangacell",
  storageBucket: "dev-surangacell.firebasestorage.app",
  messagingSenderId: "713617782306",
  appId: "1:713617782306:web:6e13b79315930f6ae63c7b",
  measurementId: "G-8ZTF83CRDC"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);


export { app, auth, firestore, storage,database };