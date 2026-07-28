import { signOut } from "firebase/auth";
import { auth } from "../../FIRBAS/Firebase";
import { useAuth } from "../../Auth/AuthContext";
import MiPlan from "./MiPlan";

const formatearFecha = (fechaRegistro) => {
  try {
    const fecha =
      typeof fechaRegistro?.toDate === "function"
        ? fechaRegistro.toDate()
        : null;
    if (!fecha) return null;
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

const Perfil = () => {
  const { user, perfil } = useAuth();

  const nombre = perfil?.nombre || user?.displayName || "—";
  const correo = perfil?.correo || user?.email || "—";
  const telefono = perfil?.telefono || "—";
  const plan = perfil?.plan || "free";
  const fecha = formatearFecha(perfil?.fechaRegistro);
  const inicial = (nombre !== "—" ? nombre : correo).charAt(0).toUpperCase();

  const datos = [
    { icono: "👤", label: "Nombre", valor: nombre },
    { icono: "✉️", label: "Correo electrónico", valor: correo },
    { icono: "📱", label: "Teléfono", valor: telefono },
  ];

  const cerrarSesion = () => {
    signOut(auth);
  };

  return (
    <div className="usuario-seccion">
      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">👤 Cuenta</span>
        <h2 className="usuario-seccion-title">Perfil</h2>
        <p className="usuario-seccion-sub">
          Tu información personal y los detalles de tu plan.
        </p>
      </div>

      <div className="usuario-perfil">
        <div className="usuario-perfil-hero">
          <div className="usuario-perfil-avatar">{inicial}</div>
          <div className="usuario-perfil-hero-info">
            <h3 className="usuario-perfil-nombre">{nombre}</h3>
            <span className={`usuario-plan-badge usuario-plan-badge--${plan}`}>
              Plan {plan === "free" ? "Free" : plan}
            </span>
          </div>
        </div>

        <div className="usuario-perfil-grid">
          {datos.map((d) => (
            <div className="usuario-perfil-card" key={d.label}>
              <span className="usuario-perfil-card-icon">{d.icono}</span>
              <div className="usuario-perfil-card-body">
                <span className="usuario-perfil-card-label">{d.label}</span>
                <span className="usuario-perfil-card-value">{d.valor}</span>
              </div>
            </div>
          ))}

          <div className="usuario-perfil-card">
            <span className="usuario-perfil-card-icon">💳</span>
            <div className="usuario-perfil-card-body">
              <span className="usuario-perfil-card-label">Tipo de plan</span>
              <span className="usuario-perfil-card-value">
                {plan === "free" ? "Free" : plan}
              </span>
            </div>
          </div>

          {fecha && (
            <div className="usuario-perfil-card">
              <span className="usuario-perfil-card-icon">🗓️</span>
              <div className="usuario-perfil-card-body">
                <span className="usuario-perfil-card-label">
                  Fecha de registro
                </span>
                <span className="usuario-perfil-card-value">{fecha}</span>
              </div>
            </div>
          )}
        </div>

        <MiPlan />

        <button
          type="button"
          className="usuario-logout"
          onClick={cerrarSesion}
        >
          <span className="usuario-logout-icon">↪</span>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Perfil;
