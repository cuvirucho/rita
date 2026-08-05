import { useEffect } from "react";
import { createPortal } from "react-dom";

// Porcentaje de cada macro respecto al total de gramos de la comida (para las barras).
function porcentajeMacro(valor, macros) {
  const total =
    (macros.proteinas || 0) + (macros.carbohidratos || 0) + (macros.grasas || 0);
  if (!total) return 0;
  return Math.round((valor / total) * 100);
}

/**
 * Detalle completo de un plato del menú diario.
 *
 * Sustituye al acordeón que antes vivía dentro de la tarjeta: mismo contenido y
 * mismas clases (.md-macros, .md-stats, .md-block, .md-chips, .md-micros), solo
 * cambia el contenedor.
 *
 * Reutiliza el shell .trial-modal* y el portal a <body> por el mismo motivo que
 * ModalOrdenar.jsx: .md-card se anima con `fadeInUp … both` y su transform
 * residual la convierte en containing block de los `position: fixed` hijos, así
 * que un overlay inline se centraría dentro de la tarjeta y no en el viewport.
 *
 * La lógica de "Ordenar ahora" (sesión y navegación) sigue en el padre; aquí
 * solo se dispara `onOrdenar`.
 */
const ModalPlato = ({ comida, onCerrar, onOrdenar }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  const macros = comida.macros || {};
  const barras = [
    {
      label: "Proteínas",
      valor: macros.proteinas,
      clase: "md-macro-fill--prote",
    },
    {
      label: "Carbohidratos",
      valor: macros.carbohidratos,
      clase: "md-macro-fill--carbo",
    },
    {
      label: "Grasas",
      valor: macros.grasas,
      clase: "md-macro-fill--grasa",
    },
  ];

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
            {comida.icono}
          </span>
          <span className="md-card-heading">
            <span className="md-card-tipo">{comida.tipo}</span>
            <span className="md-card-nombre">{comida.nombre}</span>
          </span>
        </div>

        <div className="plato-modal-pills">
          <span className="md-card-cal">
            <span className="md-cal-num">{comida.calorias}</span>
            <span className="md-cal-label">kcal</span>
          </span>
          {comida.Precio != null && (
            <span className="plato-modal-precio">${comida.Precio}</span>
          )}
        </div>

        <p className="plato-modal-desc">{comida.descripcion}</p>

        <div className="plato-modal-body">
          {/* Barras de progreso de macronutrientes */}
          <div className="md-macros">
            <h4 className="md-block-title">Macronutrientes</h4>
            {barras.map((b) => (
              <div className="md-macro" key={b.label}>
                <div className="md-macro-row">
                  <span className="md-macro-label">{b.label}</span>
                  <span className="md-macro-value">{b.valor} g</span>
                </div>
                <div className="md-macro-bar">
                  <span
                    className={`md-macro-fill ${b.clase}`}
                    style={{ width: `${porcentajeMacro(b.valor, macros)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Etiquetas numéricas */}
          <div className="md-stats">
            <div className="md-stat">
              <span className="md-stat-num">{comida.proteinas}g</span>
              <span className="md-stat-label">Proteínas</span>
            </div>
            <div className="md-stat">
              <span className="md-stat-num">{comida.carbohidratos}g</span>
              <span className="md-stat-label">Carbos</span>
            </div>
            <div className="md-stat">
              <span className="md-stat-num">{comida.grasas}g</span>
              <span className="md-stat-label">Grasas</span>
            </div>
            <div className="md-stat">
              <span className="md-stat-num">{comida.fibra}g</span>
              <span className="md-stat-label">Fibra</span>
            </div>
          </div>

          {/* Ingredientes */}
          <div className="md-block">
            <h4 className="md-block-title">🧾 Ingredientes</h4>
            <ul className="md-ingredientes">
              {comida.ingredientes.map((ing) => (
                <li className="md-ingrediente" key={ing}>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Vitaminas y minerales */}
          <div className="md-block">
            <h4 className="md-block-title">🍊 Vitaminas principales</h4>
            <div className="md-chips">
              {comida.vitaminas.map((v) => (
                <span className="md-chip md-chip--vit" key={v}>
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="md-block">
            <h4 className="md-block-title">⛏️ Minerales principales</h4>
            <div className="md-chips">
              {comida.minerales.map((m) => (
                <span className="md-chip md-chip--min" key={m}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Micronutrientes */}
          <div className="md-block">
            <h4 className="md-block-title">🔬 Micronutrientes</h4>
            <div className="md-micros">
              {Object.entries(comida.micros).map(([nombre, valor]) => (
                <div className="md-micro" key={nombre}>
                  <span className="md-micro-name">{nombre}</span>
                  <span className="md-micro-value">{valor} mg</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg btn-full"
            onClick={onOrdenar}
          >
            Ordenar ahora
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalPlato;
