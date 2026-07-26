import { useState } from "react";
import { useNavigate } from "react-router-dom";
import menuDiario from "./menuDiario";

const OBJETIVOS = [
  { key: "ganar_musculo", label: "Ganar masa muscular", icono: "💪" },
  { key: "bajar_peso", label: "Bajar de peso", icono: "🔥" },
];

// Porcentaje de cada macro respecto al total de gramos de la comida (para las barras).
function porcentajeMacro(valor, macros) {
  const total =
    (macros.proteinas || 0) +
    (macros.carbohidratos || 0) +
    (macros.grasas || 0);
  if (!total) return 0;
  return Math.round((valor / total) * 100);
}

function MenuDiario() {
  const navigate = useNavigate();
  const [objetivo, setObjetivo] = useState("ganar_musculo");
  // Índices de las tarjetas abiertas (acordeones independientes, cerradas por defecto).
  const [abiertas, setAbiertas] = useState(() => new Set());
  const comidas = menuDiario[objetivo] || [];

  const cambiarObjetivo = (key) => {
    setObjetivo(key);
    setAbiertas(new Set()); // al cambiar de objetivo, todas cerradas
  };

  const toggleCard = (i) => {
    setAbiertas((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  return (
    <div className="container">
      {/* Encabezado */}
      <div className="section-header">
        <span className="section-badge2">🍽️ Menú Diario</span>
        <h2 className="section-title">Ordena el menu de hoy </h2>
        <p className="section-subtitle">
          Disfruta de nuestro menú del día con delivery gratis. Pide uno o todos
          los platos y descubre nuevos sabores, porque cada día preparamos
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
        {comidas.map((comida, i) => {
          const macros = comida.macros || {};
          const abierta = abiertas.has(i);
          const bodyId = `md-body-${objetivo}-${i}`;
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

          return (
            <article
              className={`md-card ${abierta ? "is-open" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
              key={`${objetivo}-${comida.tipo}`}
            >
              {/* Resumen clicable (siempre visible) — abre/cierra el acordeón */}
              <button
                type="button"
                className="md-card-summary"
                onClick={() => toggleCard(i)}
                aria-expanded={abierta}
                aria-controls={bodyId}
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
                    ⌄
                  </span>
                </span>
                <span className="md-card-desc">{comida.descripcion}</span>
              </button>

              {/* Cuerpo colapsable (solo visible al abrir) */}
              <div className="md-card-body" id={bodyId}>
                <div className="md-card-body-inner">
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
                            style={{
                              width: `${porcentajeMacro(b.valor, macros)}%`,
                            }}
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
                      <span className="md-stat-num">
                        {comida.carbohidratos}g
                      </span>
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
                    onClick={() =>
                      navigate("/orden-diaria", {
                        state: { objetivo, tipo: comida.tipo },
                      })
                    }
                  >
                    Ordenar ahora
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default MenuDiario;
