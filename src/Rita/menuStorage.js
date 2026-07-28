// Persistencia del menú generado por IA en localStorage.
// Centraliza la clave y el acceso (envuelto en try/catch) para no duplicarla
// entre RitaChat y MisSemanales. Sigue la convención del proyecto: clave en
// snake_case con prefijo "rita_" (como "rita_ia_trials").
const MENU_KEY = "rita_menu";

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
};

export const clearMenu = () => {
  try {
    localStorage.removeItem(MENU_KEY);
  } catch {
    /* ignore */
  }
};

export const hasMenu = () => {
  try {
    return !!localStorage.getItem(MENU_KEY);
  } catch {
    return false;
  }
};
