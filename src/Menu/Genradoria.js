import { esMenuValido } from "../Rita/menuStorage";

export const generarMenu = async (preferencias, plan) => {
  const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/generarMenu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: preferencias?.userId,
      preferencias: preferencias,
      plan: plan,
    }),
  });

  // Sin esto, un 400/404/500 devolvía `data.menu === undefined` sin lanzar: el
  // chat lo guardaba como si fuera un menú y luego pintaba la pantalla de error
  // sin distinguir entre "la IA falló" y "el usuario no existe".
  if (!resp.ok) {
    const detalle = await resp.json().catch(() => ({}));
    throw new Error(detalle.error || `Error ${resp.status} generando el menú`);
  }

  const data = await resp.json();

  if (!esMenuValido(data?.menu)) {
    throw new Error("El menú recibido no es válido");
  }

  return data.menu;
};
