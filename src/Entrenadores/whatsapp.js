// Abre WhatsApp (wa.me) hacia el número indicado con un mensaje prellenado.
// Sanitiza el teléfono dejando solo dígitos (debe incluir el código de país).
export const abrirWhatsApp = (telefono, mensaje) => {
  const num = String(telefono || "").replace(/\D/g, "");
  if (!num) return;
  window.open(
    `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`,
    "_blank",
    "noopener,noreferrer",
  );
};
