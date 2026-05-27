// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCoWfBf7AWnNa34KOQXO127yGYvm-ondWI",
    authDomain: "mercury-racing.firebaseapp.com",
    projectId: "mercury-racing",
    storageBucket: "mercury-racing.firebasestorage.app",
    messagingSenderId: "790776892679",
    appId: "1:790776892679:web:eb49c809427ee6d6bf89a2",
    measurementId: "G-8S2D1L7CC6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
