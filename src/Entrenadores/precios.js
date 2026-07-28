// Utilidades de precios compartidas entre la tarjeta y los modales de entrenador.

// ¿El campo de precio tiene un valor usable?
export const tienePrecio = (valor) => valor != null && valor !== "";

// Formatea un precio para mostrar ("$120") o un guion si no hay dato.
export const formatearPrecio = (valor) =>
  tienePrecio(valor) ? `$${valor}` : "—";

// Ahorro (%) del plan mensual frente a pagar 4 semanas sueltas.
// Devuelve un entero > 0 solo cuando ambos precios existen y el plan mes conviene;
// en cualquier otro caso devuelve null (así el badge de ahorro no se muestra).
export const calcAhorro = (precioSemana, precioMes) => {
  const semana = Number(precioSemana);
  const mes = Number(precioMes);
  if (!Number.isFinite(semana) || !Number.isFinite(mes) || semana <= 0 || mes <= 0) {
    return null;
  }
  const base = semana * 4;
  const ahorro = Math.round(((base - mes) / base) * 100);
  return ahorro > 0 ? ahorro : null;
};
