// Persistencia del menú generado por IA en localStorage.
// Centraliza la clave y el acceso (envuelto en try/catch) para no duplicarla
// entre RitaChat y MisSemanales. Sigue la convención del proyecto: clave en
// snake_case con prefijo "rita_" (como "rita_ia_trials").

// Las comidas marcadas como consumidas en la sección de Nutrición. Su módulo no
// importa Firebase precisamente para poder limpiarlas desde aquí sin arrastrar
// el SDK al grafo de este archivo.
import { clearConsumoLocal } from "../Nutricion/consumoStorage";

const MENU_KEY = "rita_menu";

// Comidas del menú actual que el usuario ya pidió (Rita/ModalOrdenar.jsx).
// Mapa "dia1:almuerzo" → detalle. Se guarda el detalle y no un booleano para
// poder pintar "Llega mañana a las 9:00". Campos del detalle:
//   hora, paraManana, tipo, etiqueta → texto de la tarjeta
//   ts                              → cuándo se hizo el pedido
//   entregaId                       → id del documento de `entregas`. TODAS las
//     comidas de un mismo envío comparten el mismo id: es lo que permite contar
//     ENTREGAS (no platos) para el cupo del plan y cancelar el envío completo.
//   programadaParaMs                → hora de entrega en ms, para decidir si
//     todavía queda margen de cancelación sin releer Firestore.
// Los pedidos guardados antes de que existieran los dos últimos campos siguen
// leyéndose: se degradan a `ts` para contar y no ofrecen cancelar.
const PEDIDOS_KEY = "rita_pedidos";

/**
 * ¿Este menú se puede mostrar?
 *
 * Un menú servible es un objeto con al menos un día; `resumen_semanal` no
 * cuenta porque no es un día. Hace falta comprobarlo antes de dar por bueno un
 * menú guardado: si no, basura contaría como "ya tiene menú" y dejaría al
 * usuario atrapado en una pantalla vacía sin poder crear uno nuevo. Los dos
 * casos reales son `null` (el backend lo escribía en Firestore cuando la IA
 * devolvía un JSON irreparable) y `undefined` (lo que devolvía el fetch cuando
 * la API respondía con error y nadie miraba el status).
 */
export const esMenuValido = (menu) =>
  !!menu &&
  typeof menu === "object" &&
  !Array.isArray(menu) &&
  Object.keys(menu).some((clave) => clave !== "resumen_semanal");

export const loadMenu = () => {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveMenu = (data) => {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(data));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
  // Menú nuevo, pedidos a cero: las claves son "diaN:comida" y en el menú
  // nuevo el "día 1" ya es otra comida, así que arrastrarlas marcaría platos
  // que nadie pidió. Las marcas de "consumida" de Nutrición se borran por
  // exactamente el mismo motivo.
  clearPedidos();
  clearConsumoLocal();
};

/**
 * Reemplaza UN plato del menú guardado, dejando el resto intacto.
 *
 * No usa `saveMenu` a propósito: aquel borra los pedidos, y aquí el menú sigue
 * siendo el mismo. Las claves "diaN:comida" siguen apuntando a las mismas
 * comidas, así que borrarlas marcaría como no pedidos platos que el usuario sí
 * pidió (y le devolvería cupo de entregas que ya gastó).
 *
 * Si en local no hay un menú servible no hace nada: no tendría sentido crear
 * uno con un solo plato.
 */
export const updatePlatoLocal = (dia, meal, plato) => {
  const actual = loadMenu();
  if (!esMenuValido(actual?.menu)) return;

  const siguiente = {
    ...actual,
    menu: {
      ...actual.menu,
      [dia]: { ...actual.menu[dia], [meal]: plato },
    },
  };

  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(siguiente));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
};

export const clearMenu = () => {
  try {
    localStorage.removeItem(MENU_KEY);
  } catch {
    /* ignore */
  }
  clearPedidos();
  clearConsumoLocal();
};

// Mira el contenido y no solo la presencia de la clave: un `{"menu":null}`
// guardado por una generación fallida existe, pero no es un menú.
export const hasMenu = () => esMenuValido(loadMenu()?.menu);

/* ------------------------------------------------------------------ */
/* Pedidos ya realizados del menú actual                               */
/* ------------------------------------------------------------------ */

export const loadPedidos = () => {
  try {
    const raw = localStorage.getItem(PEDIDOS_KEY);
    const datos = raw ? JSON.parse(raw) : null;
    // Un JSON válido puede ser null, un array o un número: solo sirve un
    // objeto plano, cualquier otra cosa se descarta.
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) return {};
    return datos;
  } catch {
    return {};
  }
};

export const savePedidos = (mapa) => {
  try {
    localStorage.setItem(PEDIDOS_KEY, JSON.stringify(mapa));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
};

export const clearPedidos = () => {
  try {
    localStorage.removeItem(PEDIDOS_KEY);
  } catch {
    /* ignore */
  }
};

// Clave estable de una comida dentro del menú actual. Vive aquí para que
// quien escribe y quien lee usen exactamente el mismo formato.
export const clavePedido = (dia, meal) => `${dia}:${meal}`;

/**
 * Pedidos de un día concreto: { comida: detalle }.
 *
 * El cupo de entregas es por día, así que el modal necesita saber qué falta por
 * pedir y cuántas entregas se han usado ya en ESE día. Se filtra por prefijo en
 * vez de recorrer las comidas del menú para que no dependa del plan.
 */
export const pedidosDeDia = (pedidos, dia) => {
  const prefijo = `${dia}:`;
  const salida = {};
  Object.entries(pedidos || {}).forEach(([clave, detalle]) => {
    if (clave.startsWith(prefijo)) salida[clave.slice(prefijo.length)] = detalle;
  });
  return salida;
};

/**
 * Cuántas entregas distintas se han usado ya, a partir de los pedidos de un día.
 *
 * Cuenta `entregaId` únicos, no comidas: un envío con tres platos gasta una sola
 * entrega. `ts` es el respaldo para los pedidos anteriores a `entregaId`.
 */
export const entregasUsadas = (pedidosDia) =>
  new Set(
    Object.values(pedidosDia || {}).map((p) => p?.entregaId ?? p?.ts),
  ).size;
