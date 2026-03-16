import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Formulariopagos = ({ preferciausaro }) => {
  const location = useLocation();
  const { plan } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://us-central1-rita-ede4f.cloudfunctions.net/api/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            form: {},
            cart: {
              nombre: plan.title,
              precioVenta: parseFloat(plan.price.replace(/[^0-9.]/g, "")),
              cantidad: 1,
            },
          }),
        },
      );

      const data = await response.json();

      const openPayphone = () => {
        new window.PPaymentButtonBox({
          token: data.token,
          clientTransactionId: data.clientTransactionId,
          amount: data.amount,
          amountWithoutTax: 0,
          amountWithTax: data.amountWithoutTax,
          tax: data.tax,
          service: data.service,
          currency: "USD",
          reference: data.reference,
          storeId: data.storeId,
        }).render("pp-button");
      };

      if (!window.PPaymentButtonBox) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";

        script.onload = openPayphone;

        document.body.appendChild(script);
      } else {
        openPayphone();
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar el pago");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (plan) {
      handleSubmit({ preventDefault: () => {} });
    }
  }, [plan]);

  const price = plan?.price || "$0";
  const originalPrice = plan?.originalPrice || "";
  const title = plan?.title || "Plan";
  const savings = originalPrice
    ? `$${parseInt(originalPrice.replace("$", "")) - parseInt(price.replace("$", ""))}`
    : null;

  return (
    <div className={`pay-page ${visible ? "pay-page--visible" : ""}`}>
      {/* Banner de preventa */}
      <div className="pay-preventa-banner">
        <span className="pay-preventa-icon">🔥</span>
        <div className="pay-preventa-text">
          <strong>¡Estás comprando en PREVENTA!</strong>
          <span>Precio exclusivo por tiempo limitado — No te lo pierdas</span>
        </div>
      </div>

      <div className="pay-layout">
        {/* Resumen del plan */}
        <div className="pay-summary-card">
          <div className="pay-badge-row">
            <span className="pay-badge-preventa">🚀 PREVENTA</span>
            {savings && <span className="pay-badge-off">50% OFF</span>}
          </div>

          <h2 className="pay-plan-name">{title}</h2>

          <div className="pay-guarantee">
            <span>🛡️</span>
            <p>
              Precio garantizado de por vida. Tu tarifa no subirá aunque
              aumentemos los precios después del lanzamiento.
            </p>
          </div>
        </div>

        {/* Columna derecha: acción de pago */}
        <div className="pay-action-card">
          <div className="pay-action-header">
            <span className="pay-action-lock">🔒</span>
            <h3>Completa tu compra</h3>
          </div>

          <div className="pay-order-line">
            <span>{title}</span>
            <span className="pay-order-price">
              {plan?.originalPrice || price}
            </span>
          </div>
          {originalPrice && (
            <div className="pay-order-line pay-order-discount">
              <span>Descuento preventa</span>
              <span className="pay-order-savings">-{savings}</span>
            </div>
          )}
          <div className="pay-order-divider" />
          <div className="pay-order-line pay-order-total">
            <span>Total hoy</span>
            <span>{plan?.prcieconiva || price}</span>
          </div>

          <div id="pp-button" className="pay-pp-slot"></div>

          <div className="pay-trust-icons">
            <span>🔐 Pago 100% seguro</span>
            <span>⚡ Activación inmediata</span>
            <span>✅ Garantía total</span>
          </div>

          {/* Bloque app */}
          <div className="pay-app-promo">
            <div className="pay-app-icon">📱</div>
            <div className="pay-app-info">
              <strong>¡Lleva a Rita a todo lado!</strong>
              <p>
                Pronto podrás descargar nuestra app y tener tu menú
                personalizado, seguimiento nutricional y pedidos desde tu
                celular.
              </p>
            </div>
          </div>

          <p className="pay-urgency">
            🔥 Quedan pocos lugares a este precio. ¡Asegura el tuyo hoy!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Formulariopagos;
