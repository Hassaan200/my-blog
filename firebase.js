import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail, reauthenticateWithCredential,  updatePassword, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyC0UbkYCfVsK9yAYIFUJt3ewRozJzDqry4",
    authDomain: "saylani-work-1224b.firebaseapp.com",
    projectId: "saylani-work-1224b",
    storageBucket: "saylani-work-1224b.firebasestorage.app",
    messagingSenderId: "495820984039",
    appId: "1:495820984039:web:5fad7290fd83af37eedc42",
    measurementId: "G-JB2XFWQ2KK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {getAuth, auth,  createUserWithEmailAndPassword, doc, setDoc, db, sendEmailVerification, signInWithEmailAndPassword, getDoc,  collection, addDoc, getDocs, deleteDoc, updateDoc, sendPasswordResetEmail ,reauthenticateWithCredential,  updatePassword, EmailAuthProvider };
