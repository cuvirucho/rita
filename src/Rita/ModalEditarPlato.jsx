import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import TypewriterText from "./TypewriterText";
import { regenerarPlato } from "./ritaApi";

const RITA_AVATAR =
  "https://res.cloudinary.com/db8e98ggo/image/upload/v1773700632/logoderita_1_o7wzjd.png";

let bubbleSeq = 0;
const nextId = () => `e${bubbleSeq++}`;

// Mismo criterio que ModalPlato: la IA devuelve "ingredientes" como objeto
// { nombre: cantidad }, pero no siempre. Aquí solo se listan los nombres, que es
// lo que cabe en la vista previa.
const nombresIngredientes = (ingredientes) => {
  if (!ingredientes) return [];
  if (Array.isArray(ingredientes)) return ingredientes.map(String);
  if (typeof ingredientes === "string") return [ingredientes];
  return Object.keys(ingredientes);
};

/**
 * Chat para cambiar un plato del menú.
 *
 * El usuario cuenta qué no le gusta y Rita propone otro plato del mismo tipo de
 * comida, respetando su perfil y la bodega (eso lo garantiza el backend, que es
 * el único que puede leerla).
 *
 * La propuesta NO se guarda sola: se muestra como vista previa y el menú solo
 * cambia cuando el usuario pulsa "Guardar plato". Así puede pedir varios
 * cambios seguidos sin perder el plato que ya tenía si ninguno le convence.
 *
 * Cada turno parte de la última propuesta (no del plato original), que es lo
 * que permite encadenar peticiones: "sin brócoli" y luego "y con más proteína".
 *
 * Reutiliza el shell .trial-modal* y el portal a <body> por el mismo motivo que
 * ModalPlato.jsx (transform residual de las animaciones del contenedor), y las
 * clases .rita-* del chat de RitaChat.jsx para las burbujas y el compositor.
 */
