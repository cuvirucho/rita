import { useEffect, useState } from "react";
import { esMenuValido, loadMenu, saveMenu } from "./menuStorage";
import { cargarMenuRemoto } from "./menuRemoto";

/**
 * De dónde sale el menú del usuario: localStorage primero, Firestore después.
 *
 * El orden vive aquí y no repartido entre MisSemanales y RitaChat para que no
 * puedan desincronizarse:
 *   1. localStorage — instantáneo y sin coste. Si hay menú, NO se consulta
 *      Firestore.
 *   2. Firestore — solo si en local no había nada. Lo que encuentre se copia a
 *      localStorage para que la siguiente visita ya no lea.
 *   3. Nada en ninguno de los dos — `guardado` queda en null y la sección
 *      ofrece crear uno con Rita.
 *
 * @returns {{ estado: "resolviendo" | "listo", guardado: {menu, profile} | null }}
 */
export const useMenuGuardado = (uid) => {
  const [estado, setEstado] = useState("resolviendo");
  const [guardado, setGuardado] = useState(null);

  useEffect(() => {
    let vivo = true;
    setEstado("resolviendo");

    const local = loadMenu();
    if (esMenuValido(local?.menu)) {
      setGuardado({ menu: local.menu, profile: local.profile ?? null });
      setEstado("listo");
      return;
    }

    (async () => {
      const remoto = await cargarMenuRemoto(uid);
      if (!vivo) return;
      // saveMenu también borra los pedidos, y aquí es lo que toca: las claves
      // son "diaN:comida", así que unos pedidos huérfanos aplicados al menú que
      // llega de Firestore marcarían platos que nadie pidió.
      if (remoto) saveMenu(remoto);
      setGuardado(remoto);
      setEstado("listo");
    })();

    return () => {
      vivo = false;
    };
  }, [uid]);

  return { estado, guardado };
};
