import Planos from "../Menu/Plano/Planos";

const RITA_AVATAR =
  "https://res.cloudinary.com/db8e98ggo/image/upload/v1773700632/logoderita_1_o7wzjd.png";

// Conversación de mentira para el panel insinuado: texto fijo, cero peticiones.
const MUESTRA = [
  { from: "rita", text: "¡Hola! Soy Rita 👋 ¿Cuál es tu objetivo esta semana?" },
  { from: "user", text: "Quiero bajar de peso sin pasar hambre." },
  {
    from: "rita",
    text: "Perfecto. ¿Hay algún alimento que prefieras evitar?",
  },
];

const VENTAJAS = [
  "🤖 Menú semanal diseñado por Rita",
  "🍽️ Hasta 5 comidas al día",
  "🔄 Cambia cualquier plato cuando quieras",
  "🛵 Entrega a domicilio incluida",
  "📊 Seguimiento nutricional completo",
];

/**
 * "Plan de Comidas" para el plan Free.
 *
 * El chat de Rita es exclusivo de Starter y Premium. El corte lo hace
 * MisSemanales ANTES de montar ningún hook de datos, así que aquí no llega ni
 * el menú guardado: el bloqueo está en la capa de datos y no solo en lo que se
 * ve.
 *
 * Se ofrecen dos salidas: suscribirse (los planes se montan en esta misma
 * pantalla, como en Nutrición y Delivery, porque `Planos` ya contiene el flujo
 * real de compra) o pedir el menú del día, que sí está abierto a todos.
 */
const RitaBloqueado = ({ onMenuDiario }) => {
  return (
    <div className="usuario-seccion">
      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">📅 Planificación</span>
        <h2 className="usuario-seccion-title">Mis Menús Semanales</h2>
        <p className="usuario-seccion-sub">
          Organiza tu alimentación de toda la semana en un solo lugar.
        </p>
      </div>

      <div className="rita-lock">
        {/* Panel insinuado: las mismas clases del chat real, con texto fijo.
            Da idea de lo que hay detrás sin llamar a la IA ni a Firestore. */}
        <div className="rita-lock-preview" aria-hidden="true">
          {MUESTRA.map((b, i) => (
            <div key={i} className={`rita-bubble-row rita-bubble-row--${b.from}`}>
              {b.from === "rita" && (
                <img src={RITA_AVATAR} alt="" className="rita-bubble-avatar" />
              )}
              <div className={`rita-bubble rita-bubble--${b.from}`}>
                {b.text}
              </div>
            </div>
          ))}
        </div>

        <div className="rita-lock-overlay">
          <span className="rita-lock-glow" aria-hidden="true" />
          <span className="rita-lock-candado">🔒</span>
          <span className="rita-lock-badge">Exclusivo Starter y Premium</span>
          <h3 className="rita-lock-titulo">
            El chat con Rita es para los planes Starter y Premium
          </h3>
          <p className="rita-lock-texto">
            Actualiza tu plan y Rita conversará contigo para diseñar tu menú
            semanal a medida: tus objetivos, tus gustos y tus horarios. Mientras
            tanto, puedes pedir el menú del día sin suscribirte.
          </p>
          <ul className="rita-lock-perks">
            {VENTAJAS.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>

          {/* Botones y no <a href="#...">: la app usa HashRouter y un ancla
              rompería la ruta. */}
          <div className="rita-lock-acciones">
            <button
              type="button"
              className="rita-lock-cta"
              onClick={() =>
                document
                  .getElementById("semanales-planes")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              ✨ Actualizar mi plan
            </button>

            {/* Solo si el contenedor sabe llevar a esa sección: así el
                componente sigue siendo montable desde otro sitio. */}
            {onMenuDiario && (
              <button
                type="button"
                className="rita-lock-cta rita-lock-cta--menu"
                onClick={onMenuDiario}
              >
                🍽️ Pedir el menú del día
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rita-planes" id="semanales-planes">
        <div className="usuario-seccion-head">
          <span className="usuario-seccion-badge">✨ Planes</span>
          <h3 className="usuario-seccion-title">Elige tu plan</h3>
          <p className="usuario-seccion-sub">
            Suscríbete y deja que Rita cocine tu semana entera.
          </p>
        </div>
        <Planos ctaLabel="Suscribirse" />
      </div>
    </div>
  );
};

export default RitaBloqueado;
