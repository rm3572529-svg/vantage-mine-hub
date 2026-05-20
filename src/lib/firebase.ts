import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCFLfuGTp5_Hw1voZgitGfvnqhkuYPrUpU",
  authDomain: "vantage-mine-hub.firebaseapp.com",
  databaseURL: "https://vantage-mine-hub-default-rtdb.firebaseio.com",
  projectId: "vantage-mine-hub",
  storageBucket: "vantage-mine-hub.firebasestorage.app",
  messagingSenderId: "538561818249",
  appId: "1:538561818249:web:558469806ba20f19f2a058"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;