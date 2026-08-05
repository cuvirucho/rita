import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../FIRBAS/Firebase";
import {
  LOCAL,
  MINUTOS_CANCELACION,
  puedeCancelar,
  textoFechaEntrega,
  urlMapaLocal,
  WHATSAPP_RITA,
} from "../UsuarioHome/secciones/deliveryUtils";

/**
 * Cancelación de una entrega ya registrada.
 *
 * Cancela el ENVÍO COMPLETO, no un plato: un documento de `entregas` puede
 * llevar varias comidas y Firestore no permite sacar una sola sin rehacer el
 * pedido. Por eso se listan todas antes de confirmar.
 *
 * Solo hay margen hasta MINUTOS_CANCELACION antes de la hora de entrega; pasado
 * ese punto la comida ya está en preparación y lo que se ofrece es recogerla en
 * el local. Los pedidos "Ahora" caen siempre en este segundo caso.
 *
 * Reutiliza el shell .trial-modal* y el portal a <body> por el mismo motivo que
 * ModalOrdenar.jsx (transform residual de las animaciones del contenedor).
 */
const ModalCancelar = ({ entregaId, platos, fechaEntrega, onCerrar, onCancelada }) => {
  const [enviando, setEnviando] = useState(false);
  // Se calcula al montar: si el modal se queda abierto hasta pasarse la hora,
  // el updateDoc fallará contra las reglas y se cae al aviso de recogida.
  const [hayMargen] = useState(() => puedeCancelar(fechaEntrega));
  const [rechazado, setRechazado] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  const confirmar = async () => {
    if (enviando) return;
    setEnviando(true);
    try {
      await updateDoc(doc(db, "entregas", entregaId), {
        estado: "cancelado",
        canceladaEn: serverTimestamp(),
      });
      onCancelada(entregaId);
    } catch (err) {
      console.error("[ModalCancelar] updateDoc entregas falló", err);
      // El caso más probable es que la regla lo rechace porque el pedido ya
      // salió de cocina: la salida útil es la misma que la de "sin margen".
      setRechazado(true);
    } finally {
      setEnviando(false);
    }
  };

  const abrirMapa = () =>
    window.open(urlMapaLocal(), "_blank", "noopener,noreferrer");

  const abrirWhatsApp = () =>
    window.open(
      `https://wa.me/${WHATSAPP_RITA}?text=${encodeURIComponent(
        `Hola, no puedo recibir mi pedido de Rita (${textoFechaEntrega(fechaEntrega)}). ¿Puedo retirarlo en el local?`,
      )}`,
      "_blank",
      "noopener,noreferrer",
    );

  const nombres = (platos || []).map((p) => p.nombre || p.label).join(" · ");

  const contenido = () => {
    // --- No hay margen: solo queda retirarlo en el local ---
    if (!hayMargen || rechazado) {
      return (
        <>
          <span className="trial-modal-icon">⏰</span>
          <h2 className="trial-modal-title">Ya no se puede cancelar</h2>
          <p className="trial-modal-desc">
            Falta menos de {MINUTOS_CANCELACION === 60 ? "una hora" : `${MINUTOS_CANCELACION} minutos`}{" "}
            para tu entrega y la comida ya está en preparación. Si no logras
            recibirla, puedes retirarla en nuestro local.
          </p>

          {nombres && <p className="cancelar-platos">🍽️ {nombres}</p>}

          <p className="cancelar-local">
            📍 <strong>{LOCAL.nombre}</strong> · {LOCAL.direccion}
          </p>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={abrirMapa}
          >
            📍 Ver ubicación del local
          </button>
          <button type="button" className="btn btn-ghost" onClick={abrirWhatsApp}>
            💬 Escribirnos por WhatsApp
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCerrar}>
            Entendido
          </button>
        </>
      );
    }

    // --- Con margen: confirmación ---
    return (
      <>
        <span className="trial-modal-icon">❌</span>
        <h2 className="trial-modal-title">¿Cancelar esta entrega?</h2>
        <p className="trial-modal-desc">
          Se cancela el <strong>envío completo</strong>, con todo lo que lleva.
          Las comidas vuelven a quedar disponibles para pedirlas en otra entrega
          del día.
        </p>

        {nombres && <p className="cancelar-platos">🍽️ {nombres}</p>}
        <p className="cancelar-cuando">🕒 {textoFechaEntrega(fechaEntrega)}</p>

        <div className="orden-acciones">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCerrar}
            disabled={enviando}
          >
            No, mantener
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={confirmar}
            disabled={enviando}
          >
            {enviando ? "Cancelando…" : "Sí, cancelar"}
          </button>
        </div>
      </>
    );
  };

  return createPortal(
    <div className="trial-modal-overlay" onClick={onCerrar}>
      <div
        className="trial-modal trial-modal--cancelar"
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
        {contenido()}
      </div>
    </div>,
    document.body,
  );
};

export default ModalCancelar;
