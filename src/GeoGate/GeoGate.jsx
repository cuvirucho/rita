import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../FIRBAS/Firebase";

const GeoGate = ({ children }) => {
  const [status, setStatus] = useState("loading"); // loading | allowed | blocked
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [ciudadUsuario, setCiudadUsuario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const CUENCA_LAT = -2.9001;
    const CUENCA_LON = -79.0059;
    const MAX_RADIUS_KM = 40;

    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const toRad = (d) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // 🔥 SI VIENE DE REACT NATIVE
    if (window.REACT_NATIVE_LOCATION) {
      const { latitude, longitude } = window.REACT_NATIVE_LOCATION;

      const dist = haversineKm(latitude, longitude, CUENCA_LAT, CUENCA_LON);

      setCiudad(dist <= MAX_RADIUS_KM ? "Cuenca" : "tu ciudad");
      setPais(dist <= MAX_RADIUS_KM ? "Ecuador" : "");
      setStatus(dist <= MAX_RADIUS_KM ? "allowed" : "blocked");

      return;
    }

    // 🌐 SI ES NAVEGADOR NORMAL
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = haversineKm(latitude, longitude, CUENCA_LAT, CUENCA_LON);

        setStatus(dist <= MAX_RADIUS_KM ? "allowed" : "blocked");
      },
      () => {
        setStatus("allowed");
      },
    );
  }, []);
  const handlePeticion = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !ciudadUsuario.trim()) return;
    setEnviando(true);
    try {
      await addDoc(collection(db, "peticiones"), {
        nombre: nombre.trim(),
        email: email.trim(),
        ciudad: ciudadUsuario.trim(),
        ciudadDetectada: ciudad,
        paisDetectado: pais,
        fecha: serverTimestamp(),
      });
      setEnviado(true);
    } catch {
      alert("Error al enviar. Intenta de nuevo.");
    }
    setEnviando(false);
  };

  if (status === "loading") {
    return (
      <div className="geo-loading">
        <div className="geo-loading-orbs">
          <div className="geo-orb geo-orb-1" />
          <div className="geo-orb geo-orb-2" />
          <div className="geo-orb geo-orb-3" />
        </div>
        <div className="geo-loading-center">
          <div className="geo-loading-ring">
            <div className="geo-loading-spinner" />
            <img
              src="https://res.cloudinary.com/db8e98ggo/image/upload/v1773687253/logoderita_nncelm.png"
              alt="Rita Fit"
              className="geo-loading-logo"
            />
          </div>
          <p className="geo-loading-text">
            Verificando disponibilidad
            <span className="geo-loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (status === "allowed") {
    return children;
  }

  // BLOCKED — show petition screen
  return (
    <div className="geo-blocked">
      <div className="geo-blocked-bg">
        <div className="geo-bg-orb geo-bg-orb-1" />
        <div className="geo-bg-orb geo-bg-orb-2" />
        <div className="geo-bg-orb geo-bg-orb-3" />
        <div className="geo-bg-grid" />
      </div>

      <div className="geo-blocked-content">
        <div className="geo-blocked-card">
          <div className="geo-card-glow" />

          <div className="geo-blocked-header">
            <img
              src="https://res.cloudinary.com/db8e98ggo/image/upload/v1773687253/logoderita_nncelm.png"
              alt="Rita Fit"
              className="geo-blocked-logo"
            />
            <div className="geo-blocked-badge">
              <span className="geo-badge-dot" />
              Solo en Cuenca
            </div>
          </div>

          <div className="geo-blocked-icon">
            <span className="geo-icon-pin">📍</span>
            <div className="geo-icon-rings">
              <span className="geo-ring geo-ring-1" />
              <span className="geo-ring geo-ring-2" />
              <span className="geo-ring geo-ring-3" />
            </div>
          </div>

          <h1 className="geo-blocked-title">
            Rita todavía no llega a{" "}
            <span className="geo-highlight">tu ciudad</span>
          </h1>

          <p className="geo-blocked-subtitle">
            Detectamos que estás en{" "}
            <strong>
              {ciudad}
              {pais ? `, ${pais}` : ""}
            </strong>
            . Actualmente Rita Fit solo está disponible en{" "}
            <strong>Cuenca, Ecuador</strong>.
          </p>

          <div className="geo-blocked-divider">
            <span className="geo-divider-line" />
            <span className="geo-divider-icon">🚀</span>
            <span className="geo-divider-line" />
          </div>

          <p className="geo-blocked-desc">
            ¡Pero queremos llegar a ti! Firma la petición y serás el primero en
            enterarte cuando Rita Fit esté disponible en tu ciudad.
          </p>

          {!enviado ? (
            <form className="geo-petition-form" onSubmit={handlePeticion}>
              <div className="geo-input-group">
                <span className="geo-input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="geo-input"
                  required
                  maxLength={100}
                />
              </div>
              <div className="geo-input-group">
                <span className="geo-input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="geo-input"
                  required
                  maxLength={200}
                />
              </div>
              <div className="geo-input-group">
                <span className="geo-input-icon">🏙️</span>
                <input
                  type="text"
                  placeholder="Tu ciudad"
                  value={ciudadUsuario}
                  onChange={(e) => setCiudadUsuario(e.target.value)}
                  className="geo-input"
                  required
                  maxLength={100}
                />
              </div>
              <button
                type="submit"
                className="geo-petition-btn"
                disabled={enviando}
              >
                <span className="geo-btn-bg" />
                <span className="geo-btn-text">
                  {enviando
                    ? "Enviando..."
                    : "✍️ Firmar petición para Rita en mi ciudad"}
                </span>
              </button>
            </form>
          ) : (
            <div className="geo-petition-success">
              <div className="geo-success-confetti">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <span className="geo-success-icon">🎉</span>
              <h3>¡Gracias por firmar!</h3>
              <p>
                Te notificaremos a <strong>{email}</strong> cuando Rita Fit
                llegue a <strong>{ciudadUsuario}</strong>.
              </p>
            </div>
          )}

          <div className="geo-blocked-footer">
            <p>¿Estás en Cuenca y ves esto por error?</p>
            <button
              className="geo-skip-btn"
              onClick={() => setStatus("allowed")}
            >
              Acceder de todas formas
              <span className="geo-skip-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoGate;
