import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Videocatgoriashome from "./Videocatgoriashome";
import Reviews from "./Reseñas/Reviews";
import Planos from "../Menu/Plano/Planos";
import Footer from "./Footer";

const benefits = [
  {
    type: "image",
    src: "https://res.cloudinary.com/db8e98ggo/image/upload/q_auto,w_200/v1736136676/PROSESANDO_17_kdybz5.gif",
    title: "Control Total",
    desc: "Crea tu menú personalizado con tus gustos y deja que nuestra IA optimice cada comida para ti.",
    detail:
      "Nuestra IA analiza tus preferencias, alergias y metas para diseñar cada platillo. Tú decides qué comer, nosotros lo hacemos perfecto.",
    cta: "🔥 Empieza a personalizar tu menú hoy",
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/db8e98ggo/image/upload/q_auto,w_200/v1735997330/PROSESANDO_12_xjsila.gif",
    title: "Seguimiento Fit",
    desc: "Registra tus comidas con calorías y nutrientes para un control total de tu alimentación.",
    detail:
      "Dashboard completo con macros, calorías y progreso semanal. Visualiza tu evolución y alcanza tus objetivos más rápido.",
    cta: "📊 Lleva tu progreso al siguiente nivel",
  },
  {
    type: "video",
    src: "https://res.cloudinary.com/db8e98ggo/video/upload/v1739459854/PROSESANDO_fpgklg.mp4",
    title: "Delivery Gratis",
    desc: "Llevamos tu comida fit directamente a tu puerta. Pide desde la app sin costo de envío.",
    detail:
      "Entrega puntual todos los días. Comida fresca, empacada con amor y lista para calentar. Sin preocupaciones, sin cocinar.",
    cta: "🚀 Recibe tu comida sin costo de envío",
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/db8e98ggo/image/upload/q_auto,w_200/v1735948964/PROSESANDO_5_dtun5r.gif",
    title: "IA de Entrenamiento",
    desc: "Accede a rutinas personalizadas por IA para entrenar en casa o en el gym.",
    detail:
      "Rutinas adaptadas a tu nivel, equipo disponible y tiempo. La IA ajusta tu plan cada semana según tu progreso real.",
    cta: "💪 Entrena inteligente, logra más",
  },
];

const steps = [
  {
    number: "01",
    icon: "📋",
    title: "Cuéntanos sobre ti",
    desc: "Completa un formulario de 2 minutos con tus objetivos, gustos y restricciones alimenticias.",
    highlight: "Solo 2 minutos",
  },
  {
    number: "02",
    icon: "🤖",
    title: "La IA diseña tu plan",
    desc: "Nuestra inteligencia artificial analiza tus datos y genera un menú de 7 días 100% personalizado.",
    highlight: "Personalización real",
  },
  {
    number: "03",
    icon: "🍽️",
    title: "Recibe y disfruta",
    desc: "Tus 5 comidas diarias llegan frescas a tu puerta. Sin cocinar, sin preocuparte.",
    highlight: "Delivery gratis",
  },
  {
    number: "04",
    icon: "📈",
    title: "Transforma tu cuerpo",
    desc: "Monitorea tu progreso con métricas reales y ajusta tu plan semanalmente con la IA.",
    highlight: "Resultados visibles",
  },
];

const LAUNCH_DATE = new Date("2026-07-12T00:00:00");

