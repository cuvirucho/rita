import { useState } from "react";
import { abrirWhatsApp } from "../lib/whatsapp";

// Fecha mínima seleccionable: hoy (formato YYYY-MM-DD para el input date).
const hoyISO = () => new Date().toISOString().split("T")[0];

const formatearFecha = (fecha) => {
  const d = new Date(`${fecha}T00:00:00`);
  const texto = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const ModalReservar = ({ entrenador, onClose }) => {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const listo = Boolean(fecha && hora);

  const confirmar = () => {
    if (!listo) return;
    const mensaje =
      `Hola, estoy interesado en contratar un entrenamiento personal con usted. ` +
      `Deseo reservar una sesión para el día ${formatearFecha(fecha)} a las ${hora}. ` +
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
            <span className="entrenador-modal-eyebrow">📅 Reserva</span>
            <h2 className="entrenador-modal-title">{entrenador.nombre}</h2>
            {entrenador.especialidad && (
              <span className="entrenador-modal-especialidad">
                {entrenador.especialidad}
              </span>
            )}
          </div>
        </div>

        <p className="trial-modal-desc">
          Elige la fecha y la hora de tu sesión. Confirmaremos por WhatsApp.
        </p>

        <div className="entrenador-reserva-campos">
          <label className="entrenador-reserva-campo">
            <span className="entrenador-reserva-label">Fecha</span>
            <input
              type="date"
              className="entrenador-reserva-input"
              min={hoyISO()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>
          <label className="entrenador-reserva-campo">
            <span className="entrenador-reserva-label">Hora</span>
            <input
              type="time"
              className="entrenador-reserva-input"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </label>
        </div>

        {listo && (
          <div className="entrenador-reserva-resumen">
            <span className="entrenador-reserva-resumen-icon" aria-hidden="true">
              🗓️
            </span>
            <div>
              <span className="entrenador-reserva-resumen-label">
                Tu sesión
              </span>
              <span className="entrenador-reserva-resumen-valor">
                {formatearFecha(fecha)} · {hora}
              </span>
            </div>
          </div>
        )}

        <ul className="entrenador-reaseguros">
          <li>✔ Confirmas por WhatsApp</li>
          <li>✔ Sin pago por adelantado</li>
        </ul>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={confirmar}
          disabled={!listo}
        >
          Reservar por WhatsApp 💬
        </button>
      </div>
    </div>
  );
};

export default ModalReservar;
