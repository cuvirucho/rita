import { GoogleGenerativeAI } from "@google/generative-ai";

export const generarMenu = async (preferencias) => {
  const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/generarMenu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preferencias: preferencias,
    }),
  });

  const data = await resp.json();

  // console.log(data.menu);
  return data.menu;
};

// Función para reparar JSON truncado o malformado
function repararJSON(jsonString) {
  // Eliminar caracteres no deseados
  let cleanedString = jsonString.replace(/```json|```/g, "").trim();

  // Intentar analizar el JSON
  try {
    return JSON.parse(cleanedString);
  } catch (error) {
    console.error("Error al analizar el JSON:", error.message);

    // Detectar si hay una cadena sin cerrar
    const match = cleanedString.match(/"([^"]*)$/);
    if (match) {
      console.warn("Cadena truncada detectada, intentando corregir...");
      cleanedString += '"}'; // Cierra la cadena
    }

    // Detectar si falta una llave de cierre
    let openBraces = (cleanedString.match(/{/g) || []).length;
    let closeBraces = (cleanedString.match(/}/g) || []).length;

    while (closeBraces < openBraces) {
      cleanedString += "}";
      closeBraces++;
    }

    // Reintentar parsear después de la corrección
    try {
      return JSON.parse(cleanedString);
    } catch (finalError) {
      console.error("No se pudo reparar el JSON:", finalError.message);
      return null;
    }
  }
}
