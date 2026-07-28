import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Videocatgoriashome from "./Videocatgoriashome";
import Reviews from "./Reseñas/Reviews";
import Planos from "../Menu/Plano/Planos";
import Footer from "./Footer";
import MenuDiario from "../MenuDiario/MenuDiario.jsx";
import AuthPanel from "../Auth/AuthPanel";

const benefits = [
  {
    type: "video",
    src: "https://res.cloudinary.com/db8e98ggo/video/upload/v1743095590/Copia_de_Sin_t%C3%ADtulo_V%C3%ADdeo_qm0svk.mp4",
    title: "Comida Personalizada",
    desc: "Crea tu menú personalizado con tus gustos y deja que nuestra IA optimice cada comida para ti. o disfruta de nuestro menú diario ya diseñado.",
    detail:
      "Nuestra IA analiza tus preferencias, alergias y metas para diseñar cada platillo. Tú decides qué comer, nosotros lo hacemos perfecto.También puedes optar por nuestro menú diario ya diseñado, listo para disfrutar.",
    cta: "🔥 Empieza a personalizar tu menú hoy",
  },
  {
    type: "video",
    src: "https://res.cloudinary.com/db8e98ggo/video/upload/v1785013544/rita_751_x_1080_px_751_x_1080_px_1920_x_1080_px_1_qt98kv.mp4",
    title: "Control Total",
    desc: "Mantén el control total sobre tu alimentación y progreso físico con nuestra APP.",
    detail:
      "Registra tus comidas, calorías y macros. Visualiza tu progreso con gráficos claros y ajusta tu plan semanalmente con la IA para resultados óptimos.",
    cta: "📱 Controla tu progreso desde la app",
  },
  {
    type: "video",
    src: "https://res.cloudinary.com/db8e98ggo/video/upload/v1785014708/rita_751_x_1080_px_751_x_1080_px_1920_x_1080_px_4_vszgnm.mp4",
    title: "Chefs expertos para ti",
    desc: "Nuestros chefs expertos preparan cada comida con ingredientes frescos y de calidad, asegurando sabor y nutrición en cada bocado.",
    detail:
      "Dashboard completo con macros, calorías y progreso semanal. Visualiza tu evolución y alcanza tus objetivos más rápido.",
    cta: "📊 Lleva tu progreso al siguiente nivel",
  },
  {
    type: "video",
    src: "https://res.cloudinary.com/db8e98ggo/video/upload/v1785015051/rita_751_x_1080_px_751_x_1080_px_1920_x_1080_px_5_cob34v.mp4",
    title: "Delivery Gratis",
    desc: "Llevamos tu comida fit directamente a tu puerta. Pide desde la app sin costo de envío.",
    detail:
      "Entrega puntual todos los días. Comida fresca, empacada con amor y lista para calentar. Sin preocupaciones, sin cocinar.",
    cta: "🚀 Recibe tu comida sin costo de envío",
  },
  {
    type: "video",
    src: "https://res.cloudinary.com/db8e98ggo/video/upload/v1785015781/rita_751_x_1080_px_751_x_1080_px_1920_x_1080_px_6_xhsnb0.mp4",
    title: "Entrenador personal",
    desc: "Accede a rutinas personalizadas por para entrenar en casa o en el gym.",
    detail:
      "Rutinas adaptadas a tu nivel, equipo disponible y tiempo. el entrenador ajusta tu plan cada semana según tu progreso real.",
    cta: "💪 Entrena inteligente, logra más",
  },
];

const steps = [
  {
    number: "01",
    icon: "📋",
    title: "Crea una cuenta",
    desc: "Regístrate completamente gratis o adqueire un plan de suscripción personalizado y empieza a disfrutar de todos los beneficios de Rita Fit.",
    highlight: "Solo 2 minutos",
  },
  {
    number: "02",
    icon: "🤖",
    title: "La IA diseña tu plan o revisa el menu diario",
    desc: "Nuestra inteligencia artificial genera un menú de 5 días 100% personalizado. O si lo prefieres, revisa el menú diario y ajusta tus comidas a tu gusto.",
    highlight: "Personalización real",
  },
  {
    number: "03",
    icon: "🍽️",
    title: "Recibe y disfruta",
    desc: "Tus comidas diarias llegan frescas a tu puerta. Sin cocinar, sin preocuparte.",
    highlight: "Delivery gratis",
  },
  {
    number: "04",
    icon: "📈",
    title: "Transforma tu cuerpo",
    desc: "Monitorea tu progreso con métricas reales y un entrenador personal",
    highlight: "Resultados visibles",
  },
];

const LAUNCH_DATE = new Date("2026-06-25T00:00:00");

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

