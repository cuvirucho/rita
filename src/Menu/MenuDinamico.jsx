import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generarMenu } from "./Genradoria";
import Planos from "./Plano/Planos";
import Footer from "../HOME/Footer";

const mealLabels = {
  desayuno: "Desayuno",
  snack1: "Snack 1",
  almuerzo: "Almuerzo",
  snack2: "Snack 2",
  cena: "Cena",
};

const MenuDinamico = ({ preferencias }) => {
  const [menu, setMenu] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [selectedDay, setSelectedDay] = useState("dia1");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!preferencias) {
      navigate("/");
      return;
    }
    const cargarMenu = async () => {
      const nuevoMenu = await generarMenu(preferencias);
      setMenu(nuevoMenu);
      setCargando(false);
    };
    cargarMenu();
  }, []);

  return (
    <div className="menu-page">
      <img
        src="https://res.cloudinary.com/db8e98ggo/image/upload/v1743140857/gifs_para_apps_gpxkfq.png"
        alt="Rita Fit"
        className="menu-page-logo"
      />

      {menu ? (
        <>
          <div className="menu-header">
            <h1 className="menu-header-title">Tu Plan de Comidas</h1>
            <div className="menu-header-badge">
              ¡Hola {preferencias.name}! 🎉
            </div>
            <p className="menu-header-desc">
              Este menú ha sido diseñado especialmente para ayudarte a alcanzar
              tu meta de <strong>{preferencias.goal}</strong>. Nuestros menús se
              renuevan cada semana.
            </p>
            <p className="menu-week-label">📅 Primera Semana</p>
          </div>

          <div className="menu-days">
            {Object.keys(menu).map((day, index) => (
              <button
                key={index}
                className={`menu-day-btn ${selectedDay === day ? "active" : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                Día {index + 1}
              </button>
            ))}
          </div>

          <div className="menu-meals">
            {Object.entries(menu[selectedDay]).map(([meal, details], index) => (
              <div key={index} className={`meal-card ${meal}`}>
                <h3>
                  {mealLabels[meal] ||
                    meal.charAt(0).toUpperCase() + meal.slice(1)}
                </h3>
                <p className="meal-name">{details.nombre}</p>
                <p className="meal-desc">{details.descripcion}</p>
                <div className="meal-nutrients">
                  <div className="nutrient-group">
                    <span className="nutrient-label">Calorías</span>
                    <span className="nutrient-value">
                      {details.calorias} kcal
                    </span>
                  </div>
                  <div className="nutrient-group">
                    <span className="nutrient-label">Proteínas</span>
                    <span className="nutrient-value">
                      {details.proteinas ? details.proteinas.total : "—"}
                    </span>
                  </div>
                  {details.vitaminas && (
                    <div className="nutrient-group">
                      <span className="nutrient-label">Vitaminas</span>
                      {Object.entries(details.vitaminas).map(
                        ([key, value], i) => (
                          <span className="nutrient-value" key={i}>
                            {key}: {value}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                  {details.minerales && (
                    <div className="nutrient-group">
                      <span className="nutrient-label">Minerales</span>
                      {Object.entries(details.minerales).map(
                        ([key, value], i) => (
                          <span className="nutrient-value" key={i}>
                            {key}: {value}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upsell section */}
          <section className="section">
            <div className="container" style={{ textAlign: "center" }}>
              <div className="section-header">
                <span className="section-badge">🚀 Suscríbete</span>
                <h2 className="section-title">
                  Esto es solo una muestra de lo que nuestra IA puede hacer
                </h2>
                <p className="section-subtitle">
                  Adquiere tu suscripción mensual y disfruta de comida
                  saludable, personalizada y con delivery a tu puerta.
                </p>
              </div>
              <Planos />
            </div>
          </section>
        </>
      ) : (
        <div className="loading-container">
          <video className="loading-video" autoPlay loop muted playsInline>
            <source
              src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743620220/gifs_para_apps_1_vyt05f.mp4"
              type="video/mp4"
            />
          </video>
          <p className="loading-text">
            Nuestra IA de nutrición está creando algo especial para ti...
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MenuDinamico;
