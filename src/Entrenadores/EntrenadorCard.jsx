// Tarjeta presentacional de un entrenador. Los datos llegan por prop `entrenador`
// (documento de la colección Firestore `entrenadores`).
import { calcAhorro, formatearPrecio, tienePrecio } from "./precios";

const renderEstrellas = (valor) => {
  const v = Math.max(0, Math.min(5, Math.round(Number(valor) || 0)));
  return "★★★★★".slice(0, v) + "☆☆☆☆☆".slice(0, 5 - v);
};

const EntrenadorCard = ({ entrenador, onSuscribir, onReservar }) => {
  const {
    nombre,
    foto,
    especialidad,
    descripcion,
    experiencia,
    calificacion,
    precioHora,
    precioSemana,
    precioMes,
  } = entrenador;

  const ahorroMes = calcAhorro(precioSemana, precioMes);

  return (
    <article className="entrenador-card">
      <div className="entrenador-card-media">
        {foto ? (
          <img
            src={foto}
            alt={nombre}
            className="entrenador-card-foto"
            loading="lazy"
          />
        ) : (
          <div className="entrenador-card-foto entrenador-card-foto--placeholder">
            🏋️
          </div>
        )}
        <span className="entrenador-card-media-overlay" aria-hidden="true" />

        {especialidad && (
          <span className="entrenador-card-especialidad">{especialidad}</span>
        )}
        {tienePrecio(calificacion) && (
          <span className="entrenador-card-rating">
            ⭐ {Number(calificacion).toFixed(1)}
          </span>
        )}
      </div>

      <div className="entrenador-card-body">
        <div className="entrenador-card-head">
          <h3 className="entrenador-card-nombre">{nombre}</h3>
          <span className="entrenador-card-verificado">
            <span aria-hidden="true">✓</span> Profesional verificado
          </span>
        </div>

        <div className="entrenador-card-meta">
          {tienePrecio(calificacion) && (
            <span
              className="entrenador-card-estrellas"
              aria-label={`Calificación ${calificacion} de 5`}
            >
              {renderEstrellas(calificacion)}
            </span>
          )}
          {tienePrecio(experiencia) && (
            <span className="entrenador-card-exp">
              🏅 {experiencia} {Number(experiencia) === 1 ? "año" : "años"} de
              experiencia
            </span>
          )}
        </div>

        {descripcion && <p className="entrenador-card-desc">{descripcion}</p>}

        <div className="entrenador-card-precios">
          <div className="entrenador-precio">
            <span className="entrenador-precio-label">Hora</span>
            <span className="entrenador-precio-valor">
              {formatearPrecio(precioHora)}
            </span>
          </div>
          <div className="entrenador-precio">
            <span className="entrenador-precio-label">Semana</span>
            <span className="entrenador-precio-valor">
              {formatearPrecio(precioSemana)}
            </span>
          </div>
          <div className="entrenador-precio entrenador-precio--best">
            <span className="entrenador-precio-badge">Mejor valor</span>
            <span className="entrenador-precio-label">Mes</span>
            <span className="entrenador-precio-valor">
              {formatearPrecio(precioMes)}
            </span>
            {ahorroMes != null && (
              <span className="entrenador-precio-ahorro">
                Ahorra {ahorroMes}%
              </span>
            )}
          </div>
        </div>

        <div className="entrenador-card-acciones">
          <button
            type="button"
            className="btn btn-primary entrenador-card-btn"
            onClick={() => onReservar(entrenador)}
          >
            Reservar sesión
          </button>
          <button
            type="button"
            className="btn btn-outline entrenador-card-btn"
            onClick={() => onSuscribir(entrenador)}
          >
            Suscribirse
          </button>
        </div>
      </div>
    </article>
  );
};

export default EntrenadorCard;
