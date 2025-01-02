import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCapMGIpkGadmTT7rUZ8IkAB-7tpXHzIBw",
  authDomain: "suranga-cellcare-inventory.firebaseapp.com",
  projectId: "suranga-cellcare-inventory",
  storageBucket: "suranga-cellcare-inventory.firebasestorage.app",
  messagingSenderId: "941072877710",
  appId: "1:941072877710:web:15d94bfab9ee34513e61df",
  measurementId: "G-SW9W05KMJM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);


export { app, auth, firestore, storage,database };