// Objetivos diarios y semáforo de cumplimiento.
//
// Los objetivos salen ÚNICAMENTE del `resumen_semanal` del propio menú, que es
// donde la IA dejó los promedios diarios que ella misma calculó. No hay tablas
// de valores de referencia ni fórmulas de gasto energético: si el menú no trae
// un promedio, esa métrica se enseña como total, sin porcentaje, en vez de
// inventarle una meta.
//
// Módulo puro (sin React) por el mismo motivo que deliveryUtils.js: así no
// dispara la regla react-refresh/only-export-components.

import { aNumero, unidadDe } from "./nutricionCore";

/**
 * La IA no respeta siempre el nombre exacto de la clave: cuela espacios, MAYÚS
 * o una variante del nombre. Se normaliza el objeto una vez y luego se busca
 * por alias.
 */
export const normalizarResumen = (resumen) => {
  if (!resumen || typeof resumen !== "object") return {};
  const plano = {};
  Object.entries(resumen).forEach(([clave, valor]) => {
    plano[clave.trim().toLowerCase()] = valor;
  });
  return plano;
};

/**
 * Alias de cada promedio diario del resumen semanal.
 *
 * En minúscula y sin espacios porque `normalizarResumen` ya deja las claves
 * así. Se mantienen las variantes antiguas: hay menús guardados en localStorage
 * con esos nombres.
 */
export const ALIAS_RESUMEN = {
  calorias: [
    "calorias_promedio",
    "promedio_calorias_diarias",
    "calorias_diarias_promedio",
    "promediocaloriasdiarias",
    "promediocalorias",
  ],
  proteinas: [
    "proteinas_promedio",
    "promedio_proteinas_diarias",
    "proteinas_diarias_promedio",
    "proteina_diaria_promedio",
    "promedioproteinasdiarias",
    "promedioproteinas",
  ],
  carbohidratos: [
    "carbohidratos_promedio",
    "promedio_carbohidratos_diarios",
    "carbohidratos_diarios_promedio",
    "promediocarbohidratos",
    "carbos_promedio",
  ],
  grasas: [
    "grasas_promedio",
    "promedio_grasas_diarias",
    "grasas_diarias_promedio",
    "promediograsas",
  ],
  fibra: [
    "fibra_promedio",
    "promedio_fibra_diaria",
    "fibra_diaria_promedio",
    "promediofibra",
  ],
  coste: ["costo_total_semanal", "coste_total_semanal", "costo_semanal"],
};

/** Primer alias con un número utilizable, como `{ valor, unidad }`. */
const medidaPorAlias = (plano, alias, unidadPorDefecto = "") => {
  for (const clave of alias) {
    const bruto = plano[clave];
    const valor = aNumero(bruto);
    if (valor != null) {
      return { valor, unidad: unidadDe(bruto) || unidadPorDefecto };
    }
  }
  return null;
};

/**
 * Promedios diarios que declara el menú.
 *
 * Calorías y proteínas se usan como objetivo del día porque sí se pueden
 * comparar con lo consumido (el plato trae ambas). Carbohidratos, grasas y
 * fibra NO: no existen por plato, así que solo se enseñan como referencia del
 * plan, nunca como algo consumido.
 *
 * @returns {{objetivo: string|null, hay: boolean,
 *            calorias, proteinas, carbohidratos, grasas, fibra, coste}}
 *          cada métrica es `{valor, unidad}` o null
 */
export const objetivosDelMenu = (resumenSemanal) => {
  const plano = normalizarResumen(resumenSemanal);

  const calorias = medidaPorAlias(plano, ALIAS_RESUMEN.calorias, "kcal");
  const proteinas = medidaPorAlias(plano, ALIAS_RESUMEN.proteinas, "g");

  return {
    objetivo: resumenSemanal?.objetivo ?? null,
    calorias,
    proteinas,
    carbohidratos: medidaPorAlias(plano, ALIAS_RESUMEN.carbohidratos, "g"),
    grasas: medidaPorAlias(plano, ALIAS_RESUMEN.grasas, "g"),
    fibra: medidaPorAlias(plano, ALIAS_RESUMEN.fibra, "g"),
    // El coste llega como "$18.45": el símbolo no lo detecta `unidadDe`, así
    // que se pone a mano para no perderlo por el camino.
    coste: medidaPorAlias(plano, ALIAS_RESUMEN.coste, "$"),
    hay: !!(calorias || proteinas),
  };
};

/* ------------------------------------------------------------------ */
/* Semáforo                                                            */
/* ------------------------------------------------------------------ */

/** Porcentaje de cumplimiento, o null si falta el dato o la meta. */
export const porcentaje = (valor, meta) => {
  if (valor == null || !(meta > 0)) return null;
  return (valor / meta) * 100;
};

/**
 * Estado frente al objetivo.
 *
 * 🟢 dentro · 🟡 cerca · 🔴 exceso o déficit importante. La banda buena está en
 * el centro porque quedarse corto y pasarse son problemas distintos, pero ambos
 * problemas.
 */
export const estadoCumplimiento = (pct) => {
  if (pct == null) return "sindatos";
  if (pct < 70) return "bajo";
  if (pct < 90) return "medio";
  if (pct <= 110) return "optimo";
  if (pct <= 130) return "alto";
  return "exceso";
};

export const EMOJI_ESTADO = {
  optimo: "🟢",
  medio: "🟡",
  alto: "🟡",
  bajo: "🔴",
  exceso: "🔴",
  sindatos: "⚪",
};

export const TEXTO_ESTADO = {
  optimo: "Dentro del objetivo",
  medio: "Cerca del objetivo",
  alto: "Algo por encima",
  bajo: "Por debajo del objetivo",
  exceso: "Exceso",
  sindatos: "Sin objetivo en el menú",
};
