import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../FIRBAS/Firebase";
import { useAuth } from "../Auth/AuthContext";

const UsuarioHome = () => {
  const { user, perfil } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const nombre =
    perfil?.nombre || user?.displayName || user?.email || "Usuario";
  const primerNombre = nombre.split(" ")[0];

  const cerrarSesion = () => {
    signOut(auth);
  };

  return (
    <div className="usuario-page">
      <div className="usuario-bg">
        <div className="usuario-orb usuario-orb-1" />
        <div className="usuario-orb usuario-orb-2" />
        <div className="usuario-orb usuario-orb-3" />
      </div>

      <div className="usuario-content">
        <img
          src="https://res.cloudinary.com/db8e98ggo/image/upload/v1773687253/logoderita_nncelm.png"
          alt="Rita Fit"
          className="usuario-logo"
        />

        <div className="usuario-card">
          <span className="usuario-wave">👋</span>
          <p className="usuario-greeting">¡Bienvenido de nuevo!</p>
          <h1 className="usuario-name">{primerNombre}</h1>
          <p className="usuario-subtitle">
            Nos alegra tenerte de vuelta en <strong>Rita Fit</strong>.
          </p>

          <button
            type="button"
            className="usuario-logout"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsuarioHome;
