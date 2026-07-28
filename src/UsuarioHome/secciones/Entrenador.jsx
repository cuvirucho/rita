import ListaEntrenadores from "../../Entrenadores/ListaEntrenadores";

const Entrenador = () => {
  return (
    <div className="usuario-seccion">
      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">💪 Entrenamiento</span>
        <h2 className="usuario-seccion-title">Entrenador</h2>
        <p className="usuario-seccion-sub">
          Contrata a un entrenador personal por hora, semana o mes y reserva tus
          sesiones.
        </p>
      </div>

      <ListaEntrenadores />
    </div>
  );
};

export default Entrenador;
