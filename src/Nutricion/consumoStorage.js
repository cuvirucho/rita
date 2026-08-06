// Espejo en localStorage de las comidas marcadas como consumidas.
//
// Va separado de consumoRemoto.js (que sí habla con Firestore) porque
// Rita/menuStorage.js necesita poder limpiar estas marcas al guardar un menú
// nuevo, y no tiene por qué arrastrar Firebase a su grafo de módulos solo para
// eso. Sigue la convención del proyecto: clave snake_case con prefijo "rita_".
const CONSUMO_KEY = "rita_consumo";

/**
 * Clave estable de una comida dentro del menú actual.
 *
 * Separador "__" y no ":" como `clavePedido`: esta clave termina siendo un
 * segmento de una ruta con puntos de `updateDoc`
 * (`consumoNutricional.marcas.dia1__desayuno`), y un segmento con ":" obliga a
 * escaparlo con acentos graves. Con "__" es un identificador plano y la
 * escritura tiene exactamente la misma forma que `guardarPlatoRemoto`.
 *
 * `dia` y `meal` son claves generadas por el backend ("dia1", "almuerzo"),
 * nunca texto del usuario.
 */
export const claveConsumo = (dia, meal) => `${dia}__${meal}`;

/**
 * Huella del menú actual, para saber si unas marcas guardadas son suyas.
 *
 * Las claves son "diaN__comida" y en un menú nuevo el "día 1" ya es otro plato,
 * así que arrastrarlas marcaría comidas que el usuario nunca comió. `saveMenu`
 * ya limpia las marcas al guardar, pero eso no cubre a un dispositivo que
 * recibió el menú nuevo por Firestore sin pasar por ahí: la huella es la red de
 * seguridad para ese caso.
 *
 * Se usan el número de días y el nombre del primer plato porque juntos cambian
 * con cualquier menú nuevo y no cambian al editar una comida cualquiera (que sí
 * conserva el resto del plan y sus marcas).
 */
export const firmaDeMenu = (menu) => {
  if (!menu || typeof menu !== "object") return null;
  const dias = Object.keys(menu).filter((c) => c !== "resumen_semanal");
  if (dias.length === 0) return null;
  const primerDia = menu[dias[0]];
  const primeraComida =
    primerDia && typeof primerDia === "object"
      ? Object.values(primerDia).find((c) => c?.nombre)
      : null;
  return `${dias.length}|${primeraComida?.nombre ?? "?"}`;
};

const vacio = () => ({ firma: null, marcas: {} });

export const loadConsumoLocal = () => {
  try {
    const raw = localStorage.getItem(CONSUMO_KEY);
    const datos = raw ? JSON.parse(raw) : null;
    // Un JSON válido puede ser null, un array o un número: solo sirve un objeto
    // plano, cualquier otra cosa se descarta.
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) return vacio();
    const marcas =
      datos.marcas && typeof datos.marcas === "object" && !Array.isArray(datos.marcas)
        ? datos.marcas
        : {};
    return { firma: datos.firma ?? null, marcas };
  } catch {
    return vacio();
  }
};

export const saveConsumoLocal = (datos) => {
  try {
    localStorage.setItem(CONSUMO_KEY, JSON.stringify(datos));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
};

export const clearConsumoLocal = () => {
  try {
    localStorage.removeItem(CONSUMO_KEY);
  } catch {
    /* ignore */
  }
};

/**
 * Marcas que de verdad pertenecen a este menú.
 *
 * Con la huella cambiada se devuelven vacías en vez de intentar reconciliar:
 * no hay forma de saber qué comida del menú viejo corresponde a cuál del nuevo.
 */
export const marcasDeMenu = (guardado, firmaActual) => {
  if (!guardado || !firmaActual) return {};
  if (guardado.firma && guardado.firma !== firmaActual) return {};
  return guardado.marcas ?? {};
};
