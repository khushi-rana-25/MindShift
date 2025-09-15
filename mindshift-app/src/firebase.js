import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCepCXZxCQ-zTa4Uw8Rw_iebfWuJFLb5dA",
  authDomain: "mindshift-app-v1.firebaseapp.com",
  projectId: "mindshift-app-v1",
  storageBucket: "mindshift-app-v1.firebasestorage.app",
  messagingSenderId: "705091851511",
  appId: "1:705091851511:web:dfc599bab549662d0feff2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
