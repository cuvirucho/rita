import { Link } from "react-router-dom";

const TOTAL_LAUNCH_SPOTS = 100;
const SPOTS_TAKEN = 71;
const SPOTS_LEFT = TOTAL_LAUNCH_SPOTS - SPOTS_TAKEN;

const planData = [
  {
    title: "Plan Starter",
    price: "$145",
    prcieconiva: "$173",
    originalPrice: "$346",
    period: "/ mes",
    launch: true,
    features: [
      "5 comidas diarias",
      "150 comidas al mes",
      "IA de nutrición personalizada",
      "Entrega a domicilio (2 ubicaciónes)",
      "Menú semanal personalizado",
      "Recogida disponible en local",
    ],
    style: "basic",
    btnStyle: "plan-btn plan-btn-launch",
  },
  {
    title: "Plan Premium",
    price: "$175",
    prcieconiva: "$208",
    originalPrice: "$416",
    period: "/ mes",
    popular: true,
    launch: true,
    features: [
      "Todo el Plan Básico incluido",
      "Guía de entrenamiento con IA gratis",
      "Entrega a 3 ubicaciones",
      "Club de beneficios exclusivos",
      "Soporte preferencial por WhatsApp",
      "Prioridad en entregas",
      "Regalo sorpresa mensual",
    ],
    style: "premium",
    btnStyle: "plan-btn plan-btn-primary",
  },
];

const Planos = ({ name }) => {
  const spotsPercent = (SPOTS_TAKEN / TOTAL_LAUNCH_SPOTS) * 100;

  return (
    <>
      {/* Launch Banner */}
      <div className="launch-banner">
        <div className="launch-banner-inner">
          <span className="launch-banner-icon">🚀</span>
          <div className="launch-banner-text">
            <strong>Acceso Anticipado — Precio de Lanzamiento</strong>
            <span>
              Seleciona el plan que mejor se adapte a ti y comienza tu
              transformación hoy mismo. ¡Los primeros 100 clientes obtienen un
              precio especial!
            </span>
          </div>
        </div>
      </div>

      <div className="plans-grid">
        {planData.map((plan, index) => (
          <div
            key={index}
            className={`plan-card ${plan.style} ${plan.launch ? "plan-card-launch" : ""}`}
          >
            {plan.launch && (
              <div className="plan-launch-ribbon">
                <span>🔥 PRECIO DE LANZAMIENTO</span>
              </div>
            )}
            {plan.popular && !plan.launch && (
              <div className="plan-popular-badge">⭐ Más Popular</div>
            )}
            <h2 className="plan-name">
              {plan.title} {name}
            </h2>

            {plan.launch ? (
              <div className="plan-price-launch">
                <span className="plan-price-original">
                  {plan.originalPrice}
                </span>
                <div className="plan-price-current">
                  {plan.prcieconiva}
                  <span>{plan.period}</span>
                </div>
                <div className="plan-price-save">
                  Ahorras{" "}
                  {`$${parseInt(plan.originalPrice.replace("$", "")) - parseInt(plan.price.replace("$", ""))}`}
                  /mes — 50% OFF
                </div>
              </div>
            ) : (
              <div className="plan-price">
                {plan.price}
                <span>{plan.period}</span>
              </div>
            )}

            <div className="plan-features">
              {plan.features.map((item, i) => (
                <div key={i} className="plan-feature">
                  <span className="plan-feature-check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link className={plan.btnStyle} to="/detales" state={{ plan }}>
              {plan.launch
                ? "🚀 Asegurar Mi Lugar crear mi cuenta"
                : `Elegir ${plan.title}`}
            </Link>

            {plan.launch && (
              <p className="plan-precompra-note">
                🔒 Precompra con acceso anticipado · Precio garantizado de por
                vida
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Planos;
