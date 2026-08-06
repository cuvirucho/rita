import Planos from "../Menu/Plano/Planos.jsx";

const VENTAJAS = [
  "🔬 28 nutrientes analizados en cada comida",
  "🎯 Objetivos diarios calculados para ti",
  "✅ Marca lo que comes y mira tu progreso",
  "📈 Estadísticas, racha y resumen semanal",
  "📱 Sincronizado en todos tus dispositivos",
];

/**
 * Nutrición para el plan Free.
 *
 * El corte lo hace el orquestador ANTES de montar ningún hook de datos, así que
 * aquí no llega ni el menú ni una sola cifra: el bloqueo está en la capa de
 * datos y no solo en lo que se ve.
 *
 * Los planes se montan en esta misma pantalla, como en Delivery: llevar al
 * usuario a otra pestaña le hace perder de vista lo que estaba intentando
 * desbloquear, y `Planos` ya contiene el flujo real de compra
 * (Link a /detales → /Formulariopagos).
 */
const NutricionBloqueada = () => {
  return (
    <div className="usuario-seccion">
      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">🥗 Nutrición</span>
        <h2 className="usuario-seccion-title">Seguimiento nutricional</h2>
        <p className="usuario-seccion-sub">
          Controla cada nutriente de tu plan, comida a comida.
        </p>
      </div>

      <div className="nutri-lock">
        {/* Panel insinuado, 100 % CSS y SVG estático: da idea de lo que hay
            detrás sin calcular ni pedir un solo dato. */}
        <div className="nutri-lock-preview" aria-hidden="true">
          <div className="nutri-lock-anillos">
            {[72, 48, 90].map((pct, i) => (
              <svg key={i} className="nutri-lock-anillo" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - pct / 100)}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            ))}
          </div>
          <div className="nutri-lock-barras">
            {[82, 61, 94, 45, 70].map((pct, i) => (
              <span key={i} className="nutri-lock-barra">
                <span style={{ width: `${pct}%` }} />
              </span>
            ))}
          </div>
        </div>

        <div className="nutri-lock-overlay">
          <span className="nutri-lock-glow" aria-hidden="true" />
          <span className="nutri-lock-candado">🔒</span>
          <span className="nutri-lock-badge">Exclusivo Starter y Premium</span>
          <h3 className="nutri-lock-titulo">
            Desbloquea el análisis nutricional avanzado
          </h3>
          <p className="nutri-lock-texto">
            Actualiza tu plan para acceder al seguimiento completo de nutrientes,
            control de comidas, estadísticas semanales, vitaminas, minerales,
            progreso nutricional y muchas más funciones exclusivas.
          </p>
          <ul className="nutri-lock-perks">
            {VENTAJAS.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          {/* Botón y no <a href="#...">: la app usa HashRouter y un ancla
              rompería la ruta. */}
          <button
            type="button"
            className="nutri-lock-cta"
            onClick={() =>
              document
                .getElementById("nutricion-planes")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            ✨ Actualizar mi plan
          </button>
        </div>
      </div>

      <div className="nutri-planes" id="nutricion-planes">
        <div className="usuario-seccion-head">
          <span className="usuario-seccion-badge">✨ Planes</span>
          <h3 className="usuario-seccion-title">Elige tu plan</h3>
          <p className="usuario-seccion-sub">
            Suscríbete y empieza a medir tu alimentación hoy mismo.
          </p>
        </div>
        <Planos ctaLabel="Suscribirse" />
      </div>
    </div>
  );
};

export default NutricionBloqueada;