const getTimeLeft = () => {
  const now = new Date();
  const diff = LAUNCH_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const MAX_FREE_TRIALS = 3;
const TRIAL_KEY = "rita_ia_trials";

const getTrialCount = () => {
  try {
    return parseInt(localStorage.getItem(TRIAL_KEY) || "0", 10);
  } catch {
    return 0;
  }
};

const incrementTrialCount = () => {
  try {
    const count = getTrialCount() + 1;
    localStorage.setItem(TRIAL_KEY, String(count));
    return count;
  } catch {
    return 0;
  }
};

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loquiero, setLoquiero] = useState("");
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [flippedCard, setFlippedCard] = useState(null);
  const [activeDot, setActiveDot] = useState(0);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const navigate = useNavigate();

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const index = Math.round((sl / maxScroll) * (benefits.length - 1));
    setActiveDot(Math.min(index, benefits.length - 1));
  };

  const scrollToDot = (i) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    scrollRef.current.scrollTo({
      left: (maxScroll / (benefits.length - 1)) * i,
      behavior: "smooth",
    });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const handleTrialClick = (e) => {
    if (e) e.preventDefault();
    const count = getTrialCount();
    if (count >= MAX_FREE_TRIALS) {
      scrollToSection("planes");
      setShowTrialModal(true);
    } else {
      incrementTrialCount();
      navigate("/Formulario");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <img
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1743140857/gifs_para_apps_gpxkfq.png"
            alt="Rita Fit"
            className="header-logo"
          />
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
            <button
              className="nav-link"
              onClick={() => scrollToSection("inicio")}
            >
              Inicio
            </button>
            <button
              className="nav-link"
              onClick={() => scrollToSection("como-funciona")}
            >
              Cómo Funciona
            </button>
            <button
              className="nav-link"
              onClick={() => scrollToSection("planes")}
            >
              Planes
            </button>
            <button
              className="nav-link"
              onClick={() => scrollToSection("testimonios")}
            >
              Testimonios
            </button>
            <button className="nav-link" onClick={() => scrollToSection("cta")}>
              Empieza Gratis
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section" id="inicio">
        <Videocatgoriashome />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">Precio exclusivo de lanzamiento</div>
          <h1 className="hero-title">
            Nutrición inteligente para tu mejor versión
          </h1>
          <p className="hero-subtitle">
            Planes de comida 100% personalizados por IA. 5 comidas diarias,
            delivery a tu puerta y seguimiento nutricional completo.
          </p>
          {/* COUNTDOWN TIMER */}
          <div className="countdown-container">
            <p className="countdown-label">🚀 Lanzamiento oficial en:</p>
            <div className="countdown-grid">
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="countdown-unit">Días</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="countdown-unit">Horas</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="countdown-unit">Min</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="countdown-unit">Seg</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleTrialClick}
            >
              Prueba la IA Gratis
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => scrollToSection("planes")}
            >
              Ver Planes
            </button>
          </div>
        </div>
      </section>

      {/* BENEFITS CAROUSEL */}
      <section className="benefits-section">
        <div
          className="section-header"
          style={{ padding: "0 24px", marginTop: "48px" }}
        >
          <span className="section-badge">✨ Beneficios</span>
          <h2 className="section-title">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="section-subtitle">
            Desde la planificación hasta la entrega, nos encargamos de todo para
            que tú solo disfrutes.
          </p>
        </div>
        <div
          className="benefits-scroll"
          ref={scrollRef}
          style={{ cursor: "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onScroll={handleScroll}
        >
          {benefits.map((b, i) => (
            <div
              className={`benefit-card-flip ${flippedCard === i ? "flipped" : ""}`}
              key={i}
              onClick={() => setFlippedCard(flippedCard === i ? null : i)}
            >
              <div className="benefit-card-inner">
                {/* FRONT */}
                <div className="benefit-card benefit-card-front">
                  <div className="benefit-media-wrapper">
                    {b.type === "image" ? (
                      <img className="benefit-icon" src={b.src} alt={b.title} />
                    ) : (
                      <video
                        className="benefit-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                      >
                        <source src={b.src} type="video/mp4" />
                      </video>
                    )}
                  </div>
                  <h3 className="benefit-title">{b.title}</h3>
                  <p className="benefit-desc">{b.desc}</p>
                  <span className="benefit-tap-hint">Toca para más info ↻</span>
                </div>
                {/* BACK */}
                <div className="benefit-card benefit-card-back">
                  <span className="benefit-back-icon">
                    {["🎯", "📊", "🚀", "💪"][i]}
                  </span>
                  <h3 className="benefit-title">{b.title}</h3>
                  <p className="benefit-detail">{b.detail}</p>
                  <button
                    className="benefit-cta-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      document
                        .getElementById("planes")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {b.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* DOTS */}
        <div className="benefits-dots">
          {benefits.map((_, i) => (
            <button
              key={i}
              className={`benefits-dot ${activeDot === i ? "active" : ""}`}
              onClick={() => scrollToDot(i)}
              aria-label={`Ir al beneficio ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CTA BANNER - Transform your life */}
      <section className="section" id="cta">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner-text">
              <h2 className="cta-banner-title">
                Transforma tu alimentación con inteligencia artificial
              </h2>
              <p className="cta-banner-desc">
                Nuestra IA analiza tus objetivos, gustos y restricciones para
                crear el menú perfecto. Pruébala ahora — es gratis.
              </p>
              <button className="btn btn-primary" onClick={handleTrialClick}>
                Probar la IA Gratis →
              </button>
            </div>
            <img
              src="https://res.cloudinary.com/db8e98ggo/image/upload/v1772647027/Gemini_Generated_Image_thoxanthoxanthox_1_fbm7xu.png"
              alt="Rita Fit IA"
              className="cta-banner-img"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-subtle" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🚀 Cómo funciona</span>
            <h2 className="section-title">
              Empieza a transformarte en 4 simples pasos
            </h2>
            <p className="section-subtitle">
              Sin complicaciones. En menos de 2 minutos tendrás tu plan de
              comidas personalizado por inteligencia artificial.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div
                className="step-card"
                key={i}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="step-number-badge">{step.number}</div>
                <div className="step-icon-wrapper">
                  <span className="step-icon">{step.icon}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                <span className="step-highlight">{step.highlight}</span>
                {i < steps.length - 1 && (
                  <div className="step-connector" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="plans-section" id="planes">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🚀 Acceso Anticipado</span>
            <h2 className="section-title">Precio exclusivo de lanzamiento</h2>
            <p className="section-subtitle">
              Sé de los primeros 100 en unirte y asegura el mejor precio de por
              vida. Después de los 100 lugares, el precio sube.
            </p>
          </div>
          <Planos name={loquiero} />
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews-section" id="testimonios">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">💬 Testimonios</span>
            <h2 className="section-title">Lo que dicen nuestros clientes</h2>
            <p className="section-subtitle">
              transforma tu alimentación con Rita Fit.
            </p>
          </div>
          <Reviews />
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="contact-section" id="footer">
        <div className="container">
          <h2 className="contact-title">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </h2>
          <p className="contact-desc">
            Contáctanos y descubre cómo Rita Fit puede transformar tu vida.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => window.open("https://wa.me/593963200325", "_blank")}
          >
            💬 Contáctanos por WhatsApp
          </button>
        </div>
      </section>

      {/* MODAL TRIAL LIMIT */}
      {showTrialModal && (
        <div
          className="trial-modal-overlay"
          onClick={() => setShowTrialModal(false)}
        >
          <div className="trial-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="trial-modal-close"
              onClick={() => setShowTrialModal(false)}
            >
              ✕
            </button>
            <span className="trial-modal-icon">🚀</span>
            <h2 className="trial-modal-title">
              ¡Alcanzaste tu máximo de pruebas!
            </h2>
            <p className="trial-modal-desc">
              Ya usaste tus {MAX_FREE_TRIALS} pruebas gratuitas de la IA. Si
              deseas seguir disfrutando de Rita Fit, suscríbete a un plan y
              transforma tu alimentación.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                setShowTrialModal(false);
                scrollToSection("planes");
              }}
            >
              Ver Planes 🔥
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
    </>
  );
};

export default Home;
