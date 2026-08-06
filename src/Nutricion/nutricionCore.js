// Lectura nutricional de un plato del menú generado por Rita.
//
// REGLA ÚNICA DE ESTE ARCHIVO: solo se muestra lo que viene en el menú.
//
// No hay tablas de referencia, ni repartos de macros, ni perfiles de alimento,
// ni nada que derive un nutriente de otro. Si la IA no lo devolvió, no existe.
// Las únicas operaciones que se hacen son sumar lo que el usuario ha marcado y
// dividir para sacar una media: aritmética sobre datos reales.
//
// Lo que un plato trae hoy (verificado contra un menú de producción):
//   calorias:   230                       número, o texto con unidad
//   proteinas:  { total: "36g" }          objeto con "total", o un escalar
//   vitaminas:  { "Vitamina C": "85%" }   claves LIBRES, valores en % del VD
//   minerales:  { "Fósforo": "240mg" }    claves LIBRES, valores en mg
//
// Las claves de vitaminas y minerales las inventa la IA en cada generación
// ("Manganeso" aparece en unos platos y no en otros), así que aquí no hay
// catálogo cerrado: se lee lo que haya y se muestra tal cual.

/* ------------------------------------------------------------------ */
/* Parsers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Número desde lo que sea que haya devuelto la IA.
 *
 * Los valores llegan como número o como texto ("230", "36g", "2.1mg", "85%"):
 * se conserva solo la parte numérica. La coma decimal se normaliza a punto
 * porque el modelo escribe en español.
 */
export const aNumero = (bruto) => {
  if (bruto == null || bruto === "") return null;
  if (typeof bruto === "number") return Number.isFinite(bruto) ? bruto : null;
  const encontrado = String(bruto).match(/-?\d+(?:[.,]\d+)?/);
  if (!encontrado) return null;
  const num = Number(encontrado[0].replace(",", "."));
  return Number.isFinite(num) ? num : null;
};

/**
 * Unidad escrita en el valor, o cadena vacía si no hay ninguna.
 *
 * Se conserva TAL CUAL viene, sin convertir: si la IA escribió "0.2mg" se
 * muestra en mg. Convertir a una unidad canónica obligaría a decidir cuál, y
 * mezclaría un dato con un cálculo nuestro.
 */
export const unidadDe = (bruto) => {
  if (typeof bruto === "number") return "";
  const texto = String(bruto ?? "");
  if (texto.includes("%")) return "%";
  // La unidad va pegada al número o separada por un espacio ("240mg", "36 g").
  const encontrado = texto.match(/\d\s*([\p{L}]+)/u);
  if (!encontrado) return "";
  const u = encontrado[1].toLowerCase();
  // Microgramo se escribe de tres formas distintas; se unifica al mostrarlo.
  if (["mcg", "ug", "µg", "μg"].includes(u)) return "µg";
  if (["kcal", "cal"].includes(u)) return "kcal";
  if (u === "ui") return "UI";
  if (["mg", "g", "ml", "l", "kg"].includes(u)) return u;
  return "";
};

/** `{ valor, unidad }` a partir de un valor bruto, o null si no hay número. */
const medida = (bruto, unidadPorDefecto = "") => {
  const valor = aNumero(bruto);
  if (valor == null) return null;
  return { valor, unidad: unidadDe(bruto) || unidadPorDefecto };
};

/**
 * Lee un bloque de micronutrientes.
 *
 * La IA lo devuelve como objeto { nombre: valor }, pero no siempre: se tolera
 * array y string, igual que Rita/ModalPlato.jsx. Las entradas sin número se
 * descartan: "Hierro" a secas confirma que el plato lo tiene pero no cuánto, y
 * no se puede sumar.
 */
const leerBloque = (bruto, unidadPorDefecto) => {
  const salida = {};
  if (!bruto) return salida;

  const entradas = Array.isArray(bruto)
    ? bruto.map((item) => {
        const [nombre, valor] = String(item).split(/[:=]/);
        return [nombre, valor];
      })
    : typeof bruto === "string"
      ? [bruto.split(/[:=]/)]
      : Object.entries(bruto);

  entradas.forEach(([nombre, valor]) => {
    const etiqueta = String(nombre ?? "").trim();
    if (!etiqueta) return;
    const m = medida(valor, unidadPorDefecto);
    if (m) salida[etiqueta] = m;
  });

  return salida;
};

/* ------------------------------------------------------------------ */
/* Lectura de un plato                                                 */
/* ------------------------------------------------------------------ */

export const lecturaVacia = () => ({
  calorias: null,
  proteinas: null,
  vitaminas: {},
  minerales: {},
});

