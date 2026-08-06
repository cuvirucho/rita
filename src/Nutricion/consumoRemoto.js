// Respaldo en Firestore de las comidas marcadas como consumidas.
//
// Vive en el MISMO documento del usuario que el menú (`UsuariosActivos/{uid}`,
// campo `consumoNutricional`) y se escribe con rutas con puntos, igual que
// `guardarPlatoRemoto`: así una marca nunca puede pisar `menuCreado` ni el
// resto del documento con una copia vieja del cliente.
//
// Se lee por id de documento y con `onSnapshot`, no con una query de colección:
// las reglas solo conceden acceso a `UsuariosActivos/{uid} == request.auth.uid`
// y una query sería rechazada (firestore.rules). Ese listener es además lo que
// mantiene las marcas sincronizadas entre dispositivos sin recargar.
import { deleteField, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../FIRBAS/Firebase";

/**
 * Escucha el documento del usuario.
 *
 * @param {string} uid
 * @param {(datos: object|null) => void} alCambiar  recibe los datos del doc
 * @returns {() => void} función para dejar de escuchar
 */
export const escucharUsuario = (uid, alCambiar) => {
  if (!uid) return () => {};

  try {
    return onSnapshot(
      doc(db, "UsuariosActivos", uid),
      (snap) => alCambiar(snap.exists() ? snap.data() : null),
      // Sin red, sin permisos o documento con otro id (los usuarios creados por
      // Payphone llevan el clientTxId como id, no el uid): se avisa con null y
      // la sección sigue funcionando contra localStorage.
      () => alCambiar(null),
    );
  } catch {
    return () => {};
  }
};

/**
 * Marca una comida como consumida.
 *
 * `Date.now()` y no `serverTimestamp()`: la marca se pinta de inmediato en
 * local y el valor optimista tiene que ser del mismo tipo que el que devuelve
 * el servidor, o el espejo en localStorage guardaría un centinela sin resolver.
 *
 * @returns {Promise<boolean>} si se pudo persistir
 */
export const marcarConsumoRemoto = async (uid, clave, firma, ts = Date.now()) => {
  if (!uid || !clave) return false;

  try {
    await updateDoc(doc(db, "UsuariosActivos", uid), {
      [`consumoNutricional.marcas.${clave}`]: { consumido: true, ts },
      "consumoNutricional.firma": firma ?? null,
    });
    return true;
  } catch {
    // Mismo criterio que menuRemoto.js: la casilla ya cambió en pantalla y en
    // localStorage, así que el usuario no ve un error. Solo se pierde el
    // respaldo si además limpia el navegador.
    return false;
  }
};

/**
 * Desmarca una comida.
 *
 * Borra el campo en vez de guardar `consumido: false` para que el mapa no
 * crezca sin límite y para que "comidas hechas = número de claves" sea exacto.
 */
export const desmarcarConsumoRemoto = async (uid, clave) => {
  if (!uid || !clave) return false;

  try {
    await updateDoc(doc(db, "UsuariosActivos", uid), {
      [`consumoNutricional.marcas.${clave}`]: deleteField(),
    });
    return true;
  } catch {
    return false;
  }
};

/** Vacía todas las marcas de la semana y deja anotada la huella del menú. */
export const reiniciarConsumoRemoto = async (uid, firma) => {
  if (!uid) return false;

  try {
    await updateDoc(doc(db, "UsuariosActivos", uid), {
      consumoNutricional: { firma: firma ?? null, marcas: {} },
    });
    return true;
  } catch {
    return false;
  }
};
