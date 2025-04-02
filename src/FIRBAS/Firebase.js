// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTAsy59hvNHSwJ7OxdTXx244QA1wWQe6w",
  authDomain: "rita-53713.firebaseapp.com",
  projectId: "rita-53713",
  storageBucket: "rita-53713.firebasestorage.app",
  messagingSenderId: "322554363362",
  appId: "1:322554363362:web:fe0477875c3e3288e88dbb",
  measurementId: "G-FM6QKYHKC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



export const db = getFirestore(app);

