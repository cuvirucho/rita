import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../Auth/AuthContext";
import { db } from "../FIRBAS/Firebase";
import {
  APERTURA_HHMM,
  CIERRE_HHMM,
  estaAbierto,
  HORA_APERTURA,
  HORA_CIERRE,
  HORARIO_TEXTO,
  iconoEtiqueta,
  LIMITE_ENTREGAS,
  minutosDe,
  minutosDeFecha,
  NOMBRE_PLAN,
  planDelivery,
} from "../UsuarioHome/secciones/deliveryUtils";
import { entregasUsadas } from "./menuStorage";

const pad = (n) => String(n).padStart(2, "0");

// "HH:MM" de la hora local actual, el formato que espera <input type="time">.
const horaActual = () => {
  const ahora = new Date();
  return `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
};

const fechaLocalISO = (fecha) =>
  `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;

/**
 * Estado inicial del paso 2 según el reloj.
 *
 * "Cerrado" son dos situaciones distintas y NO se pueden tratar igual:
 *   - Antes de abrir (6 AM): Rita abre en unas horas, el pedido sigue siendo
 *     para HOY a partir de las 8:00.
 *   - Después de cerrar (19 PM): hoy ya no cabe nada, va a mañana.
 * En ambas "Ahora" queda descartado, pero solo la segunda fuerza mañana.
 *
 * Se calcula una sola vez al montar (useState perezoso) para que las piezas
 * — hora, tipo y día — no salgan de lecturas distintas del reloj si el montaje
 * cae justo en el minuto del cierre.
 */
const entregaInicial = () => {
  const ahora = new Date();
  const abierto = estaAbierto(ahora);
  const cerradoPorHoy = minutosDeFecha(ahora) >= HORA_CIERRE * 60;
  return {
    abierto,
    cerradoPorHoy,
    hora: abierto ? horaActual() : APERTURA_HHMM,
    tipo: abierto ? "ahora" : "programada",
    manana: cerradoPorHoy,
  };
};

/**
 * Modal de pedido en dos pasos: ubicación de entrega → hora de entrega.
 * Al confirmar escribe un documento en la colección `entregas` con el uid del
 * usuario, los platos elegidos, la ubicación completa y la hora.
 *
 * Reutiliza el shell de modal del proyecto (.trial-modal*, ver ModalReservar.jsx)
 * y los helpers de Delivery (planDelivery, iconoEtiqueta). Las direcciones NO son
 * una colección: viven en UsuariosActivos/{uid}.direccionesEntrega.
 *
 * `pedidosDia` es { comida: detalle } de lo YA pedido ese día. De ahí salen las
 * dos reglas del cupo: solo se ofrece lo que falta, y el plan paga un número de
 * entregas al día (LIMITE_ENTREGAS) en cuya última todo lo pendiente viaja junto.
 */
const ModalOrdenar = ({
  dia,
  diaLabel,
  mealKey,
  comidas,
  pedidosDia = {},
  onCerrar,
  onPedido,
}) => {
  const { user, perfil } = useAuth();
  const plan = planDelivery(perfil);
  const esFree = plan === "free";

  const [inicio] = useState(entregaInicial);

  const [paso, setPaso] = useState("ubicacion"); // ubicacion | hora | exito
  // Hidratación optimista desde el perfil; el getDoc de abajo manda.
  const [direcciones, setDirecciones] = useState(() =>
    Array.isArray(perfil?.direccionesEntrega) ? perfil.direccionesEntrega : [],
  );
  const [cargando, setCargando] = useState(true);
  const [ubicacionId, setUbicacionId] = useState(null);
  const [extras, setExtras] = useState(() => new Set()); // otros platos del día
  const [hora, setHora] = useState(inicio.hora);
  const [tipoEntrega, setTipoEntrega] = useState(inicio.tipo); // ahora | programada
  const [paraManana, setParaManana] = useState(inicio.manana);
  // Estado y no constantes: confirmar() las actualiza si el modal se quedó
  // abierto hasta pasada la hora de cierre.
  const [abierto, setAbierto] = useState(inicio.abierto);
  const [cerradoPorHoy, setCerradoPorHoy] = useState(inicio.cerradoPorHoy);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  // Foto de lo enviado para la pantalla de éxito: al registrar el pedido el
  // padre marca esas comidas como pedidas, así que tanto `seleccionadas` como
  // el número de entrega se mueven bajo los pies de esa pantalla.
  const [enviado, setEnviado] = useState(null); // { platos, numero }

  /* ----------------------------------------------------------------- */
  /* Carga de ubicaciones guardadas                                     */
  /* ----------------------------------------------------------------- */
  useEffect(() => {
    if (esFree || !user?.uid) {
      setCargando(false);
      return;
    }
    let vivo = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "UsuariosActivos", user.uid));
        if (!vivo) return;
        const datos = snap.exists() ? snap.data() : null;
        if (Array.isArray(datos?.direccionesEntrega)) {
          setDirecciones(datos.direccionesEntrega);
        }
      } catch {
        // Se conserva lo hidratado desde el perfil.
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [user?.uid, esFree]);

  // Preselecciona la predeterminada (o la primera) y REPARA la selección cuando
  // el getDoc autoritativo deja fuera el id hidratado desde un perfil obsoleto
  // (AuthContext lee el perfil una sola vez y no lo refresca). La condición no
  // es "¿hay algo elegido?" sino "¿lo elegido sigue existiendo?": si no, la
  // tarjeta no se marca y `ubicacion` se queda en null con el id huérfano.
  useEffect(() => {
    if (direcciones.length === 0) {
      if (ubicacionId) setUbicacionId(null);
      return;
    }
    if (direcciones.some((d) => d.id === ubicacionId)) return;
    const pre = direcciones.find((d) => d.predeterminada) || direcciones[0];
    setUbicacionId(pre.id);
  }, [direcciones, ubicacionId]);

  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  /* ----------------------------------------------------------------- */
  /* Derivados                                                          */
  /* ----------------------------------------------------------------- */
  const ubicacion = direcciones.find((d) => d.id === ubicacionId) || null;

  // Lo que aún no ha salido en ninguna entrega: un plato ya pedido no se vuelve
  // a ofrecer, ni como principal ni como extra.
  const pendientes = useMemo(
    () => comidas.filter((c) => !pedidosDia[c.key]),
    [comidas, pedidosDia],
  );
  const otras = pendientes.filter((c) => c.key !== mealKey);

  /* --- Cupo de entregas del día -------------------------------------- */
  const cupo = LIMITE_ENTREGAS[plan] ?? 0;
  const usadas = entregasUsadas(pedidosDia);
  const numeroEntrega = usadas + 1; // la que se está armando ahora
  const sinCupo = usadas >= cupo || pendientes.length === 0;
  // En la última entrega que le queda al plan no puede quedarse comida fuera:
  // se manda todo lo pendiente, sin opción a desmarcar.
  const esUltima = !sinCupo && numeroEntrega >= cupo;

  const seleccionadas = useMemo(
    () =>
      esUltima
        ? pendientes
        : pendientes.filter((c) => c.key === mealKey || extras.has(c.key)),
    [pendientes, mealKey, extras, esUltima],
  );

  const toggleExtra = (key) => {
    setExtras((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const usarAhora = () => {
    setError("");
    setHora(horaActual());
    setTipoEntrega("ahora");
    setParaManana(false);
  };

  const elegirDia = (manana) => {
    setError("");
    setParaManana(manana);
    // "Ahora" solo existe para hoy: agendar mañana implica hora programada.
    if (manana) {
      setTipoEntrega("programada");
      return;
    }
    // Al volver a HOY la hora elegida para mañana puede haber quedado en el
    // pasado, lo que deshabilitaba el botón de confirmar sin salida evidente.
    // Se reajusta al reloj, que es lo que el usuario espera al pulsar "Hoy".
    if (abierto && minutosDe(hora) < minutosDeFecha(new Date())) usarAhora();
  };

  /**
   * Mensaje de error de la hora elegida, o "" si es válida.
   *
   * El `max`/`min` del <input type="time"> es solo una ayuda visual: muchos
   * selectores de móvil los ignoran, así que esta es la validación que manda.
   */
  const problemaHora = (valor = hora) => {
    const min = minutosDe(valor);
    if (!Number.isFinite(min)) return "Elige una hora válida.";
    // El cierre es inclusivo como hora de entrega: 18:00 es el último turno.
    if (min < HORA_APERTURA * 60 || min > HORA_CIERRE * 60) {
      return `Entregamos de ${HORARIO_TEXTO}.`;
    }
    // "Ahora" se refresca contra el reloj al confirmar, así que no se le
    // aplica esta comprobación: quedaría "en el pasado" por un minuto de más
    // que el usuario tarde en pulsar Confirmar.
    if (tipoEntrega !== "ahora" && !paraManana && min < minutosDeFecha(new Date())) {
      return "Esa hora ya pasó. Elige otra o programa para mañana.";
    }
    return "";
  };

  const avisoHora = problemaHora();
  // Con la preselección reparándose sola no debería verse nunca, pero si la
  // ubicación elegida desaparece el botón no puede quedarse gris y mudo.
  const avisoUbicacion = ubicacion ? "" : "Elige una ubicación de entrega.";

  const textoEntrega =
    tipoEntrega === "ahora"
      ? `Ahora (${hora})`
      : `${paraManana ? "Mañana" : "Hoy"} a las ${hora}`;

  /* ----------------------------------------------------------------- */
  /* Confirmación → escritura en `entregas`                             */
  /* ----------------------------------------------------------------- */
  const confirmar = async () => {
    if (guardando) return; // único return mudo legítimo: el envío ya está en curso

    // Un `return` silencioso aquí deja el botón sin efecto y sin explicación:
    // cada motivo por el que no se puede enviar tiene que verse en pantalla.
    if (!user?.uid) {
      setError("Tu sesión expiró. Vuelve a entrar para completar el pedido.");
      return;
    }
    if (!ubicacion) {
      setError("Esa ubicación ya no está disponible. Elige otra.");
      setPaso("ubicacion");
      return;
    }
    if (seleccionadas.length === 0) {
      setError("No queda ningún plato pendiente en este envío.");
      return;
    }
    // `hora` vacía no se comprueba aquí: problemaHora() ya devuelve
    // "Elige una hora válida." unas líneas más abajo.

    const ahora = new Date();

    // El modal pudo quedar abierto mientras daban las 18:00. Sin esta segunda
    // comprobación entraría un pedido para hoy con la cocina ya cerrada.
    // Solo mira el cierre: antes de abrir, hoy sigue siendo válido.
    if (!paraManana && minutosDeFecha(ahora) >= HORA_CIERRE * 60) {
      setAbierto(false);
      setCerradoPorHoy(true);
      setParaManana(true);
      setTipoEntrega("programada");
      setHora(APERTURA_HHMM);
      setError(
        `Rita acaba de cerrar. Atendemos de ${HORARIO_TEXTO}, así que tu entrega pasa a mañana: revisa la hora y confirma.`,
      );
      return;
    }

    // "Ahora" se refresca contra el reloj: entre abrir el paso 2 y pulsar
    // Confirmar pueden pasar minutos.
    const horaFinal = tipoEntrega === "ahora" ? horaActual() : hora;

    const problema = problemaHora(horaFinal);
    if (problema) {
      setError(problema);
      return;
    }

    setGuardando(true);
    setError("");

    const [hh, mm] = horaFinal.split(":").map(Number);
    const programadaPara = new Date(ahora);
    if (paraManana) programadaPara.setDate(programadaPara.getDate() + 1);
    programadaPara.setHours(hh, mm, 0, 0);

    const items = seleccionadas.map(({ key, label, details }) => ({
      comida: key,
      label,
      nombre: details?.nombre ?? "",
      descripcion: details?.descripcion ?? "",
      calorias: details?.calorias ?? null,
      proteinas: details?.proteinas ?? null,
      ingredientes: details?.ingredientes ?? null,
      vitaminas: details?.vitaminas ?? null,
      minerales: details?.minerales ?? null,
    }));

    try {
      const ref = await addDoc(collection(db, "entregas"), {
        uid: user.uid,
        correo: user.email || "",
        nombre: perfil?.nombre || user.displayName || "",
        plan,
        origen: "menu_semanal_ia",
        dia,
        diaLabel,
        items,
        // Copia completa de la dirección: el pedido no debe cambiar si el
        // usuario luego edita o borra esa ubicación en la sección Delivery.
        ubicacion,
        entrega: {
          tipo: tipoEntrega,
          hora: horaFinal,
          paraManana,
          // OJO: es la fecha de ENTREGA, no la de creación del pedido. La de
          // creación vive en `creadaEn`.
          fechaISO: fechaLocalISO(programadaPara),
          programadaPara,
        },
        estado: "pendiente",
        creadaEn: serverTimestamp(),
      });
      // Marca todas las comidas del envío, no solo mealKey: el paso 1 permite
      // sumar otros platos del día al mismo pedido.
      onPedido?.(
        seleccionadas.map((c) => c.key),
        {
          hora: horaFinal,
          paraManana,
          tipo: tipoEntrega,
          etiqueta: ubicacion.etiqueta,
          // Mismo id para todas las comidas del envío: así se cuentan entregas
          // y no platos, y se puede cancelar el envío completo.
          entregaId: ref.id,
          programadaParaMs: programadaPara.getTime(),
        },
      );
      setEnviado({ platos: seleccionadas, numero: numeroEntrega });
      setHora(horaFinal); // la pantalla de éxito muestra la hora ya definitiva
      setPaso("exito");
    } catch (err) {
      console.error("[ModalOrdenar] addDoc entregas falló", err);
      setError("No pudimos registrar tu pedido. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  /* ----------------------------------------------------------------- */
  /* Contenido según el paso                                            */
  /* ----------------------------------------------------------------- */
  const contenido = () => {
    // --- Plan Free: solo upsell, nunca se consulta Firestore ---
    if (esFree) {
      return (
        <>
          <span className="trial-modal-icon">🔒</span>
          <h2 className="trial-modal-title">La entrega es de Starter y Premium</h2>
          <p className="trial-modal-desc">
            Con un plan <strong>Starter</strong> o <strong>Premium</strong>{" "}
            recibes los platos de tu menú en la puerta de tu casa, eliges dónde y
            a qué hora. Mejora tu plan para activarlo.
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={onCerrar}>
            Entendido
          </button>
        </>
      );
    }

    // --- Paso 3: confirmación ---
    if (paso === "exito") {
      return (
        <>
          <span className="trial-modal-icon">✅</span>
          <h2 className="trial-modal-title">¡Pedido registrado!</h2>
          <p className="trial-modal-desc">
            {enviado?.platos.length === 1
              ? "Tu plato llega"
              : `Tus ${enviado?.platos.length ?? 0} platos llegan`}{" "}
            a <strong>{ubicacion?.etiqueta}</strong>{" "}
            {tipoEntrega === "ahora"
              ? "lo antes posible"
              : `${paraManana ? "mañana" : "hoy"} a las ${hora}`}
            .
          </p>
          {/* Cuántas entregas del día quedan tras esta, para que el cupo no sea
              una sorpresa la próxima vez que abra el modal. */}
          <p className="orden-cupo orden-cupo--exito">
            🛵 Entrega {enviado?.numero} de {cupo} de {diaLabel}
            {(enviado?.numero ?? 0) >= cupo
              ? " · era la última de este día"
              : pendientes.length === 0
                ? " · ya no te queda nada por pedir"
                : ` · te queda${cupo - enviado.numero === 1 ? "" : "n"} ${
                    cupo - enviado.numero
                  }`}
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={onCerrar}>
            Listo
          </button>
        </>
      );
    }

    // --- Sin entregas disponibles para este día ---
    // Va antes que el paso 1 para no cargar ubicaciones que no se van a usar.
    if (sinCupo) {
      const todoPedido = pendientes.length === 0;
      return (
        <>
          <span className="trial-modal-icon">{todoPedido ? "✅" : "🛵"}</span>
          <h2 className="trial-modal-title">
            {todoPedido
              ? `Ya pediste todo el ${diaLabel}`
              : `Usaste tus ${cupo} entregas del ${diaLabel}`}
          </h2>
          <p className="trial-modal-desc">
            {todoPedido ? (
              <>
                Todas las comidas de este día están en camino. Puedes seguir el
                pedido en <strong>🛵 Delivery</strong>.
              </>
            ) : (
              <>
                Tu plan <strong>{NOMBRE_PLAN[plan]}</strong> incluye {cupo}{" "}
                entregas por día y ya las usaste. Puedes pedir estos platos en
                otro día del menú.
              </>
            )}
          </p>
          {!todoPedido && plan === "starter" && (
            <p className="orden-cupo orden-cupo--upsell">
              ✨ Con <strong>Premium</strong> son{" "}
              {LIMITE_ENTREGAS.premium} entregas al día.
            </p>
          )}
          <button type="button" className="btn btn-primary btn-lg" onClick={onCerrar}>
            Entendido
          </button>
        </>
      );
    }

    // --- Paso 1: ubicación + platos extra ---
    if (paso === "ubicacion") {
      if (cargando && direcciones.length === 0) {
        return (
          <>
            <h2 className="trial-modal-title">¿Dónde lo enviamos?</h2>
            <div className="orden-skels">
              <span className="orden-skel" />
              <span className="orden-skel" />
            </div>
          </>
        );
      }

      if (direcciones.length === 0) {
        return (
          <>
            <span className="trial-modal-icon">🗺️</span>
            <h2 className="trial-modal-title">Aún no tienes ubicaciones</h2>
            <p className="trial-modal-desc">
              Para pedir este plato primero guarda una ubicación de entrega. Ve a
              la sección <strong>🛵 Delivery</strong> del menú y elige en el mapa
              dónde quieres recibir tu comida.
            </p>
            <button type="button" className="btn btn-primary btn-lg" onClick={onCerrar}>
              Entendido
            </button>
          </>
        );
      }

      return (
        <>
          <h2 className="trial-modal-title">¿Dónde lo enviamos?</h2>
          <p className="orden-sub">
            Elige la ubicación para tu pedido de {diaLabel}.
          </p>

          {/* El cupo se anuncia antes de elegir nada: en la última entrega
              cambia lo que el usuario puede y no puede desmarcar. */}
          <p className="orden-cupo">
            🛵 Entrega {numeroEntrega} de {cupo} de {diaLabel} · plan{" "}
            {NOMBRE_PLAN[plan]}
            {plan === "starter" && (
              <span className="orden-cupo-upsell">
                {" "}
                · con Premium son {LIMITE_ENTREGAS.premium}
              </span>
            )}
          </p>

          <div className="orden-ubis" role="radiogroup" aria-label="Ubicación de entrega">
            {direcciones.map((d) => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={ubicacionId === d.id}
                className={`orden-ubi ${ubicacionId === d.id ? "is-sel" : ""}`}
                onClick={() => setUbicacionId(d.id)}
              >
                <span className="orden-ubi-icon">{iconoEtiqueta(d.etiqueta)}</span>
                <span className="orden-ubi-info">
                  <span className="orden-ubi-etiqueta">
                    {d.etiqueta}
                    {d.predeterminada && (
                      <span className="orden-ubi-badge">Predeterminada</span>
                    )}
                  </span>
                  <span className="orden-ubi-dir">{d.direccion}</span>
                  {d.referencia && (
                    <span className="orden-ubi-ref">{d.referencia}</span>
                  )}
                </span>
                <span className="orden-ubi-check" aria-hidden="true">
                  {ubicacionId === d.id ? "●" : ""}
                </span>
              </button>
            ))}
          </div>

          {otras.length > 0 && (
            <div className="orden-extras">
              <h3 className="orden-block-title">
                {esUltima
                  ? "📦 Todo esto va en este envío"
                  : "➕ ¿Quieres agregar algo más a este envío?"}
              </h3>

              {/* Última entrega del día: nada puede quedarse fuera, así que las
                  casillas se marcan solas y se bloquean. */}
              {esUltima && (
                <p className="orden-ultima" role="status">
                  <span className="orden-ultima-icon" aria-hidden="true">
                    ⚠️
                  </span>
                  <span>
                    Es tu <strong>última entrega del {diaLabel}</strong> ({cupo}{" "}
                    de {cupo} del plan {NOMBRE_PLAN[plan]}). Lo que falta por
                    pedir viaja todo en este envío.
                  </span>
                </p>
              )}

              {otras.map((c) => (
                <label
                  key={c.key}
                  className={`orden-extra ${
                    esUltima || extras.has(c.key) ? "is-sel" : ""
                  } ${esUltima ? "is-forzado" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="orden-extra-check"
                    checked={esUltima || extras.has(c.key)}
                    disabled={esUltima}
                    onChange={() => toggleExtra(c.key)}
                  />
                  <span className="orden-extra-icon">{c.icono}</span>
                  <span className="orden-extra-info">
                    <span className="orden-extra-tipo">{c.label}</span>
                    <span className="orden-extra-nombre">{c.details?.nombre}</span>
                  </span>
                  {c.details?.calorias != null && (
                    <span className="orden-extra-cal">
                      {c.details.calorias} kcal
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="orden-acciones">
            <button type="button" className="btn btn-ghost" onClick={onCerrar}>
              Cancelar
            </button>
            {/* Valida la ubicación resuelta, no que el id sea truthy: un id
                huérfano dejaba pasar al paso 2 sin nada seleccionado. */}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!ubicacion}
              onClick={() => setPaso("hora")}
            >
              Continuar →
            </button>
          </div>
        </>
      );
    }

    // --- Paso 2: hora de entrega ---
    return (
      <>
        <h2 className="trial-modal-title">¿A qué hora la quieres?</h2>
        <p className="orden-sub">
          {abierto
            ? "Pídela ya mismo o programa la hora que mejor te venga."
            : `Atendemos de ${HORARIO_TEXTO}.`}
        </p>

        {!abierto && (
          <div className="orden-cerrado" role="status">
            <span className="orden-cerrado-icon" aria-hidden="true">
              {cerradoPorHoy ? "🌙" : "🌅"}
            </span>
            <span className="orden-cerrado-txt">
              {cerradoPorHoy ? (
                <>
                  <strong>Rita ya cerró por hoy.</strong> Atendemos de{" "}
                  {HORARIO_TEXTO}, así que tu pedido se entrega{" "}
                  <strong>mañana</strong>.
                </>
              ) : (
                <>
                  <strong>Rita todavía no abre.</strong> Atendemos de{" "}
                  {HORARIO_TEXTO}: elige una hora a partir de las{" "}
                  {APERTURA_HHMM}.
                </>
              )}
            </span>
          </div>
        )}

        <button
          type="button"
          className={`orden-ahora ${tipoEntrega === "ahora" ? "is-sel" : ""}`}
          onClick={usarAhora}
          disabled={!abierto}
        >
          <span className="orden-ahora-icon">⚡</span>
          <span className="orden-ahora-txt">
            <span className="orden-ahora-titulo">Ahora</span>
            <span className="orden-ahora-desc">
              {abierto
                ? "Lo preparamos de inmediato"
                : `Disponible de ${HORARIO_TEXTO}`}
            </span>
          </span>
        </button>

        {/* Pasada la hora de cierre no hay elección: la entrega es mañana.
            Antes de abrir sí se ofrece, porque hoy sigue siendo posible. */}
        {!cerradoPorHoy && (
          <div className="orden-dia">
            <h3 className="orden-block-title">📅 ¿Qué día?</h3>
            <div
              className="orden-dia-toggle"
              role="radiogroup"
              aria-label="Día de entrega"
            >
              <button
                type="button"
                role="radio"
                aria-checked={!paraManana}
                className={`orden-dia-btn ${!paraManana ? "is-sel" : ""}`}
                onClick={() => elegirDia(false)}
              >
                Hoy
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={paraManana}
                className={`orden-dia-btn ${paraManana ? "is-sel" : ""}`}
                onClick={() => elegirDia(true)}
              >
                Mañana
              </button>
            </div>
          </div>
        )}

        <div className="orden-hora">
          <h3 className="orden-block-title">
            {abierto
              ? "🕒 O elige una hora"
              : `🕒 Hora de entrega ${paraManana ? "de mañana" : "de hoy"}`}
          </h3>
          <input
            type="time"
            className="orden-hora-input"
            value={hora}
            min={APERTURA_HHMM}
            max={CIERRE_HHMM}
            onChange={(e) => {
              setError(""); // un mensaje viejo no puede sobrevivir a la corrección
              setHora(e.target.value);
              setTipoEntrega("programada");
            }}
          />
        </div>

        <div className="orden-resumen">
          <h3 className="orden-block-title">Resumen</h3>
          <ul className="orden-resumen-lista">
            {seleccionadas.map((c) => (
              <li key={c.key} className="orden-resumen-item">
                <span>
                  {c.icono} {c.details?.nombre}
                </span>
                <span className="orden-resumen-tipo">{c.label}</span>
              </li>
            ))}
          </ul>
          <p className="orden-resumen-linea">
            📍 {ubicacion?.etiqueta} · {ubicacion?.direccion}
          </p>
          <p className="orden-resumen-linea">🕒 {textoEntrega}</p>
        </div>

        {(error || avisoUbicacion || avisoHora) && (
          <p className="orden-error">{error || avisoUbicacion || avisoHora}</p>
        )}

        <div className="orden-acciones">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPaso("ubicacion")}
            disabled={guardando}
          >
            ← Atrás
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={confirmar}
            disabled={guardando || !ubicacion || !hora || !!avisoHora}
          >
            {guardando ? "Enviando…" : "Confirmar pedido"}
          </button>
        </div>
      </>
    );
  };

  const conPasos = !esFree && paso !== "exito" && direcciones.length > 0;

  // Portal a <body> a propósito: .rita-menu y .usuario-seccion-wrap animan con
  // `fadeInUp … both`, y ese transform residual los convierte en bloque
  // contenedor de los descendientes `position: fixed`. Sin el portal, el
  // overlay se centraría a media altura del menú en lugar del viewport.
  // Los portales de React conservan el burbujeo de eventos, así que el
  // onClick del fondo y el stopPropagation siguen funcionando igual.
  return createPortal(
    <div className="trial-modal-overlay" onClick={onCerrar}>
      <div
        className="trial-modal trial-modal--orden"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="trial-modal-close"
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {conPasos && (
          <div className="orden-pasos" aria-hidden="true">
            <span className="orden-paso is-on">1</span>
            <span className="orden-paso-linea" />
            <span className={`orden-paso ${paso === "hora" ? "is-on" : ""}`}>2</span>
          </div>
        )}

        {contenido()}
      </div>
    </div>,
    document.body,
  );
};

export default ModalOrdenar;
