// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
// Your Firebase configuration// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUA8UzbkEYZkPwJJd40TQjqsFBH78PQ9A",
  authDomain: "phs-valedictory-memory-book.firebaseapp.com",
  projectId: "phs-valedictory-memory-book",
  storageBucket: "phs-valedictory-memory-book.firebasestorage.app",
  messagingSenderId: "530388571424",
  appId: "1:530388571424:web:b0ca82e59b6e8516f93345",
  measurementId: "G-1R29Q9NME4"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);
// Make Firestore available to other files
export { db, auth };