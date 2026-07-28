// Cliente del chat conversacional con Rita (nutricionista virtual).
// El backend es stateless: el array `messages` completo viaja en cada turno y
// funciona como la memoria de la conversación.

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Envía el historial de la conversación a Rita y devuelve su siguiente turno.
 * @param {Array<{role: "user"|"assistant", content: string}>} messages
 * @returns {Promise<{ done: boolean, message: string, profile?: object }>}
 */
export const sendRitaMessage = async (messages) => {
  const resp = await fetch(`${API_BASE}/ritaChat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    throw new Error(`ritaChat respondió ${resp.status}`);
  }

  return resp.json();
};

/**
 * Deriva el plan del usuario ("premium" | "starter") a partir de su perfil.
 * Se revisan varios campos porque el plan puede guardarse como `perfil.plan`
 * (ej. "premium"/"basic") o dentro de `perfil.cart` (ej. "Plan Premium").
 * Free / desconocido => "starter" (menú de 3 comidas, como muestra).
 */
export const planDeUsuario = (perfil) => {
  const raw = [
    perfil?.plan,
    perfil?.cart?.nombre,
    perfil?.cart?.title,
    perfil?.cart?.style,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return raw.includes("premium") ? "premium" : "starter";
};
