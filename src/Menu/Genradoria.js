import { GoogleGenerativeAI } from "@google/generative-ai";

export const generarMenu = async (preferencias, ingredientes) => {
  const genAI = new GoogleGenerativeAI("AIzaSyCyWWJK42hC7xlKvXx-5_t_U_gmF4Wgi7U"); // Reemplaza con tu clave API
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  console.log(preferencias, "sonlaspere");
  console.log(ingredientes, "igetis a usar");

  const prompt = `
  Genera un menú de  7 dias  Ponle un nobre gurmet a todos los platos   con desayuno, snack de media mañana, almuerzo, snack de media tarde y cena. Agrega una pequeña y atractiva decipcion del plato que no super los 75 palabras 
  Considera los ingredientes disponibles en la bodega: ${Object.keys(ingredientes).join(", ")}.
  Cada comida debe incluir cantidades exactas en gramos de cada ingrediente y suss calorias
  Considera las siguientes restricciones del usuario: ${JSON.stringify(preferencias)}.
  El costo total del mes no debe superar los $10.
  Devuelve el menú en JSON con este formato:
  
  Tu respuesta debe ser **EXCLUSIVAMENTE** un JSON válido, sin texto adicional.
  NO agregues comentarios, explicaciones ni advertencias. Solo devuelve el JSON.
  ...
  **IMPORTANTE:** La respuesta debe ser **únicamente** un JSON válido y sin explicaciones. 
  No incluyas para nada markdown.
  **IMPORTANTE:** La respuesta debe ser exclusivamente un JSON válido y bien formado. No incluir texto adicional. 
  Si el JSON supera el límite de caracteres, divídelo en múltiples partes claramente separadas por ***PARTE 1***, ***PARTE 2***, etc.
  Asegúrate de que cada parte sea válida por sí misma y no esté truncada.
  
  El formato debe ser el siguiente:
  {
    "dia1": {
      "desayuno": { "nombre": "Avena con frutos secos", "ingredientes": { "avena": "50g", "nueces": "15g", "leche": "200ml" }, calorias:{758}  },
      "snack1": { "nombre": "Batido de proteína", "ingredientes": { "leche": "250ml", "plátano": "100g", "proteína en polvo": "30g" } ,calorias:{7758} },
      "almuerzo": { "nombre": "Pechuga de pollo con arroz", "ingredientes": { "pollo": "150g", "arroz": "120g", "brócoli": "100g" } ,calorias:{78} },
      "snack2": { "nombre": "Yogur con almendras", "ingredientes": { "yogur": "200g", "almendras": "20g" },calorias:{77758}},
      "cena": { "nombre": "Ensalada de atún", "ingredientes": { "atún": "120g", "lechuga": "50g", "aguacate": "50g" },calorias:{7588888} }
    }
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error("La IA no devolvió una respuesta válida");
      return null;
    }

    const textResponse = response.candidates[0].content.parts[0].text;

    // Intentar reparar el JSON antes de analizarlo
    const cleanedResponse = repararJSON(textResponse);

    if (!cleanedResponse) {
      console.error("No se pudo reparar el JSON");
      return null;
    }

    console.log("Respuesta de la IA:", cleanedResponse);
    return cleanedResponse;
  } catch (error) {
    console.error("Error al generar el menú:", error);
    return null;
  }
};

// Función para reparar JSON truncado o malformado
function repararJSON(jsonString) {
  // Eliminar caracteres no deseados
  let cleanedString = jsonString.replace(/```json|```/g, '').trim();

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
