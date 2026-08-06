// Respaldo del menú en Firestore. El backend ya guarda cada menú que genera en
// `UsuariosActivos.menuCreado` (functions/index.js, POST /generarMenu); esto es
// el lado que lo lee, para que el menú sobreviva a limpiar el navegador, al modo
// incógnito o a entrar desde otro dispositivo.
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../FIRBAS/Firebase";
import { esMenuValido } from "./menuStorage";

/**
 * Menú guardado en Firestore, o null si no hay ninguno servible.
 *
 * Se lee por id de documento y no con la query `where("uid","==",uid)` que usa
 * el backend porque las reglas solo conceden lectura sobre
 * `UsuariosActivos/{uid} == request.auth.uid`: una query de colección sería
 * rechazada, ya que las reglas no pueden garantizar qué documentos devuelve.
 * Es el mismo documento en ambos casos — el registro (Auth/AuthPanel.jsx) crea
 * el documento con id = uid y además con el campo `uid`.
 */
export const cargarMenuRemoto = async (uid) => {
  if (!uid) return null;

  try {
    const snap = await getDoc(doc(db, "UsuariosActivos", uid));
    if (!snap.exists()) return null;

    const { menuCreado, menuCreadoPerfil } = snap.data();
    if (!esMenuValido(menuCreado)) return null;

    // El perfil solo acompaña a los menús generados después de que el backend
    // empezara a guardarlo; sin él MenuResultado omite la frase del objetivo.
    return { menu: menuCreado, profile: menuCreadoPerfil ?? null };
  } catch {
    // Sin red, sin permisos o documento con otro id: se comporta como "no hay
    // menú" para que el usuario pueda seguir al chat en vez de quedarse
    // bloqueado con un error.
    return null;
  }
};

/**
 * Guarda en Firestore el plato que el usuario aceptó en el chat de edición.
 *
 * Escribe solo esa comida con una ruta con puntos (`menuCreado.dia1.almuerzo`)
 * en vez de reescribir `menuCreado` entero: así no hay forma de pisar el resto
 * del menú con una copia vieja del cliente. `dia` y `meal` son claves simples
 * generadas por el backend ("dia1", "almuerzo"), nunca texto del usuario.
 *
 * Lo escribe el cliente y no el backend porque estas reglas sí comprueban quién
 * llama (`UsuariosActivos/{uid} == request.auth.uid`), mientras que los
 * endpoints aceptan cualquier `userId` del body.
 *
 * @returns {Promise<boolean>} si se pudo persistir
 */
export const guardarPlatoRemoto = async (uid, dia, meal, plato) => {
  if (!uid || !dia || !meal || !plato) return false;

  try {
    await updateDoc(doc(db, "UsuariosActivos", uid), {
      [`menuCreado.${dia}.${meal}`]: plato,
    });
    return true;
  } catch {
    // Sin red o sin permisos: el menú ya cambió en pantalla y en localStorage,
    // así que el usuario ve su plato nuevo igualmente. Solo se pierde el
    // respaldo si además limpia el navegador.
    return false;
  }
};
