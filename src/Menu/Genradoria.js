import { GoogleGenerativeAI } from "@google/generative-ai";

export const generarMenu = async (preferencias, ingredientes) => {
  const genAI = new GoogleGenerativeAI("AIzaSyCyWWJK42hC7xlKvXx-5_t_U_gmF4Wgi7U"); // Reemplaza con tu clave API
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  console.log(preferencias, "sonlaspere");
 

  const prompt = `
  Genera un menú de  7 dias  Ponle un nobre gurmet a todos los platos   Para cada día, quiero que sigas estrictamente el  formato JSON, usando claves como "desayuno", "snack1", "almuerzo", "snack2" y "cena". Agrega una pequeña y atractiva decipcion del plato que no super los 75 palabras 
 
  Cada comida debe incluir cantidades exactas en gramos de cada ingrediente y sus calorias vitaminas proteinas minerales.
  
  Considera las siguientes peticones del usuario: ${JSON.stringify(preferencias)}.
  Considera los gustos  del usuario: ${JSON.stringify(preferencias.like)}.

  El costo total del mes no debe superar los $30.
  Devuelve el menú en JSON con este formato:
  
  Tu respuesta debe ser **EXCLUSIVAMENTE** un JSON válido, sin texto adicional.
  NO agregues comentarios, explicaciones ni advertencias. Solo devuelve el JSON.
  ...
  **IMPORTANTE:** La respuesta debe ser **únicamente** un JSON válido y sin explicaciones. 
  No incluyas para nada markdown.
  **IMPORTANTE:** La respuesta debe ser exclusivamente un JSON válido y bien formado. No incluir texto adicional. 
  Si el JSON supera el límite de caracteres, divídelo en múltiples partes claramente separadas por ***PARTE 1***, ***PARTE 2***, etc.
  Asegúrate de que cada parte sea válida por sí misma y no esté truncada.
  

Cada comida debe tener:

"nombre" del plato

 "descripcion": Agrega una pequeña y atractiva decipcion del plato que no super los 75 palabras  

"ingredientes" como objeto con ingredientes y cantidades

"calorias" como número (sin llaves, ni comillas)

"vitaminas" como objeto con tipos y porcentaje

"proteinas" como objeto con clave "total"

"minerales" como objeto con tipo y cantidad

Formato JSON obligatorio   :

{
  "dia1": {
    "desayuno": {
      "nombre": "nombre del plato", 
      "descripcion": "descripcion del plato", 

      "ingredientes": {
        "ingrediente1": "cantidad",
        "ingrediente2": "cantidad",
        "ingrediente3": "cantidad"
      },
      "calorias": "valor",
      "vitaminas": {
        "vitamina1": "porcentaje",
        "vitamina2": "porcentaje"
      },
      "proteinas": {
        "total": "valor"
      },
      "minerales": {
        "mineral1": "cantidad"
      }
    },
    "snack1": {
      "nombre": "nombre del plato",
       "descripcion": "descripcion del plato", 
      "ingredientes": {
        "ingrediente1": "cantidad",
        "ingrediente2": "cantidad",
        "ingrediente3": "cantidad"
      },
      "calorias": "valor",
      "vitaminas": {
        "vitamina1": "porcentaje",
        "vitamina2": "porcentaje"
      },
      "proteinas": {
        "total": "valor"
      },
      "minerales": {
        "mineral1": "cantidad"
      }
    },
    "almuerzo": {
      "nombre": "nombre del plato",
       "descripcion": "descripcion del plato", 
      "ingredientes": {
        "ingrediente1": "cantidad",
        "ingrediente2": "cantidad",
        "ingrediente3": "cantidad"
      },
      "calorias": "valor",
      "vitaminas": {
        "vitamina1": "porcentaje",
        "vitamina2": "porcentaje"
      },
      "proteinas": {
        "total": "valor"
      },
      "minerales": {
        "mineral1": "cantidad"
      }
    },
    "snack2": {
      "nombre": "nombre del plato",
       "descripcion": "descripcion del plato", 
      "ingredientes": {
        "ingrediente1": "cantidad",
        "ingrediente2": "cantidad",
        "ingrediente3": "cantidad"
      },
      "calorias": "valor",
      "vitaminas": {
        "vitamina1": "porcentaje",
        "vitamina2": "porcentaje"
      },
      "proteinas": {
        "total": "valor"
      },
      "minerales": {
        "mineral1": "cantidad"
      }
    },
    "cena": {
      "nombre": "nombre del plato",
       "descripcion": "descripcion del plato", 
      "ingredientes": {
        "ingrediente1": "cantidad",
        "ingrediente2": "cantidad",
        "ingrediente3": "cantidad"
      },
      "calorias": "valor",
      "vitaminas": {
        "vitamina1": "porcentaje",
        "vitamina2": "porcentaje"
      },
      "proteinas": {
        "total": "valor"
      },
      "minerales": {
        "mineral1": "cantidad"
      }
    }
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
