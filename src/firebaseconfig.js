import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, update, get, remove } from "firebase/database";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyCu94SL3GSYrbNGxe6gDthsaWZ4Pxu9XTA",
  authDomain: "study-english-26c98.firebaseapp.com",
  databaseURL: "https://study-english-26c98-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "study-english-26c98",
  storageBucket: "study-english-26c98.firebasestorage.app",
  messagingSenderId: "238541070024",
  appId: "1:238541070024:web:19f0dcad7dde81b50c4ffd",
  measurementId: "G-5YMN4E743Z"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); 

export { auth };
export default db;

export const saveData = (path, data) => {
  return set(ref(db, path), data);
};

export const updateData = (path, updates) => {
  return update(ref(db, path), updates);
};

export const readData = async (path) => {
  try {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data found at path:", path);
      return null;
    }
  } catch (error) {
    console.error("Error reading data:", error);
    return null;
  }
};

export const deleteData = (path) => {
  return remove(ref(db, path));
};
