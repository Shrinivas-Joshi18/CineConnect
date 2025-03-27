import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_0mH1wjacrtiCm8kSiT18DQU7tNyPoSM",
    authDomain: "cineconnect-8eec2.firebaseapp.com",
    databaseURL: "https://cineconnect-8eec2-default-rtdb.firebaseio.com",
    projectId: "cineconnect-8eec2",
    storageBucket: "cineconnect-8eec2.firebasestorage.app",
    messagingSenderId: "393197311527",
    appId: "1:393197311527:web:7f20e06456f133afc76002",
    measurementId: "G-D0RR6VV66J"
};

console.log("Initializing Firebase with config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized");

const auth = getAuth(app);
console.log("Firebase auth initialized");

const database = getDatabase(app);
console.log("Firebase database initialized");

export { auth, database };
