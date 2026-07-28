import { useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import RitaChat from "../../Rita/RitaChat";
import { hasMenu } from "../../Rita/menuStorage";

const MisSemanales = () => {
  const { user, perfil } = useAuth();
  // Si ya hay un menú guardado, abre RitaChat directo para mostrarlo (persiste
  // tras refrescar o salir de la sección).
  const [iniciado, setIniciado] = useState(() => hasMenu());

  if (iniciado) {
    return (
      <div className="usuario-seccion">
        <RitaChat
          user={user}
          perfil={perfil}
          onCerrar={() => setIniciado(false)}
        />
      </div>
    );
  }

  return (
    <div className="usuario-seccion">
      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">📅 Planificación</span>
        <h2 className="usuario-seccion-title">Mis Menús Semanales</h2>
        <p className="usuario-seccion-sub">
          Organiza tu alimentación de toda la semana en un solo lugar.
        </p>
      </div>

      <div className="usuario-empty">
        <span className="usuario-empty-icon">🥗</span>
        <h3 className="usuario-empty-title">
          Conversa con Rita y crea tu menú personalizado.
        </h3>
        <p className="usuario-empty-text">
          Rita, tu nutricionista virtual, te hará algunas preguntas para conocerte
          y diseñar un plan alimenticio hecho a tu medida.
        </p>
        <button
          type="button"
          className="usuario-empty-btn"
          onClick={() => setIniciado(true)}
        >
          <span className="usuario-empty-btn-icon">✨</span>
          Crear menú con IA
        </button>
      </div>
    </div>
  );
};

export default MisSemanales;
