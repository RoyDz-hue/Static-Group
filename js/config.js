// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-a01V6F-tyS5xhgUEflbnnDcp4BROJUU",
    authDomain: "fortunelabse.firebaseapp.com",
    databaseURL: "https://fortunelabse-default-rtdb.firebaseio.com",
    projectId: "fortunelabse",
    storageBucket: "fortunelabse.firebasestorage.app",
    messagingSenderId: "853842400913",
    appId: "1:853842400913:web:12ee9519c8667fa83d5130",
    measurementId: "G-XYV95HGG1G"
};

// Initialize Firebase securely
export function initializeFirebase() {
    return import('https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js')
        .then((firebase) => {
            const app = firebase.initializeApp(firebaseConfig);
            return app;
        })
        .catch(error => {
            console.error('Error initializing Firebase:', error);
            throw error;
        });
}

// Get Firebase Auth instance
export async function getAuth() {
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js');
    return getAuth();
}

// Get Firestore instance
export async function getFirestore() {
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    return getFirestore();
}

// Initialize Firebase and export app instance
export const app = await initializeFirebase();
