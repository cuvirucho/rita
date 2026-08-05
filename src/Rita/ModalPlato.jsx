import { useEffect } from "react";
import { createPortal } from "react-dom";

// La IA devuelve "ingredientes" como objeto { nombre: cantidad }, pero no
// siempre: se tolera array y string para no romper el detalle.
const listaIngredientes = (ingredientes) => {
  if (!ingredientes) return [];
  if (Array.isArray(ingredientes)) return ingredientes.map(String);
  if (typeof ingredientes === "string") return [ingredientes];
  return Object.entries(ingredientes).map(([nombre, cantidad]) =>
    cantidad ? `${nombre} — ${cantidad}` : nombre,
  );
};

// "vitaminas" y "minerales" llegan como objeto { tipo: valor }.
const listaChips = (obj) => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj.map(String);
  if (typeof obj === "string") return [obj];
  return Object.entries(obj).map(([clave, valor]) =>
    valor ? `${clave}: ${valor}` : clave,
  );
};

/**
 * Detalle completo de una comida del menú generado por Rita.
 *
 * Sustituye al acordeón que antes vivía dentro de la tarjeta: mismo contenido y
 * mismas clases (.md-stats, .md-block, .md-chips, .rita-card-acciones), solo
 * cambia el contenedor.
 *
 * Reutiliza el shell .trial-modal* y el portal a <body> por el mismo motivo que
 * ModalOrdenar.jsx (transform residual de las animaciones del contenedor).
 *
 * Ordenar y cancelar siguen siendo cosa del padre: aquí solo se disparan los
 * callbacks, que además cierran este modal antes de abrir el suyo para no
 * apilar dos overlays.
 */
const ModalPlato = ({
  icono,
  label,
  details,
  pedido,
  onCerrar,
  onOrdenar,
  onCancelar,
}) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  const ingredientes = listaIngredientes(details.ingredientes);
  const vitaminas = listaChips(details.vitaminas);
  const minerales = listaChips(details.minerales);
  const totalProteinas =
    typeof details.proteinas === "object"
      ? details.proteinas?.total
      : details.proteinas;

  return createPortal(
    <div className="trial-modal-overlay" onClick={onCerrar}>
      <div
        className="trial-modal trial-modal--plato"
        role="dialog"
        aria-modal="true"
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
              {pedido && <span className="md-card-pedida-badge">✅ Pedido</span>}
            </span>
            <span className="md-card-nombre">{details.nombre}</span>
          </span>
        </div>

        {details.calorias != null && (
          <div className="plato-modal-pills">
            <span className="md-card-cal">
              <span className="md-cal-num">{details.calorias}</span>
              <span className="md-cal-label">kcal</span>
            </span>
          </div>
        )}

        <p className="plato-modal-desc">{details.descripcion}</p>

        <div className="plato-modal-body">
          <div className="md-stats rita-stats">
            <div className="md-stat">
              <span className="md-stat-num">{details.calorias ?? "—"}</span>
              <span className="md-stat-label">Calorías</span>
            </div>
            <div className="md-stat">
              <span className="md-stat-num">{totalProteinas ?? "—"}</span>
              <span className="md-stat-label">Proteínas</span>
            </div>
          </div>

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

          {vitaminas.length > 0 && (
            <div className="md-block">
              <h4 className="md-block-title">🍊 Vitaminas</h4>
              <div className="md-chips">
                {vitaminas.map((v, idx) => (
                  <span className="md-chip md-chip--vit" key={`${v}-${idx}`}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {minerales.length > 0 && (
            <div className="md-block">
              <h4 className="md-block-title">⛏️ Minerales</h4>
              <div className="md-chips">
                {minerales.map((m, idx) => (
                  <span className="md-chip md-chip--min" key={`${m}-${idx}`}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rita-card-acciones">
            {pedido && (
              <p className="rita-card-pedida">
                <span className="rita-card-pedida-titulo">
                  ✅ Pedido realizado
                </span>
                <span className="rita-card-pedida-detalle">
                  {pedido.tipo === "ahora"
                    ? "Llega lo antes posible"
                    : `Llega ${pedido.paraManana ? "mañana" : "hoy"} a las ${pedido.hora}`}
                  {pedido.etiqueta ? ` · 📍 ${pedido.etiqueta}` : ""}
                </span>
              </p>
            )}
            {/* Ya pedida: cancelar, no volver a pedir. Reabrir el modal
                crearía un segundo documento en `entregas` para el mismo
                plato. Sin entregaId (pedidos guardados antes de que ese
                campo existiera) no hay documento al que apuntar. */}
            {pedido ? (
              pedido.entregaId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onCancelar}
                >
                  ❌ Cancelar pedido
                </button>
              )
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOrdenar}
              >
                🛵 Ordenar
              </button>
            )}
            {/* Placeholder: por ahora no hace nada. */}
            <button type="button" className="btn btn-outline">
              ✏️ Editar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalPlato;
