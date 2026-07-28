import { useState } from "react";
import { abrirWhatsApp } from "./whatsapp";
import { calcAhorro, formatearPrecio } from "./precios";

// Planes disponibles: cada uno mapea al campo de precio del entrenador y a la
// etiqueta que se muestra y se envía en el mensaje de WhatsApp.
const PLANES = [
  { id: "hora", label: "Por hora", campo: "precioHora", texto: "POR HORA" },
  { id: "semana", label: "Por semana", campo: "precioSemana", texto: "POR SEMANA" },
  { id: "mes", label: "Por mes", campo: "precioMes", texto: "POR MES" },
];

const ModalSuscribir = ({ entrenador, onClose }) => {
  const [planId, setPlanId] = useState("mes");

  const plan = PLANES.find((p) => p.id === planId);
  const precio = entrenador[plan.campo];
  const ahorroMes = calcAhorro(entrenador.precioSemana, entrenador.precioMes);

  const confirmar = () => {
    const mensaje =
      `Hola, estoy interesado en contratar un entrenamiento personal con usted ` +
      `en el plan ${plan.texto} ($${precio ?? "a convenir"}). ` +
      `Quedo atento a su confirmación. Muchas gracias.`;
    abrirWhatsApp(entrenador.telefonoWhatsApp, mensaje);
    onClose();
  };

  return (
    <div className="trial-modal-overlay" onClick={onClose}>
      <div
        className="trial-modal entrenador-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="trial-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="entrenador-modal-head">
          {entrenador.foto ? (
            <img
              src={entrenador.foto}
              alt={entrenador.nombre}
              className="entrenador-modal-foto"
            />
          ) : (
            <span className="entrenador-modal-foto entrenador-modal-foto--placeholder">
              🏋️
            </span>
          )}
          <div className="entrenador-modal-head-info">
            <span className="entrenador-modal-eyebrow">💪 Suscripción</span>
            <h2 className="entrenador-modal-title">{entrenador.nombre}</h2>
            {entrenador.especialidad && (
              <span className="entrenador-modal-especialidad">
                {entrenador.especialidad}
              </span>
            )}
          </div>
        </div>

        <p className="trial-modal-desc">
          Elige el plan que mejor se adapte a ti y confirma por WhatsApp.
        </p>

        <div className="entrenador-plan-selector">
          {PLANES.map((p) => {
            const esMes = p.id === "mes";
            return (
              <button
                key={p.id}
                type="button"
                className={`entrenador-plan-opt ${planId === p.id ? "active" : ""} ${
                  esMes ? "entrenador-plan-opt--popular" : ""
                }`}
                onClick={() => setPlanId(p.id)}
              >
                {esMes && (
                  <span className="entrenador-plan-opt-badge">Más popular</span>
                )}
                <span className="entrenador-plan-opt-label">{p.label}</span>
                <span className="entrenador-plan-opt-precio">
                  {formatearPrecio(entrenador[p.campo])}
                </span>
                {esMes && ahorroMes != null && (
                  <span className="entrenador-plan-opt-ahorro">
                    Ahorra {ahorroMes}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="entrenador-plan-resumen">
          Plan seleccionado: <strong>{plan.label}</strong>
          <span className="entrenador-plan-resumen-precio">
            {precio == null || precio === "" ? "Precio a convenir" : `$${precio}`}
          </span>
        </div>

        <ul className="entrenador-reaseguros">
          <li>✔ Sin permanencia</li>
          <li>✔ Pago seguro por WhatsApp</li>
          <li>✔ Cancela cuando quieras</li>
        </ul>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={confirmar}
        >
          Continuar por WhatsApp 💬
        </button>
      </div>
    </div>
  );
};

export default ModalSuscribir;
