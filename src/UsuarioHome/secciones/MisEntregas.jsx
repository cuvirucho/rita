import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../../Auth/AuthContext";
import { db } from "../../FIRBAS/Firebase";
import {
  ESTADOS_ENTREGA,
  esEstadoFinal,
  fechaDeValor,
  iconoEtiqueta,
  indiceEstado,
  infoEstado,
  textoFechaEntrega,
} from "./deliveryUtils";

// Cuántos pedidos cerrados se listan sin abrumar la pantalla.
const MAX_HISTORIAL = 5;

// Los platos del pedido como chips. Cae al tipo de comida ("Almuerzo") cuando
// el documento no guardó el nombre del plato.
const Platos = ({ items }) => (
  <div className="entrega-platos">
    {(items || []).map((it, i) => (
      <span className="entrega-chip" key={`${it.comida}-${i}`}>
        {it.nombre || it.label}
      </span>
    ))}
  </div>
);

/**
 * Seguimiento de 4 pasos. Se marca todo lo recorrido hasta el estado actual,
 * no solo el paso vigente, para que se lea como una barra de progreso.
 */
const Seguimiento = ({ estado }) => {
  const actual = indiceEstado(estado);

  return (
    <div
      className="entrega-pasos"
      role="img"
      aria-label={`Estado del pedido: ${infoEstado(estado).label}`}
    >
      {ESTADOS_ENTREGA.map((paso, i) => {
        const info = infoEstado(paso);
        return (
          <div className="entrega-paso-wrap" key={paso}>
            {i > 0 && (
              <span
                className={`entrega-paso-linea ${i <= actual ? "is-on" : ""}`}
                aria-hidden="true"
              />
            )}
            <span className={`entrega-paso ${i <= actual ? "is-on" : ""}`}>
              <span className="entrega-paso-icono" aria-hidden="true">
                {info.icono}
              </span>
              <span className="entrega-paso-label">{info.label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * "Mis entregas": el pedido en curso con su seguimiento y los ya cerrados.
 *
 * Vive en su propio archivo y no dentro de Delivery.jsx para no tocar el flujo
 * de ubicaciones, que ya funciona. Es solo lectura: el campo `estado` únicamente
 * lo puede mover el admin (ver la regla `allow update` de `entregas`).
 */
const MisEntregas = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setCargando(false);
      return;
    }

    // onSnapshot y no getDocs: el estado de la entrega es justo el dato que
    // debe refrescarse solo mientras el usuario mira la pantalla.
    //
    // Sin orderBy a propósito: `where` sobre un campo + `orderBy` sobre otro
    // exigiría un índice compuesto y este proyecto no despliega índices. Se
    // ordena en JS más abajo.
    const consulta = query(
      collection(db, "entregas"),
      where("uid", "==", user.uid),
    );

    const cancelar = onSnapshot(
      consulta,
      (snap) => {
        setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError(false);
        setCargando(false);
      },
      (err) => {
        console.error("[MisEntregas] onSnapshot entregas falló", err);
        setError(true);
        setCargando(false);
      },
    );

    return cancelar;
  }, [user?.uid]);

  const { activos, historial } = useMemo(() => {
    const conFecha = pedidos.map((p) => ({
      ...p,
      fecha: fechaDeValor(p.entrega?.programadaPara),
    }));

    // Sin fecha van al final: no se puede saber cuándo llegan.
    const porFecha = (dir) => (a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return dir * (a.fecha - b.fecha);
    };

    return {
      activos: conFecha.filter((p) => !esEstadoFinal(p.estado)).sort(porFecha(1)),
      historial: conFecha
        .filter((p) => esEstadoFinal(p.estado))
        .sort(porFecha(-1))
        .slice(0, MAX_HISTORIAL),
    };
  }, [pedidos]);

  if (cargando) {
    return (
      <div className="entregas-bloque">
        <span className="delivery-skel delivery-skel--card" />
      </div>
    );
  }

  // Un fallo al leer los pedidos no debe tapar la gestión de ubicaciones, que
  // es lo principal de la sección: se avisa en pequeño y se sigue.
  if (error) {
    return (
      <div className="entregas-bloque">
        <p className="entregas-error">
          😕 No pudimos cargar tus pedidos. Revisa tu conexión.
        </p>
      </div>
    );
  }

  if (activos.length === 0 && historial.length === 0) {
    return (
      <div className="entregas-bloque">
        <p className="entregas-vacio">
          🛵 Todavía no has pedido nada. Ve a{" "}
          <strong>📅 Plan de Comidas</strong> y pulsa <strong>Ordenar</strong> en
          el plato que quieras recibir.
        </p>
      </div>
    );
  }

  const proximo = activos[0];
  const otrosActivos = activos.slice(1);

  return (
    <div className="entregas-bloque">
      {proximo && (
        <>
          <h3 className="entregas-titulo">🛵 Tu próximo pedido</h3>
          <article className="entrega-card entrega-card--proxima">
            <div className="entrega-card-top">
              <span className="entrega-card-cuando">
                {textoFechaEntrega(proximo.fecha)}
              </span>
              <span className="entrega-card-estado">
                {infoEstado(proximo.estado).icono}{" "}
                {infoEstado(proximo.estado).label}
              </span>
            </div>

            <Platos items={proximo.items} />

            {proximo.ubicacion && (
              <p className="entrega-card-ubi">
                {iconoEtiqueta(proximo.ubicacion.etiqueta)}{" "}
                <strong>{proximo.ubicacion.etiqueta}</strong> ·{" "}
                {proximo.ubicacion.direccion}
              </p>
            )}

            <Seguimiento estado={proximo.estado} />

            <p className="entrega-card-desc">
              {infoEstado(proximo.estado).desc}
            </p>
          </article>
        </>
      )}

      {otrosActivos.length > 0 && (
        <>
          <h3 className="entregas-titulo">📦 También en curso</h3>
          <div className="entregas-lista">
            {otrosActivos.map((p) => (
              <article className="entrega-card" key={p.id}>
                <div className="entrega-card-top">
                  <span className="entrega-card-cuando">
                    {textoFechaEntrega(p.fecha)}
                  </span>
                  <span className="entrega-card-estado">
                    {infoEstado(p.estado).icono} {infoEstado(p.estado).label}
                  </span>
                </div>
                <Platos items={p.items} />
              </article>
            ))}
          </div>
        </>
      )}

      {historial.length > 0 && (
        <>
          <h3 className="entregas-titulo">🧾 Pedidos anteriores</h3>
          <ul className="entregas-historial">
            {historial.map((p) => (
              <li className="entrega-historial-item" key={p.id}>
                <span className="entrega-historial-icono" aria-hidden="true">
                  {infoEstado(p.estado).icono}
                </span>
                <span className="entrega-historial-txt">
                  <span className="entrega-historial-cuando">
                    {textoFechaEntrega(p.fecha)}
                  </span>
                  <span className="entrega-historial-platos">
                    {(p.items || [])
                      .map((it) => it.nombre || it.label)
                      .join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default MisEntregas;
