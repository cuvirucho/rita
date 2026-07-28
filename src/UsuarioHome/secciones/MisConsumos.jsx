const NUTRIENTES = [
  { icono: "🔥", label: "Calorías", color: "cal" },
  { icono: "🥩", label: "Proteínas", color: "prote" },
  { icono: "🍞", label: "Carbohidratos", color: "carbo" },
  { icono: "🥑", label: "Grasas", color: "grasa" },
  { icono: "🍊", label: "Vitaminas", color: "vit" },
  { icono: "⛏️", label: "Minerales", color: "min" },
  { icono: "⚖️", label: "Macronutrientes", color: "macro" },
  { icono: "🔬", label: "Micronutrientes", color: "micro" },
];

const MisConsumos = () => {
  return (
    <div className="usuario-seccion">
      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">📊 Estadísticas</span>
        <h2 className="usuario-seccion-title">Mis Consumos</h2>
        <p className="usuario-seccion-sub">
          Aquí verás el análisis nutricional detallado de tu alimentación.
        </p>
      </div>

      <div className="usuario-stats-grid">
        {NUTRIENTES.map((n) => (
          <article
            key={n.label}
            className={`usuario-stat-card usuario-stat-card--${n.color}`}
          >
            <span className="usuario-stat-icon">{n.icono}</span>
            <span className="usuario-stat-label">{n.label}</span>
            <span className="usuario-stat-value">—</span>
            <span className="usuario-stat-soon">Próximamente</span>
          </article>
        ))}
      </div>

      <p className="usuario-stats-note">
        Próximamente podrás consultar aquí el análisis completo de tu
        alimentación.
      </p>
    </div>
  );
};

export default MisConsumos;
