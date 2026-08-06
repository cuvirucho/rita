import { useCallback, useEffect, useRef, useState } from "react";
import { sendRitaMessage, planDeUsuario } from "./ritaApi";
import { generarMenu } from "../Menu/Genradoria";
import MenuResultado from "./MenuResultado";
import Planos from "../Menu/Plano/Planos";
import {
  esMenuValido,
  loadMenu,
  saveMenu,
  clearMenu,
  updatePlatoLocal,
} from "./menuStorage";
import { guardarPlatoRemoto } from "./menuRemoto";

const RITA_AVATAR =
  "https://res.cloudinary.com/db8e98ggo/image/upload/v1773700632/logoderita_1_o7wzjd.png";

// Turno inicial oculto: siembra la conversación para que Rita genere su saludo y
// mantiene la alternancia user/assistant que exige la API en los turnos siguientes.
const SEED_USER = {
  role: "user",
  content: "Hola, quiero crear mi menú personalizado.",
};

const TRIAL_KEY = "rita_ia_trials";
const MAX_FREE_TRIALS = 2;

let bubbleSeq = 0;
const nextId = () => `b${bubbleSeq++}`;

// `menuInicial` es el menú ya resuelto por useMenuGuardado (localStorage o
// Firestore). Llega como prop y no se busca aquí para no repetir la consulta.
const RitaChat = ({ perfil, user, onCerrar, menuInicial }) => {
  const [display, setDisplay] = useState([]); // burbujas visibles
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false); // "Rita está escribiendo…"
  const [bloqueado, setBloqueado] = useState(false); // input deshabilitado
  const [fase, setFase] = useState("chat"); // chat | generando | menu | limite
  const [menu, setMenu] = useState(null);
  const [profile, setProfile] = useState(null);
  const [respondidas, setRespondidas] = useState(0);
  const [progresoFinal, setProgresoFinal] = useState(false);

  const messagesRef = useRef([]); // memoria de la conversación (API)
  const scrollRef = useRef(null);
  const iniciadoRef = useRef(false);

  const plan = planDeUsuario(perfil);
  const esFree = !perfil?.plan || perfil.plan === "free";

  // Estable entre renders para no reiniciar el typewriter de burbujas ya escritas
  // cuando llega un mensaje nuevo (solo lee el ref del contenedor).
  const scrollAbajo = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollAbajo();
  }, [display, escribiendo, fase, scrollAbajo]);

  const pushBubble = (from, text) => {
    setDisplay((prev) => [...prev, { id: nextId(), from, text }]);
  };

  // Envía el historial a Rita y procesa su respuesta.
  const responder = async (historial) => {
    setEscribiendo(true);
    try {
      const data = await sendRitaMessage(historial);
      setEscribiendo(false);

      const texto = data.message || "";
      messagesRef.current = [
        ...historial,
        { role: "assistant", content: texto },
      ];
      pushBubble("rita", texto);

      if (data.done) {
        setBloqueado(true);
        setProgresoFinal(true);
        // Deja leer el mensaje de cierre antes de pasar a la generación.
        setTimeout(() => finalizar(data.profile || {}), 1800);
      }
    } catch {
      setEscribiendo(false);
      pushBubble(
        "rita",
        "Ups, tuve un problemita de conexión 😅. ¿Puedes intentarlo de nuevo?",
      );
      setBloqueado(false);
    }
  };

  // Arranca la conversación al montar (o restaura el menú guardado, si existe).
  useEffect(() => {
    if (iniciadoRef.current) return;
    iniciadoRef.current = true;

    // Si ya hay un menú se muestra directo sin rehacer el chat: no consume una
    // prueba gratis porque no pasa por finalizar.
    // localStorage manda sobre `menuInicial` porque la prop es la foto del menú
    // que hizo la sección al montarse: si desde aquí se generó otro menú, esa
    // foto ya es vieja. `menuInicial` cubre el caso contrario — que el
    // navegador no deje escribir en localStorage y el menú solo esté en
    // Firestore.
    const local = loadMenu();
    const guardado = esMenuValido(local?.menu) ? local : menuInicial;
    if (esMenuValido(guardado?.menu)) {
      setMenu(guardado.menu);
      setProfile(guardado.profile || null);
      setFase("menu");
      return;
    }

    messagesRef.current = [SEED_USER];
    responder(messagesRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enviar = () => {
    const texto = input.trim();
    if (!texto || bloqueado || escribiendo) return;

    const userMsg = { role: "user", content: texto };
    const historial = [...messagesRef.current, userMsg];
    messagesRef.current = historial;
    pushBubble("user", texto);
    setInput("");
    setRespondidas((n) => n + 1);
    responder(historial);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  // Cierre de la conversación -> generación del menú (respeta el límite free).
  const finalizar = async (perfilRita) => {
    const usadas = esFree
      ? parseInt(localStorage.getItem(TRIAL_KEY) || "0", 10)
      : 0;
    if (esFree && usadas >= MAX_FREE_TRIALS) {
      setFase("limite");
      return;
    }

    const datos = {
      ...perfilRita,
      name: perfilRita?.name || perfil?.nombre || user?.displayName || "",
      userId: user?.uid,
    };
    setProfile(datos);
    setFase("generando");

    try {
      const nuevoMenu = await generarMenu(datos, plan);
      setMenu(nuevoMenu);
      // Persiste solo cuando la generación fue exitosa.
      saveMenu({ menu: nuevoMenu, profile: datos });
      // La prueba se cuenta al entregar el menú, no al pedirlo: si falla la red
      // o la IA, el usuario no pierde una de sus dos muestras gratis a cambio
      // de nada.
      if (esFree) localStorage.setItem(TRIAL_KEY, String(usadas + 1));
    } catch {
      setMenu(null);
    }
    setFase("menu");
  };

  // El usuario aceptó en el chat de edición el plato que le propuso Rita.
  // La actualización vive aquí y no en MenuResultado porque este componente es
  // el dueño del estado `menu` y de su persistencia.
  const actualizarPlato = useCallback(
    (dia, meal, plato) => {
      setMenu((prev) =>
        prev ? { ...prev, [dia]: { ...prev[dia], [meal]: plato } } : prev,
      );
      // Fuera del updater: en StrictMode se ejecuta dos veces, y estas dos
      // escrituras no son idempotentes de balde (una es una petición de red).
      // `updatePlatoLocal` en vez de `saveMenu` porque este borra los pedidos y
      // aquí el menú sigue siendo el mismo.
      updatePlatoLocal(dia, meal, plato);
      // Sin await ni manejo de error: si Firestore falla el usuario ya ve su
      // plato nuevo, solo se queda sin respaldo.
      guardarPlatoRemoto(user?.uid, dia, meal, plato);
    },
    [user?.uid],
  );

  const reiniciar = () => {
    // "Crear otro menú": borra el guardado para generar uno nuevo con la IA.
    clearMenu();
    bubbleSeq = 0;
    messagesRef.current = [];
    iniciadoRef.current = false;
    setDisplay([]);
    setInput("");
    setEscribiendo(false);
    setBloqueado(false);
    setMenu(null);
    setProfile(null);
    setRespondidas(0);
    setProgresoFinal(false);
    setFase("chat");
    // Vuelve a sembrar y arrancar.
    iniciadoRef.current = true;
    messagesRef.current = [SEED_USER];
    responder(messagesRef.current);
  };

  const progreso = progresoFinal ? 100 : Math.min(92, 10 + respondidas * 9);

  // --- Fase: generando el menú ---
  if (fase === "generando") {
    return (
      <div className="rita-loading">
        <video className="loading-video" autoPlay loop muted playsInline>
          <source
            src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743620220/gifs_para_apps_1_vyt05f.mp4"
            type="video/mp4"
          />
        </video>
        <p className="loading-text">Rita está diseñando tu menú… 🥗</p>
      </div>
    );
  }

  // --- Fase: menú generado ---
  if (fase === "menu") {
    return (
      <MenuResultado
        menu={menu}
        profile={profile}
        plan={plan}
        userId={user?.uid}
        onReiniciar={reiniciar}
        onPlatoActualizado={actualizarPlato}
        esFree={esFree}
      />
    );
  }

  // --- Fase: límite de pruebas gratis alcanzado ---
  if (fase === "limite") {
    return (
      <div className="rita-limite">
        <div className="usuario-seccion-head">
          <span className="usuario-seccion-badge">✨ Suscríbete</span>
          <h2 className="usuario-seccion-title">
            Alcanzaste tus menús de muestra gratis
          </h2>
          <p className="usuario-seccion-sub">
            Suscríbete para que Rita diseñe tus menús personalizados cada
            semana, sin límites y con entrega a domicilio.
          </p>
        </div>
        <Planos ctaLabel="Suscribirse" />
      </div>
    );
  }

  // --- Fase: conversación ---
  return (
    <div className="rita-chat">
      <div className="rita-chat-header">
        <img src={RITA_AVATAR} alt="Rita" className="rita-chat-avatar" />
        <div className="rita-chat-headinfo">
          <span className="rita-chat-name">Rita</span>
          <span className="rita-chat-role">Tu nutricionista virtual</span>
        </div>
        {onCerrar && (
          <button
            type="button"
            className="rita-chat-close"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        )}
      </div>

      <div className="rita-progress" aria-hidden="true">
        <div className="rita-progress-fill" style={{ width: `${progreso}%` }} />
      </div>

      <div className="rita-messages" ref={scrollRef}>
        {display.map((b) => (
          <div
            key={b.id}
            className={`rita-bubble-row rita-bubble-row--${b.from}`}
          >
            {b.from === "rita" && (
              <img src={RITA_AVATAR} alt="" className="rita-bubble-avatar" />
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
              <span className="rita-typing-label">Rita está escribiendo</span>
              <span className="rita-typing-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="rita-input">
        <textarea
          className="rita-input-field"
          placeholder={
            bloqueado ? "Rita está terminando…" : "Escribe tu respuesta…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={bloqueado}
        />
        <button
          type="button"
          className="rita-input-send"
          onClick={enviar}
          disabled={bloqueado || escribiendo || !input.trim()}
          aria-label="Enviar"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default RitaChat;