const ModalEditarPlato = ({
  icono,
  label,
  mealType,
  details,
  userId,
  onCerrar,
  onGuardar,
}) => {
  const [display, setDisplay] = useState(() => [
    {
      id: nextId(),
      from: "rita",
      // Saludo local: no gasta una llamada a la IA solo para abrir el chat.
      text: `¿Qué no te gusta de "${details.nombre}"? Cuéntame y te preparo otra opción 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  // Plato propuesto por Rita, pendiente de aceptar (null = aún no hay ninguno).
  const [propuesta, setPropuesta] = useState(null);
  // Plato ya aceptado: el modal pasa a la confirmación y se cierra solo.
  const [guardado, setGuardado] = useState(null);

  const scrollRef = useRef(null);
  // Memoria de la conversación que viaja al backend en cada turno.
  const historialRef = useRef([]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  // Estable entre renders para no reiniciar el typewriter de las burbujas ya
  // escritas cuando llega un mensaje nuevo.
  const scrollAbajo = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollAbajo();
  }, [display, escribiendo, propuesta, scrollAbajo]);

  // El cambio ya se aplicó al menú; esto solo da tiempo a leer la confirmación
  // antes de volver al menú, igual que el cierre de la conversación en
  // RitaChat. `onCerrar` es estable (useCallback en el padre), así que el
  // temporizador no se reinicia en cada render.
  useEffect(() => {
    if (!guardado) return;
    const id = setTimeout(onCerrar, 2400);
    return () => clearTimeout(id);
  }, [guardado, onCerrar]);

  const guardar = () => {
    // Se aplica primero y se confirma después: si el usuario cierra el modal
    // antes de que acabe el temporizador, el plato ya está cambiado igual.
    onGuardar(propuesta);
    setGuardado(propuesta);
  };

  const pushBubble = (from, text) => {
    setDisplay((prev) => [...prev, { id: nextId(), from, text }]);
  };

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || escribiendo) return;

    pushBubble("user", texto);
    historialRef.current = [
      ...historialRef.current,
      { from: "user", text: texto },
    ];
    setInput("");
    setEscribiendo(true);

    try {
      const data = await regenerarPlato({
        userId,
        mealType,
        // La última propuesta si ya la hay: los cambios se acumulan en vez de
        // volver siempre al plato original.
        currentMeal: propuesta ?? details,
        feedback: texto,
        historial: historialRef.current,
      });

      setEscribiendo(false);
      const mensaje = data.mensaje || "Te preparé otra opción 😊";
      historialRef.current = [
        ...historialRef.current,
        { from: "rita", text: mensaje },
      ];
      pushBubble("rita", mensaje);
      setPropuesta(data.plato);
    } catch {
      setEscribiendo(false);
      pushBubble(
        "rita",
        "Ups, tuve un problemita de conexión 😅. ¿Puedes intentarlo de nuevo?",
      );
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const ingredientes = nombresIngredientes(propuesta?.ingredientes);
  const totalProteinas =
    typeof propuesta?.proteinas === "object"
      ? propuesta.proteinas?.total
      : propuesta?.proteinas;

  return createPortal(
    <div className="trial-modal-overlay" onClick={onCerrar}>
      <div
        className="trial-modal trial-modal--editar"
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

        {/* Confirmación: sustituye al chat entero (cabecera y compositor
            incluidos) para que no queden a la vista un campo de texto y un
            botón de guardar que ya no hacen nada. */}
        {guardado ? (
          <div className="editar-exito" role="status">
            <span className="editar-exito-icon" aria-hidden="true">
              ✅
            </span>
            <span className="editar-exito-titulo">¡Tu plato fue cambiado!</span>
            <span className="editar-exito-nombre">{guardado.nombre}</span>
            <p className="editar-exito-texto">
              Ya está en tu menú. ¡Disfrútalo! 😋
            </p>
          </div>
        ) : (
          <>
            <div className="editar-plato-head">
              <span className="md-card-icon" aria-hidden="true">
                {icono}
              </span>
              <span className="md-card-heading">
                <span className="md-card-tipo">Editar {label}</span>
                <span className="md-card-nombre">{details.nombre}</span>
              </span>
            </div>

            <div className="rita-messages editar-plato-msgs" ref={scrollRef}>
              {display.map((b) => (
                <div
                  key={b.id}
                  className={`rita-bubble-row rita-bubble-row--${b.from}`}
                >
                  {b.from === "rita" && (
                    <img
                      src={RITA_AVATAR}
                      alt=""
                      className="rita-bubble-avatar"
                    />
                  )}
                  <div className={`rita-bubble rita-bubble--${b.from}`}>
                    {b.from === "rita" ? (
                      <TypewriterText text={b.text} onTick={scrollAbajo} />
                    ) : (
                      b.text
                    )}
                  </div>
                </div>
              ))}

              {escribiendo && (
                <div className="rita-bubble-row rita-bubble-row--rita">
                  <img src={RITA_AVATAR} alt="" className="rita-bubble-avatar" />
                  <div className="rita-bubble rita-bubble--rita rita-typing">
                    <span className="rita-typing-label">
                      Rita está cocinando
                    </span>
                    <span className="rita-typing-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}

              {/* Vista previa de la propuesta. Se oculta mientras Rita escribe
                  para que no se vea la anterior junto al mensaje que la
                  reemplaza. */}
              {propuesta && !escribiendo && (
                <div className="editar-preview">
                  <span className="editar-preview-label">Nueva propuesta</span>
                  <span className="editar-preview-nombre">
                    {propuesta.nombre}
                  </span>
                  {propuesta.descripcion && (
                    <p className="editar-preview-desc">
                      {propuesta.descripcion}
                    </p>
                  )}

                  <div className="editar-preview-stats">
                    <span className="editar-preview-stat">
                      🔥 {propuesta.calorias ?? "—"} kcal
                    </span>
                    <span className="editar-preview-stat">
                      💪 {totalProteinas ?? "—"} proteína
                    </span>
                  </div>

                  {ingredientes.length > 0 && (
                    <div className="editar-preview-ings">
                      {/* La IA puede repetir un nombre: el índice evita claves
                          duplicadas. */}
                      {ingredientes.map((ing, idx) => (
                        <span className="md-chip" key={`${ing}-${idx}`}>
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary editar-plato-guardar"
                    onClick={guardar}
                  >
                    ✅ Guardar plato
                  </button>
                </div>
              )}
            </div>

            <div className="rita-input">
              <textarea
                className="rita-input-field"
                placeholder={
                  propuesta
                    ? "¿Otro cambio? Escríbelo…"
                    : "Ej: no me gusta el brócoli"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                disabled={escribiendo}
              />
              <button
                type="button"
                className="rita-input-send"
                onClick={enviar}
                disabled={escribiendo || !input.trim()}
                aria-label="Enviar"
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ModalEditarPlato;