/**
 * Lo que este plato aporta, sin añadir nada.
 *
 * @returns {{calorias: number|null,
 *            proteinas: {valor: number, unidad: string}|null,
 *            vitaminas: Object<string, {valor: number, unidad: string}>,
 *            minerales: Object<string, {valor: number, unidad: string}>}}
 */
export const lecturaDePlato = (plato) => {
  if (!plato || typeof plato !== "object") return lecturaVacia();

  // `proteinas` es un objeto con clave "total", pero llega también como
  // escalar: misma coerción que Rita/ModalPlato.jsx.
  const brutoProteinas =
    plato.proteinas && typeof plato.proteinas === "object"
      ? plato.proteinas.total
      : plato.proteinas;

  return {
    calorias: aNumero(plato.calorias),
    proteinas: medida(brutoProteinas, "g"),
    vitaminas: leerBloque(plato.vitaminas, "%"),
    minerales: leerBloque(plato.minerales, "mg"),
  };
};

/* ------------------------------------------------------------------ */
/* Sumas                                                               */
/* ------------------------------------------------------------------ */

/**
 * Fusiona dos mapas de micronutrientes sumando los que compartan unidad.
 *
 * Si la misma etiqueta aparece con dos unidades distintas (raro, pero la IA es
 * la IA) se guardan por separado en vez de sumar peras con manzanas.
 */
const fusionar = (acumulado, nuevo) => {
  Object.entries(nuevo).forEach(([etiqueta, m]) => {
    const previo = acumulado[etiqueta];
    if (!previo) {
      acumulado[etiqueta] = { ...m };
    } else if (previo.unidad === m.unidad) {
      previo.valor += m.valor;
    } else {
      acumulado[`${etiqueta} (${m.unidad})`] = { ...m };
    }
  });
  return acumulado;
};

/** Suma varias lecturas en una. Sin lecturas, todo queda a null / vacío. */
export const sumarLecturas = (lecturas) => {
  const lista = (lecturas || []).filter(Boolean);
  const salida = lecturaVacia();
  if (lista.length === 0) return salida;

  lista.forEach((l) => {
    if (l.calorias != null) salida.calorias = (salida.calorias ?? 0) + l.calorias;
    if (l.proteinas) {
      if (!salida.proteinas) salida.proteinas = { ...l.proteinas };
      else if (salida.proteinas.unidad === l.proteinas.unidad)
        salida.proteinas.valor += l.proteinas.valor;
    }
    fusionar(salida.vitaminas, l.vitaminas);
    fusionar(salida.minerales, l.minerales);
  });

  return salida;
};

/** Divide una lectura entre N; sirve para las medias diarias de la semana. */
export const dividirLectura = (lectura, divisor) => {
  if (!lectura || !(divisor > 0)) return lecturaVacia();

  const dividirMapa = (mapa) =>
    Object.fromEntries(
      Object.entries(mapa).map(([etiqueta, m]) => [
        etiqueta,
        { ...m, valor: m.valor / divisor },
      ]),
    );

  return {
    calorias: lectura.calorias == null ? null : lectura.calorias / divisor,
    proteinas: lectura.proteinas
      ? { ...lectura.proteinas, valor: lectura.proteinas.valor / divisor }
      : null,
    vitaminas: dividirMapa(lectura.vitaminas),
    minerales: dividirMapa(lectura.minerales),
  };
};

/** ¿Esta lectura no tiene nada que enseñar? */
export const estaVacia = (lectura) =>
  !lectura ||
  (lectura.calorias == null &&
    !lectura.proteinas &&
    Object.keys(lectura.vitaminas ?? {}).length === 0 &&
    Object.keys(lectura.minerales ?? {}).length === 0);

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

/**
 * Número en formato español, con los decimales justos.
 *
 * Los decimales se deciden por el valor y no por una tabla: los
 * micronutrientes llegan con uno o dos ("2.1mg", "0.2mg", "$18.45") y las
 * calorías enteras. Por encima de 100 se redondea, porque medio kilojulio no
 * le importa a nadie. Los ceros de más no se escriben.
 */
export const formatearNumero = (valor) => {
  if (valor == null) return "—";
  const maximo = Math.abs(valor) >= 100 ? 0 : 2;
  return valor.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maximo,
  });
};

/** "240 mg", "85 %", "36 g". */
export const formatearMedida = (m) => {
  if (!m || m.valor == null) return "—";
  return m.unidad ? `${formatearNumero(m.valor)} ${m.unidad}` : formatearNumero(m.valor);
};
