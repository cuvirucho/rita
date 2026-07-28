import { Link } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";
import Planos, { planData } from "../../Menu/Plano/Planos.jsx";

// Normaliza cualquier fecha (Firestore Timestamp | Date | string ISO) a Date | null
const toDate = (valor) => {
  try {
    if (!valor) return null;
    if (typeof valor?.toDate === "function") return valor.toDate();
    const d = valor instanceof Date ? valor : new Date(valor);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const formatFecha = (valor) => {
  const fecha = toDate(valor);
  if (!fecha) return "—";
  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Calcula el tiempo restante hasta la fecha de vencimiento
const tiempoRestante = (venc) => {
  const fin = toDate(venc);
  if (!fin) return "—";
  const ms = fin.getTime() - Date.now();
  if (ms <= 0) return "Vencido";
  const dias = Math.floor(ms / 86400000);
  if (dias >= 1) return `${dias} día${dias === 1 ? "" : "s"}`;
  const horas = Math.ceil(ms / 3600000);
  return `${horas} hora${horas === 1 ? "" : "s"}`;
};

// Busca la definición del plan (beneficios, precios) a partir del valor guardado
const encontrarPlan = (plan) => {
  const clave = String(plan).toLowerCase();
  return (
    planData.find(
      (p) =>
        p.style.toLowerCase() === clave ||
        p.title.toLowerCase().includes(clave),
    ) || null
  );
};

const MiPlan = () => {
  const { perfil } = useAuth();
  const plan = perfil?.plan || "free";

  // --- Caso free: invitar a suscribirse ---
  if (plan === "free") {
    return (
      <div className="usuario-plan-bloque" id="planes">
        <div className="usuario-seccion-head">
          <span className="usuario-seccion-badge">✨ Suscripción</span>
          <h3 className="usuario-seccion-title">Elige tu plan</h3>
          <p className="usuario-seccion-sub">
            Aún no tienes una suscripción activa. Suscríbete y desbloquea todos
            los beneficios de Rita Fit.
          </p>
        </div>
        <Planos ctaLabel="Suscribirse" />
      </div>
    );
  }

  // --- Caso plan de pago: mostrar tarjeta de plan activo ---
  const definicion = encontrarPlan(plan);
  const nombrePlan = definicion?.title || plan;
  const beneficios = definicion?.features || [];

  const fechaInicio = perfil?.fechaInicio ?? perfil?.activatedAt;
  const fechaVencimiento = perfil?.fechaVencimiento;

  const detalles = [
    { icono: "🗓️", label: "Fecha de inicio", valor: formatFecha(fechaInicio) },
    {
      icono: "📅",
      label: "Fecha de vencimiento",
      valor: formatFecha(fechaVencimiento),
    },
    {
      icono: "⏳",
      label: "Tiempo restante",
      valor: tiempoRestante(fechaVencimiento),
    },
  ];

  // Payload para reutilizar el flujo de pago existente (renovación)
  const payloadRenovar = definicion
    ? {
        title: definicion.title,
        price: definicion.pricing.mensual.price,
        prcieconiva: definicion.pricing.mensual.prcieconiva,
        period: definicion.pricing.mensual.period,
        features: definicion.features,
        style: definicion.style,
        popular: definicion.popular,
        modalidad: "mensual",
      }
    : null;

  return (
    <div className="usuario-plan-bloque" id="planes">
      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">💳 Mi suscripción</span>
        <h3 className="usuario-seccion-title">Plan activo</h3>
        <p className="usuario-seccion-sub">
          Ya cuentas con una suscripción activa. Aquí están los detalles de tu
          plan.
        </p>
      </div>

      <div className="usuario-plan-activo">
        <div className="usuario-perfil-hero">
          <div className="usuario-perfil-hero-info">
            <h3 className="usuario-perfil-nombre">{nombrePlan}</h3>
            <span className="usuario-plan-estado">● Activo</span>
          </div>
        </div>

        <div className="usuario-perfil-grid">
          {detalles.map((d) => (
            <div className="usuario-perfil-card" key={d.label}>
              <span className="usuario-perfil-card-icon">{d.icono}</span>
              <div className="usuario-perfil-card-body">
                <span className="usuario-perfil-card-label">{d.label}</span>
                <span className="usuario-perfil-card-value">{d.valor}</span>
              </div>
            </div>
          ))}
        </div>

        {beneficios.length > 0 && (
          <div className="usuario-plan-benefits">
            <span className="usuario-perfil-card-label">
              Beneficios incluidos
            </span>
            <div className="plan-features">
              {beneficios.map((item, i) => (
                <div key={i} className="plan-feature">
                  <span className="plan-feature-check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {payloadRenovar && (
          <Link
            className="plan-btn plan-btn-primary usuario-plan-cta"
            to="/detales"
            state={{ plan: payloadRenovar }}
          >
            Renovar plan
          </Link>
        )}
      </div>
    </div>
  );
};

export default MiPlan;
