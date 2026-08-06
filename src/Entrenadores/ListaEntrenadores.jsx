import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../FIRBAS/Firebase";
import { useAuth } from "../Auth/AuthContext";
import EntrenadorCard from "./EntrenadorCard";
import ModalSuscribir from "./ModalSuscribir";
import ModalReservar from "./ModalReservar";

// Lista reutilizable de entrenadores. Se usa tanto en la página pública
// (EntrenadoresPersonales) como en la pestaña "Entrenador" del panel de usuario.
// Lee la colección Firestore `entrenadores` mostrando solo los que tienen
// `activo === true`. Los botones Suscribirse/Reservar requieren sesión iniciada.
const ListaEntrenadores = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // console.log(user);

  const [entrenadores, setEntrenadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [entrenadorSel, setEntrenadorSel] = useState(null);
  const [modal, setModal] = useState(null); // "suscribir" | "reservar" | "login"

  useEffect(() => {
    let montado = true;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "entrenadores"), where("activo", "==", true)),
        );
        // console.log(snap.docs);

        if (!montado) return;
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Orden por createdAt desc en cliente para no requerir índice compuesto.
        lista.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        );
        setEntrenadores(lista);
      } catch {
        if (montado) setError(true);
        // console.log(error);
      } finally {
        if (montado) setCargando(false);
      }
    })();
    return () => {
      montado = false;
    };
  }, []);

  const abrirModal = (tipo, entrenador) => {
    if (!user) {
      setModal("login");
      return;
    }
    setEntrenadorSel(entrenador);
    setModal(tipo);
  };

  const cerrar = () => {
    setModal(null);
    setEntrenadorSel(null);
  };

  if (cargando) {
    return (
      <div className="entrenadores-loading">
        <div className="auth-loading-spinner" />
        <p className="entrenadores-loading-text">Cargando entrenadores…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="usuario-empty">
        <span className="usuario-empty-icon">⚠️</span>
        <h3 className="usuario-empty-title">
          No pudimos cargar los entrenadores
        </h3>
        <p className="usuario-empty-text">
          Ocurrió un problema al conectar. Vuelve a intentarlo más tarde.
        </p>
      </div>
    );
  }

  if (entrenadores.length === 0) {
    return (
      <div className="usuario-empty">
        <span className="usuario-empty-icon">🏋️</span>
        <h3 className="usuario-empty-title">
          Aún no hay entrenadores disponibles
        </h3>
        <p className="usuario-empty-text">
          Muy pronto tendrás entrenadores personales para acompañarte en tus
          objetivos de salud y bienestar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="entrenadores-grid">
        {entrenadores.map((e) => (
          <EntrenadorCard
            key={e.id}
            entrenador={e}
            onSuscribir={(en) => abrirModal("suscribir", en)}
            onReservar={(en) => abrirModal("reservar", en)}
          />
        ))}
      </div>

      {modal === "suscribir" && entrenadorSel && (
        <ModalSuscribir entrenador={entrenadorSel} onClose={cerrar} />
      )}
      {modal === "reservar" && entrenadorSel && (
        <ModalReservar entrenador={entrenadorSel} onClose={cerrar} />
      )}
      {modal === "login" && (
        <div className="trial-modal-overlay" onClick={cerrar}>
          <div className="trial-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="trial-modal-close"
              onClick={cerrar}
            >
              ✕
            </button>
            <span className="trial-modal-icon">🔐</span>
            <h2 className="trial-modal-title">Inicia sesión para continuar</h2>
            <p className="trial-modal-desc">
              Para suscribirte o reservar con un entrenador necesitas tener una
              sesión iniciada en Rita Fit.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                cerrar();
                navigate("/");
              }}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ListaEntrenadores;
