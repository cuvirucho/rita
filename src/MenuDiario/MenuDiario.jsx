import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import menuDiario from "./menuDiario";
import ModalPlato from "./ModalPlato";
import { useAuth } from "../Auth/AuthContext";

const OBJETIVOS = [
  { key: "ganar_musculo", label: "Ganar masa muscular", icono: "💪" },
  { key: "bajar_peso", label: "Bajar de peso", icono: "🔥" },
];

function MenuDiario() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [objetivo, setObjetivo] = useState("ganar_musculo");
  // Índice de la comida cuyo detalle se está mostrando (null = modal cerrado).
  const [platoAbierto, setPlatoAbierto] = useState(null);
  // Modal de aviso cuando alguien sin sesión intenta ordenar.
  const [modalLogin, setModalLogin] = useState(false);
  const comidas = menuDiario[objetivo] || [];
  // Estable: ModalPlato la usa como dependencia del listener de Escape.
  const cerrarPlato = useCallback(() => setPlatoAbierto(null), []);

  const cambiarObjetivo = (key) => {
    setObjetivo(key);
    setPlatoAbierto(null); // el detalle abierto ya no pertenece a este objetivo
  };

  return (
    <div className="container">
      {/* Encabezado */}
      <div className="section-header">
        <span className="section-badge2">🍽️ Rita menu</span>
        <h2 className="section-title">Ordena el menu de hoy </h2>
        <p className="section-subtitle">
          Disfruta de nuestro menú del día con delivery gratis. Pide uno o todos
          los platos y descubre nuevos sabores, porque cada semana preparamos
          opciones diferentes. ¡No dejes pasar la oportunidad de probar algo
          delicioso!
        </p>
      </div>

      {/* Toggle switch objetivo */}
      <div
        className="md-toggle"
        role="tablist"
        aria-label="Objetivo del menú diario"
        data-active={objetivo}
      >
        <span className="md-toggle-thumb" aria-hidden="true" />
        {OBJETIVOS.map((op) => (
          <button
            key={op.key}
            type="button"
            role="tab"
            aria-selected={objetivo === op.key}
            className={`md-toggle-option ${objetivo === op.key ? "active" : ""}`}
            onClick={() => cambiarObjetivo(op.key)}
          >
            <span className="md-toggle-icon">{op.icono}</span>
            {op.label}
          </button>
        ))}
      </div>

      {/* Grid de comidas — key={objetivo} re-monta y dispara la animación al cambiar */}
      <div className="md-grid" key={objetivo}>
        {comidas.map((comida, i) => (
          <article
            className="md-card"
            style={{ animationDelay: `${i * 80}ms` }}
            key={`${objetivo}-${comida.tipo}`}
          >
            {/* Resumen clicable — abre el modal con el detalle del plato */}
            <button
              type="button"
              className="md-card-summary"
              onClick={() => setPlatoAbierto(i)}
              aria-haspopup="dialog"
            >
              <span className="md-card-summary-top">
                <span className="md-card-icon" aria-hidden="true">
                  {comida.icono}
                </span>
                <span className="md-card-heading">
                  <span className="md-card-tipo">{comida.tipo}</span>
                  <span className="md-card-nombre">{comida.nombre}</span>
                </span>
                <span className="md-card-cal">
                  <span className="md-cal-num">{comida.calorias}</span>
                  <span className="md-cal-label">kcal</span>
                </span>
                <span className="md-card-chevron" aria-hidden="true">
                  ›
                </span>
              </span>
              <span className="md-card-desc">{comida.descripcion}</span>
            </button>
          </article>
        ))}
      </div>

      {platoAbierto !== null && comidas[platoAbierto] && (
        <ModalPlato
          comida={comidas[platoAbierto]}
          onCerrar={cerrarPlato}
          onOrdenar={() => {
            const comida = comidas[platoAbierto];
            // Se cierra antes de abrir el de login: dos overlays apilados
            // oscurecerían el fondo dos veces.
            setPlatoAbierto(null);
            if (!user) {
              setModalLogin(true);
              return;
            }
            navigate("/orden-diaria", {
              state: { objetivo, tipo: comida.tipo },
            });
          }}
        />
      )}

      {modalLogin && (
        <div
          className="trial-modal-overlay"
          onClick={() => setModalLogin(false)}
        >
          <div className="trial-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="trial-modal-close"
              onClick={() => setModalLogin(false)}
            >
              ✕
            </button>
            <span className="trial-modal-icon">🔐</span>
            <h2 className="trial-modal-title">Inicia sesión para continuar</h2>
            <p className="trial-modal-desc">
              Para hacer tu pedido del día necesitas tener una cuenta o iniciar
              sesión en Rita Fit.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                setModalLogin(false);
                document
                  .getElementById("acceder")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Iniciar sesión / Crear cuenta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuDiario;
