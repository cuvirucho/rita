import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import MenuDiario from "../MenuDiario/MenuDiario.jsx";
import MisSemanales from "./secciones/MisSemanales";
import MisConsumos from "./secciones/MisConsumos";
import Entrenador from "./secciones/Entrenador";
import Perfil from "./secciones/Perfil";

const SECCIONES = [
  { id: "menu", label: "Menú Diario", icono: "🍽️" },
  { id: "semanales", label: "Menu personalizado", icono: "📅" },
  { id: "consumos", label: "Mis Consumos", icono: "📊" },
  { id: "entrenador", label: "Entrenador", icono: "💪" },
  { id: "perfil", label: "Perfil", icono: "👤" },
];

const UsuarioHome = () => {
  const { user, perfil } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState("menu");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPlanes, setScrollPlanes] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Tras navegar a Perfil desde el banner, baja con scroll a la zona de planes.
  useEffect(() => {
    if (seccionActiva !== "perfil" || !scrollPlanes) return;
    const t = setTimeout(() => {
      document
        .getElementById("planes")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollPlanes(false);
    }, 120);
    return () => clearTimeout(t);
  }, [seccionActiva, scrollPlanes]);

  const nombre =
    perfil?.nombre || user?.displayName || user?.email || "Usuario";
  const primerNombre = nombre.split(" ")[0];

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  const fechaRaw = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const fechaHoy = fechaRaw.charAt(0).toUpperCase() + fechaRaw.slice(1);

  const irASeccion = (id) => {
    setSeccionActiva(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verPlanes = () => {
    setSeccionActiva("perfil");
    setMenuOpen(false);
    setScrollPlanes(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const renderSeccion = () => {
    switch (seccionActiva) {
      case "semanales":
        return (
          <div className="container">
            <MisSemanales />
          </div>
        );
      case "consumos":
        return (
          <div className="container">
            <MisConsumos />
          </div>
        );
      case "entrenador":
        return (
          <div className="container">
            <Entrenador />
          </div>
        );
      case "perfil":
        return (
          <div className="container">
            <Perfil />
          </div>
        );
      case "menu":
      default:
        // MenuDiario ya incluye su propio .container; se monta sin envoltura extra.
        return (
          <section className="usuario-seccion--menu">
            <MenuDiario />
          </section>
        );
    }
  };

  return (
    <div className="usuario-shell">
      {/* Barra de navegación superior */}
      <header className="usuario-nav">
        <div className="usuario-nav-inner">
          <img
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1773700632/logoderita_1_o7wzjd.png"
            alt="Rita Fit"
            className="usuario-nav-logo"
          />

          <div className="usuario-welcome-text">
            <p className="usuario-welcome-hi">{saludo}</p>
            <h1 className="usuario-welcome-name">
              <strong>{primerNombre}</strong>
            </h1>
            <p className="usuario-welcome-date">{fechaHoy}</p>
          </div>

          <button
            type="button"
            className="usuario-nav-toggle"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <nav className={`usuario-nav-menu ${menuOpen ? "open" : ""}`}>
            {SECCIONES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`usuario-nav-link ${
                  seccionActiva === s.id ? "active" : ""
                }`}
                onClick={() => irASeccion(s.id)}
              >
                <span className="usuario-nav-link-icon">{s.icono}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido del panel */}
      <main className="usuario-content">
        <div className="usuario-seccion-wrap" key={seccionActiva}>
          {renderSeccion()}
        </div>
        {/* Banner de upsell: invita a mejorar el plan (solo usuarios free) */}
        {perfil?.plan === "free" && seccionActiva !== "perfil" && (
          <aside className="usuario-upsell">
            <span className="usuario-upsell-glow" aria-hidden="true" />
            <div className="usuario-upsell-text">
              <span className="usuario-upsell-badge">
                🔓 Estás en el plan Free
              </span>
              <h3 className="usuario-upsell-title">
                Desbloquea todo el poder de Rita
              </h3>
              <p className="usuario-upsell-desc">
                Da el siguiente paso hacia una vida más saludable. Con
                <strong> Starter</strong> o <strong>Premium</strong> obtienes
                menús personalizados con IA, más comidas al mes, entrega a
                domicilio y beneficios exclusivos.
              </p>
              <ul className="usuario-upsell-perks">
                <li>✓ Menú semanal personalizado</li>
                <li>✓ Más comidas + entrega a domicilio</li>
                <li>✓ Cupones y regalos sorpresa</li>
                <li>✓ Sin publicidad </li>
              </ul>
              <button
                type="button"
                className="usuario-upsell-btn"
                onClick={verPlanes}
              >
                Quiero mejorar mi plan →
              </button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default UsuarioHome;
