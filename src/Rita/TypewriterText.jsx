import { useEffect, useState } from "react";

/**
 * Revela el texto progresivamente (efecto "escribiendo"). Para mensajes largos
 * acelera para no hacerse eterno.
 *
 * Lo usan los dos chats de Rita — el de creación del menú (RitaChat.jsx) y el
 * de edición de un plato (ModalEditarPlato.jsx) — así que vive aparte para que
 * las burbujas se escriban igual en ambos.
 *
 * `onTick` se llama en cada revelado: es lo que deja al contenedor seguir
 * bajando el scroll mientras el texto crece.
 */
const TypewriterText = ({ text, onTick }) => {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    let i = 0;
    const step = text.length > 160 ? 3 : 1;
    const id = setInterval(() => {
      i += step;
      setVisible(text.slice(0, i));
      if (onTick) onTick();
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text, onTick]);

  return <>{visible}</>;
};

export default TypewriterText;
