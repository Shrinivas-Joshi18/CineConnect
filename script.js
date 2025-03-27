// Firebase Authentication and Database Integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase Configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Login Function
document.getElementById("loginForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const email = document.querySelector("#loginForm input[type='email']").value;
    const password = document.querySelector("#loginForm input[type='password']").value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update last login time
        const userRef = ref(database, "users/" + user.uid);
        await set(ref(database, "users/" + user.uid + "/lastLogin"), new Date().toISOString());
        
        // Get user data
        const userData = await get(userRef);
        const userDetails = userData.val();
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: userDetails?.username || user.email,
            userType: userDetails?.userType || 'user'
        }));
        
        showNotification("Login successful!");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    } catch (error) {
        console.error("Login failed:", error.message);
        showNotification(error.message, 'error');
    }
});

// Signup Function
document.getElementById("signupForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const name = document.querySelector("#signupForm input[type='text']").value;
    const email = document.querySelector("#signupForm input[type='email']").value;
    const password = document.querySelector("#signupForm input[type='password']").value;
    const userType = document.querySelector("#signupForm select[name='userType']").value;
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user details in Firebase Realtime Database
        const userData = {
            username: name,
            email: email,
            userType: userType,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profile: {
                name: name,
                type: userType,
                email: email,
                createdAt: new Date().toISOString()
            }
        };
        
        await set(ref(database, "users/" + user.uid), userData);
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: email,
            username: name,
            userType: userType
        }));
        
        showNotification("Signup successful!");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    } catch (error) {
        console.error("Signup failed:", error.message);
        showNotification(error.message, 'error');
    }
});

// Logout Function
document.getElementById("logoutBtn")?.addEventListener("click", async function () {
    try {
        await signOut(auth);
        localStorage.removeItem("currentUser");
        showNotification("Logged out successfully!");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Mobile Menu Functionality
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-menu a").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));

// Modal Functionality
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const loginClose = document.getElementById("loginClose");
const signupClose = document.getElementById("signupClose");

// Show modals when clicking login/signup buttons
document.querySelector(".auth-buttons button")?.addEventListener("click", () => {
    loginModal.style.display = "block";
});

// Close modals when clicking the X
loginClose?.addEventListener("click", () => {
    loginModal.style.display = "none";
});

signupClose?.addEventListener("click", () => {
    signupModal.style.display = "none";
});

// Close modals when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target === signupModal) {
        signupModal.style.display = "none";
    }
});
