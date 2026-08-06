// Metadatos de las comidas y los días de un menú generado por Rita.
//
// Vivían dentro de MenuResultado.jsx, pero la sección de Nutrición necesita
// exactamente los mismos valores: duplicarlos garantizaba que se
// desincronizaran en cuanto se añadiera una comida al backend. Van en un .js y
// no en un .jsx porque un componente no puede exportar constantes sin romper la
// regla react-refresh/only-export-components (mismo criterio que deliveryUtils.js).

// Orden y etiquetas de comidas según el plan. El backend genera hasta 5 comidas;
// aquí se muestra el subconjunto que corresponde al plan del usuario:
//   - starter / free (muestra): 4 comidas
//   - premium: 5 comidas
export const MEAL_ORDER = {
  starter: ["desayuno", "almuerzo", "cena", "snack"],
  premium: ["desayuno", "snack", "almuerzo", "bebida", "cena"],
};

export const MEAL_LABELS = {
  desayuno: "Desayuno",
  snack: "Snack día",
  almuerzo: "Almuerzo",
  bebida: "Bebida",
  cena: "Cena",
};

// Equivalente al campo `icono` que MenuDiario lee de sus datos estáticos: la IA
// no devuelve emoji, así que se deriva del tipo de comida.
export const MEAL_ICONS = {
  desayuno: "🍳",
  snack: "🥜",
  almuerzo: "🍽️",
  bebida: "🥤",
  cena: "🌙",
};

// Texto comparable: minúsculas y sin acentos, para que "miércoles" y
// "miercoles" (la IA escribe las dos) sean la misma clave.
const sinAcentos = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

// Orden real de la semana. La IA nombra los días ("lunes", "jueves"…) pero los
// devuelve en el orden que le apetece: un menú real llegó como
// { lunes, jueves, resumen_semanal, viernes, martes, miercoles }. Sin ordenar
// por esto, la segunda tarjeta decía "Martes" mostrando las comidas del jueves.
const ORDEN_DIAS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

/** Posición del día en la semana, o -1 si la clave no es un nombre de día. */
export const posicionDeDia = (clave) => ORDEN_DIAS.indexOf(sinAcentos(clave));

/**
 * Días de un menú, ordenados y sin `resumen_semanal`.
 *
 * Si las claves son nombres de día se ordenan por la semana real. Los menús
 * antiguos con claves "dia1".."dia5" no tienen nombre que ordenar, así que
 * conservan el orden de inserción, que en su caso sí era el correcto.
 */
export const diasDeMenu = (menu) => {
  if (!menu || typeof menu !== "object") return [];

  const claves = Object.keys(menu).filter((c) => c !== "resumen_semanal");
  const todosConNombre = claves.every((c) => posicionDeDia(c) >= 0);
  if (!todosConNombre) return claves;

  return [...claves].sort((a, b) => posicionDeDia(a) - posicionDeDia(b));
};

/**
 * Comidas del plan que además existen en ese día.
 *
 * La IA a veces devuelve un día con 4 de las 5 comidas. Sin este filtro un día
 * así sería imposible de completar y aportaría comidas fantasma de 0 kcal a los
 * totales.
 */
export const comidasDeDia = (menu, dia, comidasDelPlan) => {
  const delDia = menu?.[dia];
  if (!delDia || typeof delDia !== "object") return [];
  return comidasDelPlan.filter((meal) => delDia[meal]);
};

const NOMBRES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const NOMBRES_CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Nombre del día a partir de SU CLAVE, no de su posición.
 *
 * El índice es solo el respaldo para los menús viejos con claves "dia1".."dia5",
 * donde la posición era lo único que había.
 */
export const etiquetaDeDia = (clave, indice = 0) => {
  const pos = posicionDeDia(clave);
  return pos >= 0 ? NOMBRES[pos] : `Día ${indice + 1}`;
};

export const etiquetaDeDiaCorto = (clave, indice = 0) => {
  const pos = posicionDeDia(clave);
  return pos >= 0 ? NOMBRES_CORTO[pos] : `D${indice + 1}`;
};

/**
 * Qué día del plan es hoy.
 *
 * Se busca la CLAVE del día actual dentro del menú; solo si las claves no
 * tienen nombre (menús antiguos) se recurre a la posición. Sábado y domingo
 * caen en el primer día: el plan cubre de lunes a viernes y es mejor abrir en
 * un día con comidas que en uno vacío. El segundo valor lo avisa para que la
 * interfaz pueda explicarlo.
 *
 * @param {string[]} dias claves ya ordenadas por `diasDeMenu`
 */
export const indiceDeHoy = (dias = []) => {
  const dow = new Date().getDay(); // 0 domingo … 6 sábado
  const esFinDeSemana = dow === 0 || dow === 6;
  const posHoy = dow === 0 ? 6 : dow - 1; // 0 lunes … 6 domingo

  if (!esFinDeSemana) {
    const encontrado = dias.findIndex((clave) => posicionDeDia(clave) === posHoy);
    if (encontrado >= 0) return { indice: encontrado, esFinDeSemana: false };
  }

  // Sin nombres de día, o fin de semana, o un día que el menú no cubre.
  const porPosicion = esFinDeSemana ? 0 : posHoy;
  return {
    indice: Math.min(Math.max(porPosicion, 0), Math.max(dias.length - 1, 0)),
    esFinDeSemana,
  };
};
