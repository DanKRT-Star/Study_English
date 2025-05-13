import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseconfig";
import { readData, saveData } from "./firebaseconfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await readData(`users/${firebaseUser.uid}`);
        const userWithStatus = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userData,
        };

        await saveData(`users/${firebaseUser.uid}/status`, "online");

        setUser(userWithStatus);

        window.addEventListener("beforeunload", async () => {
          const timestamp = Date.now(); 
          await saveData(`users/${firebaseUser.uid}/status`, "offline");
          await saveData(`users/${firebaseUser.uid}/lastOffline`, timestamp);
        });
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);