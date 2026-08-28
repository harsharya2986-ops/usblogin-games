import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getDatabase, ref, set, get, update, remove, onValue, push } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCaR33cAwHFTNdSlBuuzoju9yzah8szBmQ",
    authDomain: "usblog-games.firebaseapp.com",
    databaseURL: "https://usblog-games-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "usblog-games",
    storageBucket: "usblog-games.firebasestorage.app",
    messagingSenderId: "568211981446",
    appId: "1:568211981446:web:0e75688bb9a28c2df97d07",
    measurementId: "G-BDKRR8E565"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { app, auth, database, googleProvider };
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut };
export { ref, set, get, update, remove, onValue, push };