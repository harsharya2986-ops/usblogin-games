import { auth, database, googleProvider } from '../firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from '../firebase-config.js';
import { ref, set, get } from '../firebase-config.js';

// Global functions
window.switchTab = function(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'flex';
        loginForm.style.display = 'none';
    }
    
    hideMessages();
};

window.checkPasswordStrength = function(password) {
    const bar = document.getElementById('passwordStrengthBar');
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    bar.className = 'password-strength-bar';
    if (strength <= 2) bar.classList.add('weak');
    else if (strength === 3) bar.classList.add('medium');
    else if (strength === 4) bar.classList.add('strong');
    else bar.classList.add('very-strong');
};

function showError(form, message) {
    const el = document.getElementById(form + 'Error');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 4000);
}

function showSuccess(message) {
    const el = document.getElementById('registerSuccess');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
}

function hideMessages() {
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('registerError').classList.remove('show');
    document.getElementById('registerSuccess').classList.remove('show');
}

// Register with Email/Password
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !email || !password) {
        showError('register', 'Please fill in all fields');
        return;
    }
    
    if (username.length < 3) {
        showError('register', 'Username must be at least 3 characters');
        return;
    }
    
    if (password.length < 6) {
        showError('register', 'Password must be at least 6 characters');
        return;
    }
    
    try {
        document.getElementById('registerBtn').textContent = 'Loading...';
        document.getElementById('registerBtn').disabled = true;
        
        // Check if username exists
        const usernameRef = ref(database, 'usernames/' + username);
        const snapshot = await get(usernameRef);
        
        if (snapshot.exists()) {
            showError('register', 'Username already taken!');
            document.getElementById('registerBtn').textContent = '✨ Register';
            document.getElementById('registerBtn').disabled = false;
            return;
        }
        
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user data
        await set(ref(database, 'usernames/' + username), user.uid);
        await set(ref(database, 'users/' + user.uid), {
            username: username,
            email: email,
            createdAt: Date.now(),
            gamesPlayed: 0,
            gamesWon: 0
        });
        
        showSuccess('Registration successful! Please login.');
        setTimeout(() => switchTab('login'), 1500);
        
    } catch (error) {
        showError('register', error.message);
    } finally {
        document.getElementById('registerBtn').textContent = '✨ Register';
        document.getElementById('registerBtn').disabled = false;
    }
});

// Login with Email/Password
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('login', 'Please fill in all fields');
        return;
    }
    
    try {
        document.getElementById('loginBtn').textContent = 'Loading...';
        document.getElementById('loginBtn').disabled = true;
        
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'lobby.html';
        
    } catch (error) {
        showError('login', error.message);
        document.getElementById('loginBtn').textContent = '💕 Login';
        document.getElementById('loginBtn').disabled = false;
    }
});

// Google Login - Fixed with redirect fallback
document.getElementById('googleBtn').addEventListener('click', async () => {
    try {
        // Try popup first
        const result = await signInWithPopup(auth, googleProvider);
        await handleGoogleUser(result.user);
        
    } catch (error) {
        if (error.code === 'auth/unauthorized-domain') {
            showError('login', 'This domain is not authorized. Please use localhost or add your domain in Firebase Console.');
        } else if (error.code === 'auth/popup-blocked') {
            // Popup blocked, try redirect
            try {
                await signInWithRedirect(auth, googleProvider);
            } catch (redirectError) {
                showError('login', redirectError.message);
            }
        } else {
            showError('login', error.message);
        }
    }
});

// Handle Google user after redirect
async function handleGoogleUser(user) {
    try {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
            const username = user.email.split('@')[0];
            await set(ref(database, 'users/' + user.uid), {
                username: username,
                email: user.email,
                createdAt: Date.now(),
                gamesPlayed: 0,
                gamesWon: 0,
                googleAuth: true
            });
            await set(ref(database, 'usernames/' + username), user.uid);
        }
        
        window.location.href = 'lobby.html';
    } catch (error) {
        showError('login', error.message);
    }
}

// Handle Google redirect result
onAuthStateChanged(auth, (user) => {
    if (user) {
        const isRedirectResult = window.location.href.includes('redirect');
        if (isRedirectResult || user.providerData.some(p => p.providerId === 'google.com')) {
            handleGoogleUser(user);
        }
    }
});