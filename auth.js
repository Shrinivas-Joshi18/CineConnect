import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { auth, database } from './firebase-config.js';

// Signup function
async function signUp(email, password, username, userType) {
    try {
        console.log("Starting signup process...");
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Auth user created:", user.uid);

        // Store user data in database
        const userRef = ref(database, "users/" + user.uid);
        console.log("Database reference created:", userRef);
        
        const userData = {
            username: username,
            email: email,
            userType: userType,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profile: {
                name: username,
                type: userType,
                email: email,
                createdAt: new Date().toISOString()
            }
        };
        console.log("User data prepared:", userData);

        // Set user data in database
        try {
            await set(userRef, userData);
            console.log("Data successfully written to database");
        } catch (dbError) {
            console.error("Database write error:", dbError);
            throw new Error("Failed to write user data to database: " + dbError.message);
        }

        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: email,
            username: username,
            userType: userType
        }));

        return { success: true, user };
    } catch (error) {
        console.error("Signup error:", error);
        let errorMessage = "An error occurred during signup.";
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "This email is already registered.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address.";
                break;
            case 'auth/operation-not-allowed':
                errorMessage = "Email/password accounts are not enabled.";
                break;
            case 'auth/weak-password':
                errorMessage = "Please choose a stronger password.";
                break;
            default:
                errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// Login function
async function login(email, password) {
    try {
        console.log("Starting login process...");
        
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Auth login successful:", user.uid);

        // Update last login time
        const userRef = ref(database, "users/" + user.uid);
        console.log("Database reference created:", userRef);
        
        try {
            await set(ref(database, "users/" + user.uid + "/lastLogin"), new Date().toISOString());
            console.log("Last login time updated");
        } catch (dbError) {
            console.error("Database update error:", dbError);
            throw new Error("Failed to update last login time: " + dbError.message);
        }

        // Get user data from database
        const userData = await get(userRef);
        const userDetails = userData.val();
        console.log("Retrieved user data:", userDetails);

        if (!userDetails) {
            throw new Error("User data not found in database.");
        }

        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: userDetails.username,
            userType: userDetails.userType
        }));

        return { success: true, user, userDetails };
    } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "An error occurred during login.";
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address.";
                break;
            case 'auth/user-disabled':
                errorMessage = "This account has been disabled.";
                break;
            case 'auth/user-not-found':
                errorMessage = "No account found with this email.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Incorrect password.";
                break;
            default:
                errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// Logout function
async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        return { success: true };
    } catch (error) {
        console.error("Logout error:", error);
        throw new Error("An error occurred during logout.");
    }
}

// Export functions
export { signUp, login, logout };
