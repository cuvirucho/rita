import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  claveConsumo,
  firmaDeMenu,
  loadConsumoLocal,
  marcasDeMenu,
  saveConsumoLocal,
} from "./consumoStorage";
import {
  desmarcarConsumoRemoto,
  escucharUsuario,
  marcarConsumoRemoto,
  reiniciarConsumoRemoto,
} from "./consumoRemoto";

/**
 * Comidas que el usuario ha marcado como consumidas.
 *
 * Orden de resolución, pensado para que la casilla responda al instante y
 * además sobreviva a cambiar de dispositivo:
 *   1. localStorage — se lee de forma síncrona en el primer render, así que las
 *      casillas ya salen marcadas sin esperar a la red.
 *   2. `onSnapshot` sobre el documento del usuario — cuando llega, manda. Es lo
 *      que sincroniza dos navegadores abiertos a la vez.
 *   3. Cada cambio se aplica primero en pantalla y luego se escribe en
 *      Firestore sin bloquear; si la escritura falla, el estado local se queda
 *      y `sincronizado` pasa a false para poder avisarlo con discreción.
 *
 * @param {string} uid
 * @param {object} menu Menú guardado (para la huella y el recuento)
 * @returns {{marcas: Object<string, {consumido: boolean, ts: number}>,
 *            cargando: boolean, sincronizado: boolean,
 *            estaConsumida: (dia: string, meal: string) => boolean,
 *            alternar: (dia: string, meal: string) => void,
 *            reiniciar: () => void}}
 */
export const useConsumo = (uid, menu) => {
  const firma = useMemo(() => firmaDeMenu(menu), [menu]);

  // Estado inicial síncrono: sin esto las casillas parpadearían de vacías a
  // marcadas en cada montaje de la sección.
  const [marcas, setMarcas] = useState(() =>
    marcasDeMenu(loadConsumoLocal(), firmaDeMenu(menu)),
  );
  const [cargando, setCargando] = useState(!!uid);
  const [sincronizado, setSincronizado] = useState(true);

  // La huella se lee dentro de callbacks que no deben recrearse en cada cambio
  // de menú, así que se guarda también en una ref.
  const firmaRef = useRef(firma);
  firmaRef.current = firma;

  // Si el menú cambia (el usuario generó otro), las marcas del anterior dejan
  // de valer: no hay forma de saber qué comida del menú viejo corresponde a
  // cuál del nuevo.
  useEffect(() => {
    setMarcas((previas) => {
      const local = loadConsumoLocal();
      const vigentes = marcasDeMenu(local, firma);
      // Se comparan las claves para no provocar un render con un objeto nuevo
      // que contiene exactamente lo mismo.
      const igualQueAntes =
        Object.keys(vigentes).length === Object.keys(previas).length &&
        Object.keys(vigentes).every((c) => previas[c]);
      return igualQueAntes ? previas : vigentes;
    });
  }, [firma]);

  useEffect(() => {
    if (!uid) {
      setCargando(false);
      return;
    }

    let vivo = true;
    setCargando(true);

    const parar = escucharUsuario(uid, (datos) => {
      if (!vivo) return;
      setCargando(false);

      const remoto = datos?.consumoNutricional;
      if (!remoto || typeof remoto !== "object") return;

      const vigentes = marcasDeMenu(remoto, firmaRef.current);
      setMarcas(vigentes);
      saveConsumoLocal({ firma: firmaRef.current, marcas: vigentes });
      setSincronizado(true);
    });

    return () => {
      vivo = false;
      parar();
    };
  }, [uid]);

  const estaConsumida = useCallback(
    (dia, meal) => !!marcas[claveConsumo(dia, meal)],
    [marcas],
  );

  // Espejo de `marcas` para poder leer el valor vigente sin que `alternar`
  // dependa de él: si dependiera, cambiaría de identidad en cada marca y
  // volvería a renderizar las 25 filas del plan semanal.
  const marcasRef = useRef(marcas);
  marcasRef.current = marcas;

  const alternar = useCallback(
    (dia, meal) => {
      const clave = claveConsumo(dia, meal);
      const firmaActual = firmaRef.current;
      const estaba = !!marcasRef.current[clave];

      const siguiente = { ...marcasRef.current };
      if (estaba) delete siguiente[clave];
      else siguiente[clave] = { consumido: true, ts: Date.now() };

      // Los efectos van FUERA del updater de estado: en StrictMode React lo
      // invoca dos veces por render y se habrían duplicado la escritura en
      // Firestore y el guardado en localStorage.
      marcasRef.current = siguiente;
      setMarcas(siguiente);
      saveConsumoLocal({ firma: firmaActual, marcas: siguiente });

      // La escritura remota no bloquea la interfaz: la casilla ya cambió.
      const promesa = estaba
        ? desmarcarConsumoRemoto(uid, clave)
        : marcarConsumoRemoto(uid, clave, firmaActual, siguiente[clave].ts);
      promesa.then((ok) => setSincronizado(ok));
    },
    [uid],
  );

  const reiniciar = useCallback(() => {
    marcasRef.current = {};
    setMarcas({});
    // Se guarda con la huella en vez de borrar la clave: así un menú que no
    // cambia no vuelve a heredar marcas viejas de otra pestaña.
    saveConsumoLocal({ firma: firmaRef.current, marcas: {} });
    reiniciarConsumoRemoto(uid, firmaRef.current).then((ok) =>
      setSincronizado(ok),
    );
  }, [uid]);

  return { marcas, cargando, sincronizado, estaConsumida, alternar, reiniciar };
};
