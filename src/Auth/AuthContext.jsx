import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../FIRBAS/Firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      setUser(usuarioFirebase);

      if (usuarioFirebase) {
        try {
          const snap = await getDoc(
            doc(db, "UsuariosActivos", usuarioFirebase.uid),
          );
          setPerfil(snap.exists() ? snap.data() : null);
        } catch {
          setPerfil(null);
        }
      } else {
        setPerfil(null);
      }

      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfil, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return contexto;
};
