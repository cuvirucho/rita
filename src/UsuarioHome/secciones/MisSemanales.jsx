import { useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import RitaChat from "../../Rita/RitaChat";
import RitaBloqueado from "../../Rita/RitaBloqueado";
import { useMenuGuardado } from "../../Rita/useMenuGuardado";
import { planUsuario } from "./deliveryUtils";

/**
 * Sección "Plan de Comidas".
 *
 * El chat de Rita es exclusivo de Starter y Premium. El corte del plan Free va
 * ANTES de cualquier hook de datos (mismo criterio que Nutricion.jsx): así el
 * usuario gratuito no dispara ni una lectura de Firestore ni del menú guardado.
 * Los hooks del panel se llaman siempre porque este return está por encima de
 * todos ellos y `plan` no cambia dentro de un montaje.
 *
 * `planUsuario` y no `perfil?.plan === "free"`: es el único normalizador que ve
 * a los usuarios que pagaron por Payphone, cuyo plan solo consta en `cart`.
 */
const MisSemanales = ({ onMenuDiario }) => {
  const { user, perfil } = useAuth();

  if (planUsuario(perfil) === "free") {
    return <RitaBloqueado onMenuDiario={onMenuDiario} />;
  }

  return <SemanalesPanel user={user} perfil={perfil} />;
};

const SemanalesPanel = ({ user, perfil }) => {
  // Busca el menú del usuario en localStorage y, si ahí no hay, en Firestore.
  const { estado, guardado } = useMenuGuardado(user?.uid);
  const [abierto, setAbierto] = useState(false); // pulsó "Crear menú con IA"
  const [cerrado, setCerrado] = useState(false); // pulsó la ✕ del chat

  // Si ya hay un menú guardado se abre RitaChat directo para mostrarlo. Se
  // deriva en el render en vez de en un efecto para que no se vea un frame del
  // estado vacío; `cerrado` es lo que deja funcionar la ✕ aun teniendo menú.
  const mostrarChat = abierto || (!!guardado && !cerrado);

  if (estado === "resolviendo") {
    return (
      <div className="usuario-seccion">
        <span className="delivery-skel delivery-skel--card" />
      </div>
    );
  }

  if (mostrarChat) {
    return (
      <div className="usuario-seccion">
        <RitaChat
          user={user}
          perfil={perfil}
          menuInicial={guardado}
          onCerrar={() => {
            setAbierto(false);
            setCerrado(true);
          }}
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
          Rita, tu nutricionista virtual, te hará algunas preguntas para
          conocerte y diseñar un plan alimenticio hecho a tu medida.
        </p>
        <button
          type="button"
          className="usuario-empty-btn"
          onClick={() => {
            setCerrado(false);
            setAbierto(true);
          }}
        >
          <span className="usuario-empty-btn-icon">✨</span>
          Crear menú con IA
        </button>
      </div>
    </div>
  );
};

export default MisSemanales;
