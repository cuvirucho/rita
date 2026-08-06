import { useEffect } from "react";
import { createPortal } from "react-dom";
import { estaVacia, formatearMedida, formatearNumero } from "./nutricionCore";

// La IA devuelve "ingredientes" como objeto { nombre: cantidad }, pero no
// siempre: se tolera array y string, igual que Rita/ModalPlato.jsx.
const listaIngredientes = (ingredientes) => {
  if (!ingredientes) return [];
  if (Array.isArray(ingredientes)) return ingredientes.map(String);
  if (typeof ingredientes === "string") return [ingredientes];
  return Object.entries(ingredientes).map(([nombre, cantidad]) =>
    cantidad ? `${nombre} — ${cantidad}` : nombre,
  );
};

const BloqueMicros = ({ titulo, icono, micros }) => {
  const entradas = Object.entries(micros ?? {});
  if (entradas.length === 0) return null;

  return (
    <div className="md-block">
      <h4 className="md-block-title">
        {icono} {titulo}
      </h4>
      <ul className="nutri-tabla">
        {entradas.map(([etiqueta, medida]) => (
          <li className="nutri-tabla-fila" key={etiqueta}>
            <span className="nutri-tabla-nombre">{etiqueta}</span>
            <span className="nutri-tabla-valor">{formatearMedida(medida)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Lo que aporta una comida, exactamente como viene en el menú.
 *
 * No hay lista fija que rellenar ni filas de "sin datos": se enseñan las
 * vitaminas y los minerales que ese plato declara, en su orden, con sus propias
 * unidades. Un plato con cuatro minerales muestra cuatro.
 *
 * Reutiliza el shell .trial-modal* y el portal a <body> por el mismo motivo que
 * Rita/ModalPlato.jsx (transform residual de las animaciones del contenedor).
 */
const ModalNutrientes = ({
  icono,
  label,
  plato,
  lectura,
  consumida,
  onAlternar,
  onCerrar,
}) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  const ingredientes = listaIngredientes(plato?.ingredientes);

  return createPortal(
    <div className="trial-modal-overlay" onClick={onCerrar}>
      <div
        className="trial-modal trial-modal--nutri"
        role="dialog"
        aria-modal="true"
        aria-label={`Nutrientes de ${plato?.nombre ?? label}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="trial-modal-close"
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="plato-modal-head">
          <span className="md-card-icon" aria-hidden="true">
            {icono}
          </span>
          <span className="md-card-heading">
            <span className="md-card-tipo">
              {label}
              {consumida && (
                <span className="md-card-pedida-badge">✅ Consumida</span>
              )}
            </span>
            <span className="md-card-nombre">{plato?.nombre}</span>
          </span>
        </div>

        {plato?.descripcion && (
          <p className="plato-modal-desc">{plato.descripcion}</p>
        )}

        {onAlternar && (
          <button
            type="button"
            className={`nutri-modal-marcar ${consumida ? "is-consumida" : ""}`}
            onClick={onAlternar}
          >
            {consumida
              ? "↩️ Marcar como no consumida"
              : "✅ Marcar como consumida"}
          </button>
        )}

        <div className="plato-modal-body nutri-modal-body">
          <div className="md-stats rita-stats">
            <div className="md-stat">
              <span className="md-stat-num">
                {formatearNumero(lectura?.calorias)}
              </span>
              <span className="md-stat-label">Calorías</span>
            </div>
            <div className="md-stat">
              <span className="md-stat-num">
                {formatearMedida(lectura?.proteinas)}
              </span>
              <span className="md-stat-label">Proteínas</span>
            </div>
          </div>

          <BloqueMicros titulo="Vitaminas" icono="🍊" micros={lectura?.vitaminas} />
          <BloqueMicros titulo="Minerales" icono="⛏️" micros={lectura?.minerales} />

          {ingredientes.length > 0 && (
            <div className="md-block">
              <h4 className="md-block-title">🧾 Ingredientes</h4>
              <ul className="md-ingredientes">
                {/* La IA puede repetir un nombre: el índice evita claves
                    duplicadas. La lista nunca se reordena. */}
                {ingredientes.map((ing, idx) => (
                  <li className="md-ingrediente" key={`${ing}-${idx}`}>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {estaVacia(lectura) && (
            <p className="nutri-micros-vacio">
              Este plato no trae información nutricional en el menú.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalNutrientes;
