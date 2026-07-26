import { useState } from "react";
import { Link } from "react-router-dom";

const planData = [
  {
    title: "Plan Starter",
    style: "basic",
    features: [
      "3 comidas diarias",
      "60 comidas al mes",
      "IA de nutrición personalizada",
      "Entrega a domicilio (2 ubicaciónes)",
      "Menú semanal personalizado",
      "5 cupones sorpresa al mes",
      "Recogida disponible en nuestro local",
    ],
    pricing: {
      semanal: { price: "$55", prcieconiva: "$65", period: "/ semana" },
      mensual: { price: "$185", prcieconiva: "$220", period: "/ mes" },
    },
  },
  {
    title: "Plan Premium",
    style: "premium",
    popular: true,
    features: [
      "5 comidas diarias",
      "100 comidas al mes",
      "Guía de entrenamiento con un entredor personal",
      "Entrega a domicilio (3 ubicaciónes)",
      "Club de beneficios exclusivos",
      "Soporte preferencial por WhatsApp",
      "Prioridad en entregas",
      "Recogida disponible en nuestro local",
      "20 cupones sorpresa al mes",
      "Regalo sorpresa mensual",
    ],
    pricing: {
      semanal: { price: "$59", prcieconiva: "$70", period: "/ semana" },
      mensual: { price: "$207", prcieconiva: "$245", period: "/ mes" },
    },
  },
];

// Convierte "$208" -> 208 (número) de forma segura
const toNumber = (value) =>
  parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

// Calcula el ahorro del plan mensual frente a 4 semanas del plan semanal
const getMonthlySaving = (pricing) => {
  const weekly = toNumber(pricing.semanal.prcieconiva);
  const monthly = toNumber(pricing.mensual.prcieconiva);
  const fourWeeks = weekly * 4;
  const amount = fourWeeks - monthly;
  if (amount <= 0) return null;
  const percent = Math.round((amount / fourWeeks) * 100);
  return { amount, percent };
};

const Planos = () => {
  const [modalidad, setModalidad] = useState("semanal");

  // Mejor % de ahorro entre todos los planes, para el micro-badge del selector
  const bestSavingPercent = Math.max(
    ...planData.map((p) => getMonthlySaving(p.pricing)?.percent || 0),
  );

  return (
    <>
      {/* Selector de modalidad Semanal / Mensual */}
      <div
        className="plan-toggle"
        role="tablist"
        aria-label="Modalidad de suscripción"
      >
        <button
          type="button"
          role="tab"
          aria-selected={modalidad === "semanal"}
          className={`plan-toggle-btn ${modalidad === "semanal" ? "active" : ""}`}
          onClick={() => setModalidad("semanal")}
        >
          Semanal
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modalidad === "mensual"}
          className={`plan-toggle-btn ${modalidad === "mensual" ? "active" : ""}`}
          onClick={() => setModalidad("mensual")}
        >
          Mensual
          {bestSavingPercent > 0 && (
            <span className="plan-toggle-tag">
              Ahorra hasta {bestSavingPercent}%
            </span>
          )}
        </button>
      </div>

      <div className="plans-grid">
        {planData.map((plan, index) => {
          const p = plan.pricing[modalidad];
          const saving = getMonthlySaving(plan.pricing);

          // Objeto que viaja por router state hacia el detalle y el pago.
          // Mantiene el shape esperado por DetallePlan / Formulariopagos:
          // `title` (nombre de la orden) y `price` (base -> precioVenta).
          const planPayload = {
            title: plan.title,
            price: p.price,
            prcieconiva: p.prcieconiva,
            period: p.period,
            features: plan.features,
            style: plan.style,
            popular: plan.popular,
            modalidad,
          };

          const isPopular = !!plan.popular;

          return (
            <div
              key={index}
              className={`plan-card ${plan.style} ${isPopular ? "plan-card-featured" : ""}`}
            >
              {isPopular && (
                <div className="plan-popular-badge">⭐ Más popular</div>
              )}

              <h2 className="plan-name">{plan.title}</h2>

              <div className="plan-price">
                <span className="plan-price-amount">{p.prcieconiva}</span>
                <span className="plan-price-period">{p.period}</span>
              </div>

              {modalidad === "mensual" && saving && (
                <div className="plan-price-save">
                  💰 Ahorra ${saving.amount}/mes — {saving.percent}% menos que
                  semanal
                </div>
              )}
              {modalidad === "semanal" && saving && (
                <div className="plan-price-hint">
                  Cámbiate a mensual y ahorra hasta {saving.percent}%
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

              <Link
                className={`plan-btn ${isPopular ? "plan-btn-primary" : "plan-btn-outline"}`}
                to="/detales"
                state={{ plan: planPayload }}
              >
                Elegir {plan.title}
              </Link>

              <p className="plan-card-note">
                🔒 Pago seguro · Cancela cuando quieras
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Planos;
