import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Footer from "../../HOME/Footer";

const DetallePlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!plan) {
    navigate("/");
    return null;
  }

  const beneficiosExtra = {
    basic: [
      {
        icon: "🍽️",
        titulo: "5 Comidas Diarias",
        desc: "Desayuno, almuerzo, cena y 2 snacks diseñados por nuestra IA de nutrición para mantener tu energía todo el día.",
      },
      {
        icon: "🤖",
        titulo: "IA de Nutrición Personalizada",
        desc: "Nuestra inteligencia artificial crea menús adaptados a tus objetivos, gustos y necesidades nutricionales.",
      },
      {
        icon: "🚚",
        titulo: "Entrega a Domicilio",
        desc: "Recibe tu comida fresca en una ubicación de tu preferencia sin costo adicional.",
      },
      {
        icon: "📋",
        titulo: "Menú Personalizado Semanal",
        desc: "Cada semana un nuevo menú pensado para ti, con variedad y balance nutricional garantizado.",
      },
      {
        icon: "🏪",
        titulo: "Recogida en Local",
        desc: "Si prefieres, recoge tus comidas directamente en nuestro local sin esperas.",
      },
      {
        icon: "📊",
        titulo: "150 Comidas al Mes",
        desc: "Cubre toda tu alimentación mensual. Sin preocuparte por cocinar ni planificar.",
      },
      {
        icon: "👨‍🍳",
        titulo: "Preparado por Chefs Profesionales",
        desc: "Cada plato es elaborado por chefs con experiencia en alta cocina y nutrición, usando ingredientes frescos y técnicas profesionales.",
      },
    ],
    premium: [
      {
        icon: "⭐",
        titulo: "Todo del Plan Básico",
        desc: "Incluye todas las ventajas del plan básico: 5 comidas diarias, IA de nutrición, menú personalizado y más.",
      },
      {
        icon: "💪",
        titulo: "Guía de Entrenamiento Gratis",
        desc: "Accede a rutinas de ejercicio personalizadas por nuestra IA para complementar tu alimentación y alcanzar tus metas más rápido.",
      },
      {
        icon: "🚚",
        titulo: "Entrega en 2 Ubicaciones",
        desc: "Recibe tu comida en casa y en la oficina, o en dos direcciones distintas según tu rutina diaria.",
      },
      {
        icon: "🎁",
        titulo: "Club de Beneficios",
        desc: "Acceso exclusivo a descuentos, promociones especiales y contenido premium de bienestar y nutrición.",
      },
      {
        icon: "🏆",
        titulo: "Prioridad en Entregas",
        desc: "Tus pedidos tienen prioridad en la preparación y entrega para que siempre lleguen a tiempo.",
      },
      {
        icon: "📱",
        titulo: "Soporte Preferencial",
        desc: "Atención prioritaria por WhatsApp para resolver cualquier duda o ajuste en tu plan.",
      },
      {
        icon: "👨‍🍳",
        titulo: "Chefs Gourmet Dedicados",
        desc: "Tu comida es creada por chefs profesionales especializados en cocina saludable gourmet. Calidad de restaurante, en tu mesa cada día.",
      },
    ],
  };

  const beneficios = beneficiosExtra[plan.style] || beneficiosExtra.basic;

  const testimonios = {
    basic: {
      nombre: "María G.",
      texto:
        "Desde que empecé con Rita Fit, mi alimentación cambió por completo. Ya no pierdo tiempo cocinando y me siento con más energía.",
    },
    premium: {
      nombre: "Carlos R.",
      texto:
        "El plan Premium es increíble. La guía de entrenamiento junto con la comida personalizada me ayudó a bajar 8kg en 2 meses.",
    },
  };

  const testimonio = testimonios[plan.style] || testimonios.basic;

  return (
    <>
      <div className="detalle-plan-page">
        {/* Header con navegación */}
        <div className="detalle-header">
          <button className="detalle-back-btn" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <img
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1743140857/gifs_para_apps_gpxkfq.png"
            alt="Rita Fit"
            className="detalle-logo"
          />
        </div>

        {/* Hero del plan */}
        <section
          className={`detalle-hero ${plan.style === "premium" ? "detalle-hero-premium" : "detalle-hero-basic"}`}
        >
          <div className="detalle-hero-content">
            {plan.launch && (
              <span className="detalle-badge detalle-badge-launch">
                🚀 ACCESO ANTICIPADO — PRECIO DE LANZAMIENTO
              </span>
            )}
            {plan.style === "premium" && !plan.launch && (
              <span className="detalle-badge">⭐ Más Popular</span>
            )}
            <h1 className="detalle-plan-title">{plan.title}</h1>
            <p className="detalle-plan-subtitle">
              {plan.launch
                ? "Estás accediendo al precio exclusivo de lanzamiento. Solo disponible para los primeros 100 miembros."
                : plan.style === "premium"
                  ? "La experiencia completa para transformar tu vida"
                  : "Todo lo que necesitas para empezar tu vida saludable"}
            </p>
            <div className="detalle-precio-container">
              {plan.launch && plan.originalPrice && (
                <span className="detalle-precio-original">
                  {plan.originalPrice}/mes
                </span>
              )}
              <span className="detalle-precio">{plan.prcieconiva}</span>
              {plan.launch && (
                <span className="detalle-precio-ahorro">50% OFF</span>
              )}
            </div>
            <Link
              className="detalle-cta-btn2"
              to="/Formulariopagos"
              state={{ plan }}
            >
              {`Continuar el pago  ${plan.title}`}
            </Link>

            {plan.launch && (
              <p className="detalle-hero-urgency">
                ⚡ Al completar los 100 lugares, el precio sube a{" "}
                {plan.originalPrice}/mes
              </p>
            )}
          </div>
        </section>

        {/* Lo que incluye */}
        <section className="detalle-incluye">
          <span className="detalle-incluye-badge">
            {plan.style === "premium" ? "⭐ MÁXIMO VALOR" : "🎯 TODO INCLUIDO"}
          </span>
          <h2 className="detalle-seccion-titulo">¿Qué incluye tu plan?</h2>
          <p className="detalle-incluye-subtitulo">
            Cada beneficio está diseñado para que{" "}
            <strong>
              ahorres tiempo, comas mejor y logres resultados reales
            </strong>{" "}
            sin esfuerzo.
          </p>

          <ul className="detalle-features-list">
            {plan.features.map((feature, i) => (
              <li key={i} className="detalle-feature-item">
                <span className="detalle-feature-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="detalle-check">✓</span>
                <span className="detalle-feature-text">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="detalle-incluye-callout">
            <span className="detalle-incluye-callout-icon">💡</span>
            <p>
              <strong>¿Sabías que?</strong> Nuestros miembros ahorran en
              promedio <strong>$200+ al mes</strong> en comida y{" "}
              <strong>15+ horas</strong> en preparación. Tu suscripción se paga
              sola.
            </p>
          </div>
        </section>

        {/* Beneficios detallados */}
        <section className="detalle-beneficios">
          <div className="detalle-beneficios-header">
            <span className="detalle-beneficios-badge">
              ✨ BENEFICIOS EXCLUSIVOS
            </span>
            <h2 className="detalle-seccion-titulo">
              Beneficios únicos que transforman tu vida
            </h2>
            <p className="detalle-beneficios-subtitulo">
              No encontrarás esto en ningún otro lugar. Cada beneficio está
              pensado para que logres <strong>resultados reales</strong> sin
              sacrificar sabor ni tu tiempo.
            </p>
          </div>

          <div className="detalle-beneficios-grid">
            {beneficios
              .filter((b) => b.icon !== "👨‍🍳")
              .map((b, i) => (
                <div key={i} className="detalle-beneficio-card">
                  <span className="detalle-beneficio-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="detalle-beneficio-icon-wrapper">
                    <span className="detalle-beneficio-icon">{b.icon}</span>
                  </div>
                  <h3 className="detalle-beneficio-titulo">{b.titulo}</h3>
                  <p className="detalle-beneficio-desc">{b.desc}</p>
                </div>
              ))}
          </div>

          {/* Chef highlight card */}
          <div className="detalle-chef-highlight">
            <div className="detalle-chef-highlight-inner">
              <div className="detalle-chef-highlight-icon">👨‍🍳</div>
              <div className="detalle-chef-highlight-content">
                <span className="detalle-chef-tag">⭐ CALIDAD PREMIUM</span>
                <h3>
                  {plan.style === "premium"
                    ? "Chefs Gourmet Dedicados"
                    : "Preparado por Chefs Profesionales"}
                </h3>
                <p>
                  {plan.style === "premium"
                    ? "Tu comida es creada por chefs profesionales especializados en cocina saludable gourmet. Calidad de restaurante, en tu mesa cada día."
                    : "Cada plato es elaborado por chefs con experiencia en alta cocina y nutrición, usando ingredientes frescos y técnicas profesionales."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonio */}
        <section className="detalle-testimonio">
          <div className="detalle-testimonio-card">
            <p className="detalle-testimonio-texto">"{testimonio.texto}"</p>
            <p className="detalle-testimonio-autor">— {testimonio.nombre}</p>
          </div>
        </section>

        {/* Por qué Rita Fit */}
        <section className="detalle-porque">
          <span className="detalle-porque-badge">
            🏆 LA DIFERENCIA RITA FIT
          </span>
          <h2 className="detalle-seccion-titulo">
            ¿Por qué muchos ya eligieron Rita Fit?
          </h2>
          <p className="detalle-porque-subtitulo">
            No es solo comida, es un{" "}
            <strong>estilo de vida que funciona</strong>. Esto es lo que nos
            hace únicos:
          </p>
          <div className="detalle-porque-items">
            <div className="detalle-porque-item">
              <span className="detalle-porque-num">01</span>
              <h3>🕐 Recupera Tu Tiempo</h3>
              <p>
                Ahorra <strong>+15 horas al mes</strong> en planificación,
                compras y cocina. Nosotros nos encargamos de todo para que tú
                vivas más y cocines menos.
              </p>
            </div>
            <div className="detalle-porque-item">
              <span className="detalle-porque-num">02</span>
              <h3>🧠 Nutrición con Inteligencia Artificial</h3>
              <p>
                Nuestra IA analiza tu cuerpo, tus metas y tus gustos para crear
                un menú <strong>100% personalizado</strong> que evoluciona
                contigo cada semana.
              </p>
            </div>
            <div className="detalle-porque-item">
              <span className="detalle-porque-num">03</span>
              <h3>👨‍🍳 Chefs Profesionales en Tu Cocina</h3>
              <p>
                Cada plato es elaborado por{" "}
                <strong>chefs con experiencia en alta cocina</strong>, usando
                ingredientes frescos y técnicas profesionales. Calidad de
                restaurante, en tu mesa cada día.
              </p>
            </div>
            <div className="detalle-porque-item">
              <span className="detalle-porque-num">04</span>
              <h3>📈 Resultados Que Se Ven</h3>
              <p>
                Miles de usuarios ya transformaron su alimentación y alcanzaron
                sus metas. <strong>El 93% reporta mejoras visibles</strong> en
                las primeras 4 semanas.
              </p>
            </div>
          </div>
          <div className="detalle-porque-cta-hint">
            <p>
              👇 <strong>Únete hoy</strong> y descubre por qué cada día más
              personas confían en Rita Fit para comer mejor sin esfuerzo.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section className="detalle-cta">
          {plan.launch && (
            <div className="detalle-cta-precompra">
              <span className="detalle-cta-precompra-icon">🎟️</span>
              <p>
                <strong>Precompra — Acceso Anticipado</strong>
              </p>
              <p>
                Estás obteniendo un precio reducido por ser de los primeros en
                unirte. Este precio queda garantizado de por vida en tu cuenta.
              </p>
            </div>
          )}
          <h2 className="detalle-cta-titulo">
            {plan.launch
              ? "¿Listo para asegurar tu lugar?"
              : "¿Listo para transformar tu alimentación?"}
          </h2>
          <p className="detalle-cta-desc">
            {plan.launch
              ? "Únete ahora al precio de lanzamiento antes de que se agoten los lugares disponibles."
              : "Únete hoy y comienza a disfrutar de comida saludable, deliciosa y personalizada."}
          </p>
          <Link
            className="detalle-cta-btn"
            to="/Formulariopagos"
            state={{ plan }}
          >
            {`Suscribirme al ${plan.title}`}
          </Link>
          <p className="detalle-cta-garantia">
            🔒{" "}
            {plan.launch
              ? "Precio garantizado de por vida · Cancela cuando quieras"
              : "Cancela cuando quieras · Sin compromisos"}
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default DetallePlan;
