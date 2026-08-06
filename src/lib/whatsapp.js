// Construye la URL de wa.me hacia el número indicado con un mensaje prellenado.
// Sanitiza el teléfono dejando solo dígitos (debe incluir el código de país).
// Se exporta aparte de abrirWhatsApp para poder pintar un enlace de respaldo
// cuando el navegador bloquea la ventana emergente (común en móvil).
export const urlWhatsApp = (telefono, mensaje) => {
  const num = String(telefono || "").replace(/\D/g, "");
  if (!num) return "";
  return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
};

// Abre WhatsApp (wa.me) hacia el número indicado con un mensaje prellenado.
export const abrirWhatsApp = (telefono, mensaje) => {
  const url = urlWhatsApp(telefono, mensaje);
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};
