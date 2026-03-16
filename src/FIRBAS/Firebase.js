// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAU7UpT1h3frRzdT4kUOTfeKb-1nujs1PA",
  authDomain: "rita-ede4f.firebaseapp.com",
  projectId: "rita-ede4f",
  storageBucket: "rita-ede4f.firebasestorage.app",
  messagingSenderId: "460746408608",
  appId: "1:460746408608:web:59a0f526667b78a000bfc5",
  measurementId: "G-WQH0T187ZR",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
