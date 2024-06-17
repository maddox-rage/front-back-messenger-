import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDmgGe4ftoHTAcI8SrwZ-jwMro03u0qAww",
  authDomain: "project-8993231596322549892.firebaseapp.com",
  projectId: "project-8993231596322549892",
  storageBucket: "project-8993231596322549892.appspot.com",
  messagingSenderId: "872929501648",
  appId: "1:872929501648:web:39f81ebcec70d0139299d5"
};


const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
