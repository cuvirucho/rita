import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "../../Auth/AuthContext";
import { db } from "../../FIRBAS/Firebase";
import Planos from "../../Menu/Plano/Planos.jsx";
import MisEntregas from "./MisEntregas.jsx";
import {
  LIMITE_DIRECCIONES,
  NOMBRE_PLAN,
  dentroDeZona,
  iconoEtiqueta,
  nuevoId,
  planDelivery,
} from "./deliveryUtils";

// El mapa vive en su propio chunk: Leaflet solo se descarga cuando el usuario
// abre la pantalla de selección, nunca para un usuario del plan Free.
const DeliveryMapa = lazy(() => import("./DeliveryMapa.jsx"));

const Delivery = () => {
  const { user, perfil } = useAuth();
  const plan = planDelivery(perfil);
  const limite = LIMITE_DIRECCIONES[plan] ?? 0;

  // Hidratación optimista desde el perfil para pintar sin parpadeo; el getDoc
  // de abajo manda, porque AuthContext lee el perfil una sola vez y no lo
  // refresca tras guardar.
  const [direcciones, setDirecciones] = useState(() =>
    Array.isArray(perfil?.direccionesEntrega) ? perfil.direccionesEntrega : [],
  );
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const [vista, setVista] = useState("lista"); // lista | mapa
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(null);
  const [toast, setToast] = useState("");

  const toastRef = useRef(null);

  const mostrarToast = (texto) => {
    setToast(texto);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => () => clearTimeout(toastRef.current), []);

  /* --------------------------------------------------------------- */
  /* Carga autoritativa (una por montaje de la sección)                */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    if (plan === "free" || !user?.uid) {
      setCargando(false);
      return;
    }
    let vivo = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "UsuariosActivos", user.uid));
        if (!vivo) return;
        const datos = snap.exists() ? snap.data() : null;
        setDirecciones(
          Array.isArray(datos?.direccionesEntrega)
            ? datos.direccionesEntrega
            : [],
        );
        setErrorCarga(false);
      } catch {
        // Conservamos lo hidratado desde el perfil.
        if (vivo) setErrorCarga(true);
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [user?.uid, plan, recarga]);

  /* --------------------------------------------------------------- */
  /* Escrituras                                                       */
  /* --------------------------------------------------------------- */
  const persistir = async (lista) => {
    await setDoc(
      doc(db, "UsuariosActivos", user.uid),
      {
        direccionesEntrega: lista,
        direccionesActualizadasEn: serverTimestamp(),
      },
      { merge: true }, // nunca pisa el resto del perfil
    );
    setDirecciones(lista);
  };

  const guardarDireccion = async (datos) => {
    if (!user?.uid) return;
    setErrorGuardado("");

    const esNueva = !editando;

    // Doble defensa: la UI ya lo impide, pero se revalida antes de escribir.
    if (esNueva && direcciones.length >= limite) {
      setErrorGuardado("Alcanzaste el límite de ubicaciones de tu plan.");
      return;
    }
    if (!dentroDeZona(datos.lat, datos.lng)) {
      setErrorGuardado("Esa ubicación está fuera de nuestra zona de entrega.");
      return;
    }

    const ahora = Date.now();
    const registro = {
      id: editando?.id || nuevoId(),
      etiqueta: (datos.etiqueta || "Casa").trim().slice(0, 24),
      direccion: datos.direccion.trim().slice(0, 160),
      referencia: (datos.referencia || "").trim().slice(0, 160),
      // 6 decimales ≈ 11 cm. Date.now() y no serverTimestamp(): Firestore
      // rechaza los sentinelas dentro de elementos de array.
      lat: Number(datos.lat.toFixed(6)),
      lng: Number(datos.lng.toFixed(6)),
      ciudad: datos.ciudad || "Cuenca",
      predeterminada: esNueva
        ? direcciones.length === 0
        : !!editando.predeterminada,
      creadaEn: editando?.creadaEn || ahora,
      actualizadaEn: ahora,
    };

    const lista = esNueva
      ? [...direcciones, registro]
      : direcciones.map((d) => (d.id === registro.id ? registro : d));

    setGuardando(true);
    try {
      await persistir(lista);
      setVista("lista");
      setEditando(null);
      mostrarToast("Ubicación guardada ✅");
    } catch {
      setErrorGuardado("No pudimos guardar la ubicación. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const marcarPredeterminada = async (id) => {
    const lista = direcciones.map((d) => ({
      ...d,
      predeterminada: d.id === id,
      actualizadaEn: d.id === id ? Date.now() : d.actualizadaEn,
    }));
    try {
      await persistir(lista);
      mostrarToast("Ubicación predeterminada actualizada ✅");
    } catch {
      mostrarToast("No pudimos actualizar. Intenta de nuevo.");
    }
  };

  const eliminarDireccion = async (id) => {
    const lista = direcciones.filter((d) => d.id !== id);
    // Si se borró la predeterminada, se promueve la primera restante.
    if (lista.length && !lista.some((d) => d.predeterminada)) {
      lista[0] = { ...lista[0], predeterminada: true };
    }
    setConfirmandoBorrado(null);
    try {
      await persistir(lista);
      mostrarToast("Ubicación eliminada");
    } catch {
      mostrarToast("No pudimos eliminar. Intenta de nuevo.");
    }
  };

  const abrirMapa = (direccion = null) => {
    setEditando(direccion);
    setErrorGuardado("");
    setVista("mapa");
  };

  /* --------------------------------------------------------------- */
  /* Plan Free: pantalla bloqueada                                    */
  /* --------------------------------------------------------------- */
  if (plan === "free") {
    return (
      <div className="usuario-seccion">
        <div className="usuario-seccion-head">
          <span className="usuario-seccion-badge">🛵 Delivery</span>
          <h2 className="usuario-seccion-title">Entrega a domicilio</h2>
          <p className="usuario-seccion-sub">
            Recibe tus platos donde estés, sin moverte de casa.
          </p>
        </div>

        <div className="delivery-lock">
          {/* Mapa insinuado, 100% CSS: cero peticiones y cero KB de Leaflet. */}
          <div className="delivery-lock-mapa" aria-hidden="true">
            <span className="delivery-lock-grid" />
            <span className="delivery-lock-ruta" />
            <span className="delivery-lock-pin">📍</span>
          </div>

          <div className="delivery-lock-overlay">
            <span className="delivery-lock-glow" aria-hidden="true" />
            <span className="delivery-lock-candado">🔒</span>
            <span className="delivery-lock-badge">
              Exclusivo Starter y Premium
            </span>
            <h3 className="delivery-lock-titulo">Tu comida, hasta tu puerta</h3>
            <p className="delivery-lock-texto">
              Elige en el mapa el punto exacto donde quieres recibir tus platos:
              tu casa, la oficina o donde estés. Guarda tus ubicaciones
              favoritas y cambia entre ellas cuando quieras.
            </p>
            <ul className="delivery-lock-perks">
              <li>📍 Elige tu punto exacto en el mapa</li>
              <li>🏠 Hasta 2 ubicaciones con Starter</li>
              <li>💼 Hasta 3 ubicaciones con Premium</li>
              <li>⚡ Prioridad en entregas con Premium</li>
            </ul>
            {/* Botón y no <a href="#...">: la app usa HashRouter y un ancla
                rompería la ruta. */}
            <button
              type="button"
              className="delivery-lock-cta"
              onClick={() =>
                document
                  .getElementById("delivery-planes")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Desbloquear entrega a domicilio →
            </button>
          </div>
        </div>

        <div className="delivery-planes" id="delivery-planes">
          <div className="usuario-seccion-head">
            <span className="usuario-seccion-badge">✨ Planes</span>
            <h3 className="usuario-seccion-title">Elige tu plan</h3>
            <p className="usuario-seccion-sub">
              Suscríbete y activa la entrega a domicilio hoy mismo.
            </p>
          </div>
          <Planos ctaLabel="Suscribirse" />
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- */
  /* Pantalla de mapa                                                 */
  /* --------------------------------------------------------------- */
  if (vista === "mapa") {
    return (
      <div className="usuario-seccion">
        <Suspense
          fallback={
            <div className="delivery-mapa-cargando">
              <span className="delivery-spinner delivery-spinner--lg" />
              <p>Cargando el mapa…</p>
            </div>
          }
        >
          <DeliveryMapa
            key={editando?.id || "nueva"}
            inicial={editando}
            guardando={guardando}
            errorGuardado={errorGuardado}
            onCancelar={() => {
              setVista("lista");
              setEditando(null);
              setErrorGuardado("");
            }}
            onConfirmar={guardarDireccion}
          />
        </Suspense>
      </div>
    );
  }

  /* --------------------------------------------------------------- */
  /* Lista de ubicaciones                                             */
  /* --------------------------------------------------------------- */
  const alcanzoLimite = direcciones.length >= limite;

  return (
    <div className="usuario-seccion">
      {toast && <p className="delivery-toast">{toast}</p>}

      <div className="usuario-seccion-head">
        <span className="usuario-seccion-badge">🛵 Delivery</span>
        <h2 className="usuario-seccion-title">Entrega a domicilio</h2>
        <p className="usuario-seccion-sub">
          Elige en el mapa dónde quieres recibir tu comida. Guarda tus lugares
          favoritos y cambia entre ellos cuando quieras.
        </p>
      </div>

      {/* Los pedidos en curso van primero: es lo que el usuario viene a mirar.
          Se carga solo (Firestore) y no depende del estado de ubicaciones. */}
      <MisEntregas />

      {cargando && direcciones.length === 0 ? (
        <div className="delivery-lista">
          <span className="delivery-skel delivery-skel--card" />
          <span className="delivery-skel delivery-skel--card" />
        </div>
      ) : errorCarga && direcciones.length === 0 ? (
        <div className="usuario-empty">
          <span className="usuario-empty-icon">😕</span>
          <h3 className="usuario-empty-title">
            No pudimos cargar tus ubicaciones
          </h3>
          <p className="usuario-empty-text">
            Revisa tu conexión e inténtalo de nuevo.
          </p>
          <button
            type="button"
            className="usuario-empty-btn"
            onClick={() => {
              setCargando(true);
              setRecarga((n) => n + 1);
            }}
          >
            <span className="usuario-empty-btn-icon">🔄</span>
            Reintentar
          </button>
        </div>
      ) : direcciones.length === 0 ? (
        <div className="usuario-empty">
          <span className="usuario-empty-icon">🗺️</span>
          <h3 className="usuario-empty-title">
            Aún no tienes ubicaciones guardadas
          </h3>
          <p className="usuario-empty-text">
            Elige en el mapa dónde quieres recibir tus platos. Con tu plan{" "}
            {NOMBRE_PLAN[plan]} puedes guardar hasta {limite}{" "}
            {limite === 1 ? "ubicación" : "ubicaciones"}.
          </p>
          <button
            type="button"
            className="usuario-empty-btn"
            onClick={() => abrirMapa()}
          >
            <span className="usuario-empty-btn-icon">📍</span>
            Agregar ubicación
          </button>
        </div>
      ) : (
        <>
          <p className="delivery-contador">
            {direcciones.length} de {limite}{" "}
            {limite === 1 ? "ubicación" : "ubicaciones"} · Plan{" "}
            {NOMBRE_PLAN[plan]}
          </p>

          <div className="delivery-lista">
            {direcciones.map((d) => (
              <article
                key={d.id}
                className={`delivery-card ${
                  d.predeterminada ? "is-default" : ""
                }`}
              >
                {confirmandoBorrado === d.id ? (
                  <div className="delivery-card-borrar">
                    <p className="delivery-card-borrar-txt">
                      ¿Eliminar esta ubicación?
                    </p>
                    <div className="delivery-card-acciones">
                      <button
                        type="button"
                        className="delivery-card-btn"
                        onClick={() => setConfirmandoBorrado(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="delivery-card-btn delivery-card-btn--danger"
                        onClick={() => eliminarDireccion(d.id)}
                      >
                        Sí, eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="delivery-card-top">
                      <span className="delivery-card-icon">
                        {iconoEtiqueta(d.etiqueta)}
                      </span>
                      <div className="delivery-card-info">
                        <h3 className="delivery-card-etiqueta">{d.etiqueta}</h3>
                        <p className="delivery-card-dir">{d.direccion}</p>
                        {d.referencia && (
                          <p className="delivery-card-ref">{d.referencia}</p>
                        )}
                      </div>
                      {d.predeterminada && (
                        <span className="delivery-card-badge">
                          ● Predeterminada
                        </span>
                      )}
                    </div>

                    <div className="delivery-card-acciones">
                      {!d.predeterminada && (
                        <button
                          type="button"
                          className="delivery-card-btn"
                          onClick={() => marcarPredeterminada(d.id)}
                        >
                          Usar por defecto
                        </button>
                      )}
                      <button
                        type="button"
                        className="delivery-card-btn"
                        onClick={() => abrirMapa(d)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        className="delivery-card-btn delivery-card-btn--danger"
                        onClick={() => setConfirmandoBorrado(d.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>

          {alcanzoLimite ? (
            <p className="delivery-limite">
              Alcanzaste el límite de {limite}{" "}
              {limite === 1 ? "ubicación" : "ubicaciones"} de tu plan{" "}
              {NOMBRE_PLAN[plan]}.
              {plan === "starter" && " Con Premium puedes guardar hasta 3."}
            </p>
          ) : (
            <button
              type="button"
              className="delivery-add-btn"
              onClick={() => abrirMapa()}
            >
              📍 Agregar otra ubicación
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Delivery;
