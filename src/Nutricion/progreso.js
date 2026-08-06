// Agregación del plan semanal: qué se ha consumido, cuánto falta y qué suma
// nutricional sale de ello. Módulo puro, sin React ni Firebase.

import { comidasDeDia, diasDeMenu } from "../Rita/comidas";
import { lecturaDePlato, sumarLecturas } from "./nutricionCore";
import { claveConsumo } from "./consumoStorage";

/**
 * Estado de cada día del plan.
 *
 * @returns {Array<{dia: string, indice: number, comidas: string[],
 *                  consumidas: string[], total: number, hechas: number,
 *                  completo: boolean}>}
 */
export const estadoPorDia = (menu, marcas, comidasDelPlan) => {
  const dias = diasDeMenu(menu);
  return dias.map((dia, indice) => {
    const comidas = comidasDeDia(menu, dia, comidasDelPlan);
    const consumidas = comidas.filter((meal) => marcas?.[claveConsumo(dia, meal)]);
    return {
      dia,
      indice,
      comidas,
      consumidas,
      total: comidas.length,
      hechas: consumidas.length,
      // Un día sin comidas no está "completo": no hay nada que cumplir.
      completo: comidas.length > 0 && consumidas.length === comidas.length,
    };
  });
};

/**
 * Racha: la serie MÁS LARGA de días del plan consecutivos completados.
 *
 * Son días del plan, no días de calendario, y la etiqueta de la interfaz lo
 * dice explícitamente. El único sello de tiempo que existe es cuándo se marcó
 * la casilla, no cuándo se comió: alguien que rellena la semana el sábado por
 * la noche tendría una racha de calendario de un día para una semana perfecta.
 *
 * Se devuelve la serie más larga y no la que arranca en el primer día porque
 * con cinco días una "racha actual" se desploma a cero en cuanto alguien se
 * salta el lunes, lo cual ni informa ni motiva.
 */
export const rachaDePlan = (dias) => {
  let mejor = 0;
  let actual = 0;
  dias.forEach((d) => {
    if (d.completo) {
      actual += 1;
      if (actual > mejor) mejor = actual;
    } else {
      actual = 0;
    }
  });
  return mejor;
};

/**
 * Resumen numérico de la semana.
 *
 * El denominador del porcentaje son las comidas REALMENTE presentes en el menú,
 * no `comidas del plan × 5`: la IA a veces devuelve un día con cuatro de las
 * cinco comidas y con el otro denominador el plan sería imposible de completar.
 */
export const progresoSemanal = (menu, marcas, comidasDelPlan) => {
  const dias = estadoPorDia(menu, marcas, comidasDelPlan);
  const total = dias.reduce((n, d) => n + d.total, 0);
  const hechas = dias.reduce((n, d) => n + d.hechas, 0);

  return {
    dias,
    totalComidas: total,
    comidasHechas: hechas,
    comidasPendientes: Math.max(total - hechas, 0),
    diasCompletos: dias.filter((d) => d.completo).length,
    totalDias: dias.length,
    porcentaje: total > 0 ? (hechas / total) * 100 : 0,
    racha: rachaDePlan(dias),
  };
};

/** Lectura nutricional de una comida concreta del menú. */
export const lecturaDeComida = (menu, dia, meal) =>
  lecturaDePlato(menu?.[dia]?.[meal]);

/**
 * Suma nutricional de un día.
 *
 * `soloConsumidas` distingue las dos cifras que enseña el panel: lo que el
 * usuario lleva comido y lo que el día entero tenía planificado.
 */
export const nutricionDeDia = (menu, dia, comidasDelPlan, opciones = {}) => {
  const { marcas, soloConsumidas = false } = opciones;
  const comidas = comidasDeDia(menu, dia, comidasDelPlan).filter(
    (meal) => !soloConsumidas || marcas?.[claveConsumo(dia, meal)],
  );
  return sumarLecturas(comidas.map((meal) => lecturaDeComida(menu, dia, meal)));
};

/** Suma nutricional de toda la semana, con los mismos criterios. */
export const nutricionDeSemana = (menu, comidasDelPlan, opciones = {}) =>
  sumarLecturas(
    diasDeMenu(menu).map((dia) =>
      nutricionDeDia(menu, dia, comidasDelPlan, opciones),
    ),
  );
