import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../HOME/Footer";
import ListaEntrenadores from "./ListaEntrenadores";

// Página completa de Entrenadores Personales (ruta /entrenadores).
const EntrenadoresPersonales = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="entrenadores-page">
      <header className="entrenadores-topbar">
        <div className="container entrenadores-topbar-inner">
          <img
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1773700632/logoderita_1_o7wzjd.png"
            alt="Rita Fit"
            className="entrenadores-logo"
            onClick={() => navigate("/")}
          />
          <button
            type="button"
            className="entrenadores-back"
            onClick={() => navigate("/")}
          >
            ← Volver
          </button>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">💪 Entrenadores</span>
            <h2 className="section-title">Entrenadores Personales</h2>
            <p className="section-subtitle">
              Alcanza tus objetivos de salud y bienestar con el acompañamiento
              de un profesional. Elige el plan que prefieras: por hora, por
              semana o por mes.
            </p>

            <ul className="entrenadores-sellos">
              <li className="entrenadores-sello">
                <span aria-hidden="true">✅</span> Profesionales verificados
              </li>
              <li className="entrenadores-sello">
                <span aria-hidden="true">🔒</span> Pago seguro por trasferencia
              </li>
              <li className="entrenadores-sello">
                <span aria-hidden="true">🔄</span> Sin permanencia
              </li>
            </ul>
          </div>

          <ol className="entrenadores-pasos">
            <li className="entrenadores-paso">
              <span className="entrenadores-paso-num">1</span>
              <div>
                <h3 className="entrenadores-paso-title">Elige tu entrenador</h3>
                <p className="entrenadores-paso-text">
                  Compara perfiles, especialidad y valoraciones.
                </p>
              </div>
            </li>
            <li className="entrenadores-paso">
              <span className="entrenadores-paso-num">2</span>
              <div>
                <h3 className="entrenadores-paso-title">
                  Reserva o suscríbete
                </h3>
                <p className="entrenadores-paso-text">
                  Por hora, por semana o por mes. Tú decides.
                </p>
              </div>
            </li>
            <li className="entrenadores-paso">
              <span className="entrenadores-paso-num">3</span>
              <div>
                <h3 className="entrenadores-paso-title">Entrena y avanza</h3>
                <p className="entrenadores-paso-text">
                  Recibe acompañamiento real hacia tus objetivos.
                </p>
              </div>
            </li>
          </ol>

          <ListaEntrenadores />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EntrenadoresPersonales;