const MAX_FREE_TRIALS = 2;
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

const PageSkeleton = ({ visible }) => (
  <div className={`page-skeleton${visible ? "" : " fade-out"}`}>
    {/* Header */}
    <div className="skel-header">
      <div className="skeleton-block skel-logo" />
      <div className="skel-nav">
        <div className="skeleton-block skel-nav-item" />
        <div className="skeleton-block skel-nav-item" />
        <div className="skeleton-block skel-nav-item" />
        <div className="skeleton-block skel-nav-item" />
      </div>
    </div>
    {/* Hero */}
    <div className="skel-hero">
      <div className="skel-hero-shimmer" />
      <div className="skel-hero-content">
        <div className="skel-badge" />
        <div className="skel-title" />
        <div className="skel-title short" />
        <div className="skel-subtitle" />
        <div className="skel-subtitle" style={{ width: "60%" }} />
        <div className="skel-countdown">
          <div className="skel-countdown-item" />
          <div className="skel-countdown-item" />
          <div className="skel-countdown-item" />
          <div className="skel-countdown-item" />
        </div>
        <div className="skel-btns">
          <div className="skel-btn" />
          <div className="skel-btn" />
        </div>
      </div>
    </div>
    {/* Benefits */}
    <div className="skel-section">
      <div className="skeleton-block skel-section-badge" />
      <div className="skeleton-block skel-section-title" />
      <div className="skel-cards">
        <div className="skeleton-block skel-card" />
        <div className="skeleton-block skel-card" />
        <div className="skeleton-block skel-card" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loquiero, setLoquiero] = useState("");
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [flippedCard, setFlippedCard] = useState(null);
  const [activeDot, setActiveDot] = useState(0);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [skeletonVisible, setSkeletonVisible] = useState(true);
  const navigate = useNavigate();

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Refs espejo para el auto-avance (evitan closures obsoletas)
  const activeDotRef = useRef(0);
  const pausedRef = useRef(false);
  const flippedRef = useRef(null);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    pausedRef.current = true;
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

  // Detecta la tarjeta cuyo centro está más cerca del centro del viewport
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(cardCenter - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    activeDotRef.current = best;
    setActiveDot(best);
    // Si la tarjeta central cambió, des-voltea la que quedó fuera del centro
    if (flippedCard !== null && flippedCard !== best) setFlippedCard(null);
  };

  // Centra la tarjeta i dentro del carrusel
  const scrollToIndex = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[i];
    if (!card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  const goPrev = () =>
    scrollToIndex((activeDot - 1 + benefits.length) % benefits.length);
  const goNext = () => scrollToIndex((activeDot + 1) % benefits.length);

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

  const loadedRef = useRef(false);

  const handleVideoLoaded = () => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    setVideoLoaded(true);
    setTimeout(() => setSkeletonVisible(false), 520);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fallback: hide skeleton after 5s if video never fires canPlay
    const fallback = setTimeout(() => handleVideoLoaded(), 5000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mantiene la ref de la tarjeta volteada sincronizada con el estado
  useEffect(() => {
    flippedRef.current = flippedCard;
  }, [flippedCard]);

  return (
    <>
      {skeletonVisible && <PageSkeleton visible={!videoLoaded} />}
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
              onClick={() => scrollToSection("menu-diario")}
            >
              Menú Diario
            </button>
            <button
              className="nav-link"
              onClick={() => scrollToSection("planes")}
            >
              Planes
            </button>
            <button className="nav-link" onClick={() => scrollToSection("cta")}>
              Empieza Gratis
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section" id="inicio">
        <Videocatgoriashome onLoaded={handleVideoLoaded} />

        <div className="hero-content">
          <h1 className="hero-title">
            Nutrición inteligente para tu mejor versión
          </h1>
          <p className="hero-subtitle">
            Ser fit nunca fue tan fácil. Con Rita, tu alimentación y
            entrenamiento se adaptan a ti, no al revés.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => scrollToSection("acceder")}
            >
              Crear cuenta
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => scrollToSection("planes")}
            >
              Ver planes
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => scrollToSection("menu-diario")}
            >
              Ver menu diario
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => scrollToSection("planes")}
            >
              Entrenador personal
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
          className="benefits-carousel"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onTouchStart={() => (pausedRef.current = true)}
          onTouchEnd={() => (pausedRef.current = false)}
        >
          <button
            className="benefits-arrow prev"
            onClick={goPrev}
            aria-label="Beneficio anterior"
          >
            ‹
          </button>
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
                className={`benefit-card-flip ${flippedCard === i ? "flipped" : ""} ${activeDot === i ? "is-active" : ""}`}
                key={i}
                onClick={() => {
                  if (activeDot === i) {
                    // Ya es la resaltada → alternar el volteo
                    setFlippedCard(flippedCard === i ? null : i);
                  } else {
                    // No está al centro → traerla al frente y resaltarla (sin voltear)
                    setFlippedCard(null);
                    scrollToIndex(i);
                  }
                }}
              >
                <div className="benefit-card-inner">
                  {/* FRONT */}
                  <div className="benefit-card benefit-card-front">
                    <div className="benefit-media-wrapper">
                      {b.type === "image" ? (
                        <img
                          className="benefit-icon"
                          src={b.src}
                          alt={b.title}
                        />
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
                    <span className="benefit-tap-hint">
                      Toca para más info ↻
                    </span>
                  </div>
                  {/* BACK */}
                  <div className="benefit-card benefit-card-back">
                    <span className="benefit-back-icon">
                      {["🎯", "📊", "🚀", "💪", "📱"][i]}
                    </span>
                    <h3 className="benefit-title">{b.title}</h3>
                    <p className="benefit-detail">{b.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="benefits-arrow next"
            onClick={goNext}
            aria-label="Siguiente beneficio"
          >
            ›
          </button>
        </div>
        {/* DOTS */}
        <div className="benefits-dots">
          {benefits.map((_, i) => (
            <button
              key={i}
              className={`benefits-dot ${activeDot === i ? "active" : ""}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Ir al beneficio ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-subtle" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🚀 Cómo funciona</span>
            <h2 className="section-title">
              Empieza a transformar tu vida en 4 simples pasos
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

      {/* Menu diario */}
      <section className="menu-diario-section" id="menu-diario">
        <MenuDiario />
      </section>

      {/*Entrenador*/}
      <section className="section entrenador-teaser" id="entrenadores">
        <div className="container">
          <div className="entrenador-teaser-card">
            <span
              className="entrenador-teaser-glow entrenador-teaser-glow--a"
              aria-hidden="true"
            />
            <span
              className="entrenador-teaser-glow entrenador-teaser-glow--b"
              aria-hidden="true"
            />

            <div className="entrenador-teaser-body">
              <div className="entrenador-teaser-header">
                <span className="section-badge">💪 Entrenamiento personal</span>
                <h2 className="section-title">
                  En Rita también tienes un entrenador personal
                </h2>
                <p className="section-subtitle">
                  Combina tu alimentación con rutinas guiadas por un
                  profesional. Un entrenador personal te ayuda a mantener la
                  motivación, prevenir lesiones y alcanzar tus objetivos de
                  salud y bienestar mucho más rápido. Disponible por hora, por
                  semana o por mes.
                </p>
              </div>

              <ul className="entrenador-teaser-list">
                <li className="entrenador-teaser-feature">
                  <span className="entrenador-teaser-check" aria-hidden="true">
                    ✓
                  </span>
                  <span>Rutinas adaptadas a tu nivel y objetivos</span>
                </li>
                <li className="entrenador-teaser-feature">
                  <span className="entrenador-teaser-check" aria-hidden="true">
                    ✓
                  </span>
                  <span>Seguimiento y ajustes constantes</span>
                </li>
                <li className="entrenador-teaser-feature">
                  <span className="entrenador-teaser-check" aria-hidden="true">
                    ✓
                  </span>
                  <span>Motivación y acompañamiento real</span>
                </li>
              </ul>

              <button
                className="btn btn-primary btn-lg entrenador-teaser-btn"
                onClick={() => navigate("/entrenadores")}
              >
                Más información
                <span className="entrenador-teaser-arrow" aria-hidden="true">
                  →
                </span>
              </button>

              <ul className="entrenador-teaser-sellos">
                <li className="entrenadores-sello">
                  <span aria-hidden="true">✅</span> Profesionales verificados
                </li>
                <li className="entrenadores-sello">
                  <span aria-hidden="true">🔒</span> Pago seguro por
                  trasferencia
                </li>
                <li className="entrenadores-sello">
                  <span aria-hidden="true">🔄</span> Sin permanencia
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="plans-section" id="planes">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🚀Planes personalisados </span>
            <h2 className="section-title">
              Disfruta de nuestros planes perosonalisados a tu medida tus gustos
              y tu objetivo{" "}
            </h2>
          </div>
          <Planos name={loquiero} />
        </div>
      </section>

      {/* crear cuenta  */}
      <section className="auth-section" id="acceder">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🔐 Tu cuenta</span>
            <h2 className="section-title">Únete a Rita Fit gratis</h2>
            <p className="section-subtitle">
              Crea tu cuenta gratis o inicia sesión para acceder a tu plan
              personalizado.
            </p>
          </div>
          <AuthPanel />
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
