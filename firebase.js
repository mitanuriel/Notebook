import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCqYMezi112eDeTTWDlcuDdSt89RynZixo",
    authDomain: "notebook-2c97e.firebaseapp.com",
    projectId: "notebook-2c97e",
    storageBucket: "notebook-2c97e.firebasestorage.app",
    messagingSenderId: "252222391445",
    appId: "1:252222391445:web:06eee53c6e8ec77653c79c",
    measurementId: "G-VVEG2TKP3E"
  };
  

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);