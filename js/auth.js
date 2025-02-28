import { getAuth } from './config.js';

// Initialize auth
let auth;
async function initAuth() {
    auth = await getAuth();
}
await initAuth();

// DOM Elements
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const loginFormDiv = document.getElementById('loginForm');
const registerFormDiv = document.getElementById('registerForm');

// Navigation between forms
loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.classList.remove('hidden');
    registerFormDiv.classList.add('hidden');
    loginLink.classList.add('active');
    registerLink.classList.remove('active');
});

registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.classList.add('hidden');
    registerFormDiv.classList.remove('hidden');
    loginLink.classList.remove('active');
    registerLink.classList.add('active');
});

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Special check for admin
        if (email === 'admin@system.com' && password === 'Admin2025') {
            // Implement admin login logic
            window.location.href = 'admin/dashboard.html';
            return;
        }

        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js');
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Register Form Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;

    try {
        const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js');
        const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
        
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Store additional user data
        const db = getFirestore();
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name,
            email,
            createdAt: new Date().toISOString(),
            isAdmin: false
        });

        window.location.href = 'dashboard.html';
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Helper function to show messages
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const form = type === 'error' ? 
        (loginFormDiv.classList.contains('hidden') ? registerFormDiv : loginFormDiv) : 
        document.querySelector('.auth-form');
    
    form.insertBefore(messageDiv, form.firstChild);
    
    setTimeout(() => messageDiv.remove(), 5000);
}
