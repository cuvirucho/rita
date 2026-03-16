import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Formo = ({ setPreferencias }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    goal: "Bajar peso",
    dietaryRestrictions: "",
    dislikes: "",
    like: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPreferencias(formData);
    navigate("/menu");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="form-page">
      {/* Hero with video */}
      <div className="form-hero">
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", height: "360px", objectFit: "cover" }}
        >
          <source
            src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743095590/Copia_de_Sin_t%C3%ADtulo_V%C3%ADdeo_qm0svk.mp4"
            type="video/mp4"
          />
        </video>
        <div className="form-hero-overlay">
          <img
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1773700632/logoderita_1_o7wzjd.png"
            alt="Rita Fit"
            className="form-page-logo"
          />
          <h1 className="form-hero-title">
            Potencia tu vida con nutrición personalizada
          </h1>
          <p className="form-hero-subtitle">
            Nuestra IA de nutrición creará el menú perfecto para ti
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-container">
        <h2 className="form-section-title">Cuéntanos sobre ti</h2>
        <p className="form-section-desc">
          Al completar este formulario, nuestra IA generará un plan de comidas
          personalizado para ti.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label className="form-label">Edad</label>
              <input
                className="form-input"
                type="number"
                name="age"
                placeholder="25"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Peso (kg)</label>
              <input
                className="form-input"
                type="number"
                name="weight"
                placeholder="70"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Altura (cm)</label>
            <input
              className="form-input"
              type="number"
              name="height"
              placeholder="170"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Objetivo</label>
            <select
              className="form-select"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
            >
              <option value="Bajar peso">Bajar de peso</option>
              <option value="Aumentar musculo">Aumentar músculo</option>
              <option value="Cuidado de diabetes">Cuidado de diabetes</option>
              <option value="Cuidado de hipertensión">
                Cuidado de hipertensión
              </option>
              <option value="Cuidado de gastritis">Cuidado de gastritis</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Restricciones alimenticias</label>
            <input
              className="form-input"
              type="text"
              name="dietaryRestrictions"
              placeholder="Ej: Sin gluten, sin lácteos..."
              value={formData.dietaryRestrictions}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alimentos que no te gustan</label>
            <input
              className="form-input"
              type="text"
              name="dislikes"
              placeholder="Ej: Brócoli, hígado..."
              value={formData.dislikes}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Cuéntale a la IA qué te gusta comer
            </label>
            <input
              className="form-input"
              type="text"
              name="like"
              placeholder="Ej: Pollo, arroz, ensaladas..."
              value={formData.like}
              onChange={handleChange}
            />
          </div>

          <button className="form-submit" type="submit">
            Generar Mi Plan de Comidas →
          </button>
        </form>
      </div>

      <div className="form-bottom-spacer" />
    </div>
  );
};

export default Formo;
