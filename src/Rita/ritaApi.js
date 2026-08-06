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
 * Pide a Rita otro plato para una comida concreta a partir del feedback del
 * usuario. El backend NO guarda nada: devuelve una propuesta y el menú solo
 * cambia cuando el usuario la acepta.
 *
 * `currentMeal` es el plato sobre el que hay que trabajar — la última propuesta
 * si ya hubo una, no siempre el plato original, para que los cambios se
 * acumulen turno a turno.
 *
 * @param {{ userId: string, mealType: string, currentMeal: object,
 *           feedback: string, historial: Array<{from: "user"|"rita", text: string}> }} datos
 * @returns {Promise<{ success: boolean, mensaje: string, plato: object }>}
 */
export const regenerarPlato = async ({
  userId,
  mealType,
  currentMeal,
  feedback,
  historial,
}) => {
  const resp = await fetch(`${API_BASE}/regenerarPlato`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, mealType, currentMeal, feedback, historial }),
  });

  if (!resp.ok) {
    throw new Error(`regenerarPlato respondió ${resp.status}`);
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
