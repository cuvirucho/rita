const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const crypto = require("crypto");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const app = express();

const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN;
const STORE_ID = process.env.STORE_ID;

/*ia*/

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://ritafitcanbio.netlify.app",
      "http://localhost:5173/Formulariopagos",
      "https://moritasgo.netlify.app",
      "https://ritafit.com",
      "https://ritafit.netlify.app", // cambia por tu dominio
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json());

/**
 * Crear orden
 */
app.post("/create-order", async (req, res) => {
  try {
    const { cart } = req.body;
    if (!cart) return res.status(400).json({ error: "Carrito vacío" });
    let amountWithoutTax = Number(cart.precioVenta);
    // calcular impuesto
    let tax = Math.round(amountWithoutTax * parseFloat(process.env.TAX_RATE));

    // convertir a centavos
    amountWithoutTax = Math.round(amountWithoutTax * 100);
    tax = Math.round(tax * 100);

    const amountWithTax = amountWithoutTax + tax;

    const service = 0;
    const tip = 0;

    const amount = amountWithTax + service + tip;
    const clientTransactionId = `order_${uuidv4()}`;
    const docRef = await db
      .collection("RegistradosNoactivos") // colección principal
      .doc("ordenesdepacobro") // documento específico del usuario
      .collection("orders") // subcolección orders
      .add({
        clientTransactionId,
        cart,
        menu: {}, // aquí podrías guardar el menú generado para este pedido
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    // console.log(amount, "catida");
    // console.log(tax, "impuesto");
    // console.log(amountWithoutTax, "valor sin impuestos");

    res.json({
      clientTransactionId,
      amount,
      amountWithoutTax,
      amountWithTax,
      tax,
      service,
      tip,
      currency: "USD",
      storeId: STORE_ID,
      token: PAYPHONE_TOKEN,
      reference: `Pedido-${clientTransactionId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Confirmar pago
 */

app.post("/confirm", async (req, res) => {
  try {
    const { id, clientTxId } = req.body;

    if (!id || !clientTxId) {
      return res.status(400).json({ error: "id y clientTxId requeridos" });
    }

    const resp = await fetch(
      "https://pay.payphonetodoesposible.com/api/button/V2/Confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYPHONE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(id),
          clientTxId,
        }),
      },
    );

    const text = await resp.text();
    // console.log("Respuesta Payphone:", text);

    const data = JSON.parse(text);

    if (data.transactionStatus === "Approved") {
      const ordersRef = db
        .collection("RegistradosNoactivos")
        .doc("ordenesdepacobro")
        .collection("orders");

      const querySnapshot = await ordersRef
        .where("clientTransactionId", "==", clientTxId)
        .get();

      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();
        console.log("Datos de la orden:", orderData);
        console.log("Datos de la transacción:", data);

        // Verificar si ya existe un usuario activo con el mismo email
        const email = data.email ? data.email.trim().toLowerCase() : null;
        let existingUserDoc = null;

        const existingQuery = await db
          .collection("UsuariosActivos")
          .where("datapayphone.email", "==", email)
          .get();

        if (!existingQuery.empty) {
          existingUserDoc = existingQuery.docs[0];
          console.log(existingUserDoc);
        }
        console.log(existingUserDoc);

        if (existingUserDoc) {
          // Usuario ya existe: solo actualizar el plan/cart y datos del nuevo pago
          await existingUserDoc.ref.update({
            cart: orderData.cart,
            activatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          data.renovacion = true;
        } else if (data.amount !== 4200) {
          // Usuario nuevo: crear documento completo (solo si el monto NO es 4200)
          await db
            .collection("UsuariosActivos")
            .doc(clientTxId)
            .set({
              ...orderData,
              authorizationCode: data.authorizationCode,
              transactionStatus: data.transactionStatus,
              datapayphone: data,
              ubicacines: {},
              activatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          const sendemailwelcome = await fetch(
            "https://apiapp-gq4hj2kfcq-uc.a.run.app/senwelcome",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${PAYPHONE_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: data.email,
                tepcodig: data.authorizationCode,
              }),
            },
          );
          data.renovacion = false;
          const textemail = await sendemailwelcome.text();
          console.log("Respuesta envarcorreo:", textemail);
        }
      } else {
        console.warn(
          `Orden no encontrada para clientTransactionId: ${clientTxId}`,
        );
        return res.json({ error: "Orden no encontrada" });
      }
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/*crador de menupruen*/

/**
 * Ingredientes disponibles en la bodega (documento global gestionado en
 * Firestore), reducidos a { nombre, costoUnitario } para el prompt.
 *
 * Vive fuera de los endpoints porque lo usan tanto /generarMenu como
 * /regenerarPlato: la restricción de ingredientes tiene que ser la misma en el
 * menú completo y en el plato que se regenera, o el usuario podría cambiar un
 * plato por otro que la cocina no puede preparar.
 */
const cargarIngredientesBodega = async () => {
  const bodegaSnap = await db.collection("bodega").doc("mi_bodega").get();
  if (!bodegaSnap.exists) return [];

  const { ingredientes } = bodegaSnap.data();
  if (!ingredientes?.length) return [];

  return ingredientes.map((i) => ({
    nombre: i.nombre,
    costoUnitario: i.costoPorUnidad,
  }));
};

app.post("/generarMenu", async (req, res) => {
  try {
    const { preferencias } = req.body;
    // Opcional en las dos: sin `?.` un body sin `preferencias` reventaba aquí
    // con un TypeError y devolvía un 500 en vez del 400 "Faltan datos".
    const plan = req.body.plan ?? preferencias?.plan ?? "free"; // valor por defecto si no se proporciona
    // El userId puede venir de primer nivel o anidado dentro de preferencias
    // (así lo envía hoy el flujo de Rita: preferencias.userId).
    const userId = req.body.userId ?? preferencias?.userId;

    if (!userId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // Validar que el usuario exista en UsuariosActivos (campo uid, creado en el
    // registro). Si no se encuentra, no se genera el menú.
    const snapshot = await db
      .collection("UsuariosActivos")
      .where("uid", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const ingredientesBodega = await cargarIngredientesBodega();

    // Cuando hay bodega, la IA queda restringida a esos ingredientes con un tope
    // de costo; si está vacía se mantiene el comportamiento anterior ($50 ref.).
    const hayBodega = ingredientesBodega.length > 0;
    const bloqueBodega = hayBodega
      ? `\nBODEGA (ingredientes disponibles — usa SOLO estos, no agregues otros):\n${JSON.stringify(
          ingredientesBodega,
        )}\n`
      : "";
    const reglaCosto = hayBodega
      ? "- El costo total de las comidas NO debe superar $30 semanales .\n- Usa únicamente ingredientes de la bodega."
      : "-  usa 50 dólares como referencia";

    // Los datos pueden llegar como objeto (perfil construido por Rita) o como
    // string. Se serializan para que lleguen legibles al prompt (antes se
    // interpolaba el objeto y se convertía en "[object Object]").
    const datos =
      typeof preferencias === "string"
        ? preferencias
        : JSON.stringify(preferencias, null, 2);

    const prompt = `
Genera un menú gourmet de 5 días completamente personalizado.

PREFERENCIAS:
- Alimentos que le gustan: usa datos de preferencias para incluir solo alimentos que le gusten al usuario
- Alimentos que NO le gustan: usa datos de preferencias para excluir alimentos que no le gusten al usuario  
DATOS DEL USUARIO: ${datos}
${bloqueBodega}
REQUISITOS:
- Eres un nutricionista profesional.
- Menú para 5 días no mas solo 5 dias de lunes a viernes
- segun el plan del usuario tine activo : ${plan} si el plan free o el plan starter tienen  3 comidas que son desayuno almuerso ,cena y un snack o bebida  pero si el plan es premium tienen  3 comidas que son desayuno almuerso ,cena y un snack una bebida  
- Cada plato debe tener un nombre gourmet
- Incluir una descripción atractiva (máx 50 palabras)
- Incluir ingredientes con cantidades exactas
- Incluir calorías, vitaminas, proteínas y minerales
${reglaCosto}
- Respeta las alergias, enfermedades y restricciones indicadas: nunca incluyas un alimento prohibido
- Ten en cuenta el nivel de actividad física
Devuelve el menú en JSON con este formato:
Tu respuesta debe ser **EXCLUSIVAMENTE** un JSON válido, sin texto adicional.
NO agregues comentarios, explicaciones ni advertencias. Solo devuelve el JSON.
...
**IMPORTANTE:** La respuesta debe ser **únicamente** un JSON válido y sin explicaciones. 
No incluyas para nada markdown.
**IMPORTANTE:** La respuesta debe ser exclusivamente un JSON válido y bien formado. No incluir texto adicional.
Asegúrate de que cada parte sea válida por sí misma y no esté truncada.

Cada comida debe tener:
"nombre"un nombre subliminalmente atractivo del plato
"descripcion": Agrega una pequeña y atractiva decipcion del plato que se entida que es y  que no supere las 50 palabras
"ingredientes" como objeto con ingredientes y cantidades
"calorias" como número (sin llaves, ni comillas)
"vitaminas" como objeto con tipos y porcentaje
"proteinas" como objeto con clave "total"
"minerales" como objeto con tipo y cantidad

En "resumen_semanal":
"objetivo" el objetivo del usuario en una frase corta (ej. "Ganar masa muscular")
Los "_promedio" son el promedio DIARIO como número, sin unidades ni texto:
escribe 2400, no "2400 kcal" ni "aprox. 2400". Calorías en kcal y el resto en gramos.

FORMATO:
Devuelve SOLO JSON válido sin texto adicional.
Estructura obligatoria
Formato JSON obligatorio:
{
  "dia": {
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
    "snack": {
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
    "bebida": {
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
    },
"resumen_semanal": {
  "objetivo": "valor",
  "calorias_promedio": "valor",
  "proteinas_promedio": "valor",
  "carbohidratos_promedio": "valor",
  "grasas_promedio": "valor",
  "fibra_promedio": "valor"
}

    }
IMPORTANTE:
- NO markdown
- SOLO JSON DE LOS DIAS CON EL FORMATO INDICADO
- NO explicaciones
- SOLO JSON válido

  `;
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 16000,
      system:
        "Eres un nutricionista profesional. Responde EXCLUSIVAMENTE con un JSON válido y bien " +
        "formado, sin markdown, sin comentarios y sin texto adicional.",
      messages: [{ role: "user", content: prompt }],
    });

    // El SDK devuelve content como array de bloques; tomar el bloque de texto.
    const textResponse =
      message.content.find((b) => b.type === "text")?.text ?? "";

    if (!textResponse) {
      return res.status(500).json({ error: "La IA no devolvió respuesta" });
    }
    console.log(prompt);

    console.log(textResponse);

    const cleaned = repararJSON(textResponse);

    // `repararJSON` devuelve null si el JSON de la IA no se pudo arreglar. Se
    // corta aquí, ANTES del update: si no, se guardaba ese null en Firestore
    // (respondiendo success: true) y se destruía el menú bueno que el usuario
    // ya tenía guardado, que es justo el que la app recupera cuando el
    // navegador se queda sin localStorage.
    if (!cleaned || typeof cleaned !== "object") {
      return res.status(500).json({ error: "La IA devolvió un menú inválido" });
    }

    const usuarioDoc = snapshot.docs[0];

    await usuarioDoc.ref.update({
      menuCreado: cleaned,
      // El perfil se guarda junto al menú para poder restaurarlo desde
      // Firestore: la pantalla del menú lo usa para nombrar el objetivo.
      menuCreadoPerfil:
        preferencias && typeof preferencias === "object" ? preferencias : null,
      menuCreadoFecha: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      menu: cleaned,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando menú" });
  }
});

/* ============================================================
   REGENERAR UN PLATO SUELTO
   El usuario abre el chat de edición desde el detalle de una comida
   (Rita/ModalEditarPlato.jsx), cuenta qué no le gusta y la IA
   devuelve OTRO plato del mismo tipo.

   A diferencia de /generarMenu, este endpoint NO escribe en
   Firestore: el plato viaja al cliente como propuesta y solo se
   guarda si el usuario pulsa "Guardar plato". Esa escritura la hace
   el cliente con el SDK (menuRemoto.js), que sí pasa por las reglas
   de seguridad — aquí no hay forma de verificar que el `userId` del
   body sea de quien llama.
   ============================================================ */

app.post("/regenerarPlato", async (req, res) => {
  try {
    const { userId, mealType, currentMeal, feedback, historial } = req.body;

    if (!userId || !mealType || !currentMeal) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // Misma búsqueda que /generarMenu (campo `uid`, no el id del documento)
    // para que los dos endpoints acepten exactamente los mismos usuarios.
    const snapshot = await db
      .collection("UsuariosActivos")
      .where("uid", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const ingredientesBodega = await cargarIngredientesBodega();
    const hayBodega = ingredientesBodega.length > 0;
    const bloqueBodega = hayBodega
      ? `\nBODEGA (ingredientes disponibles — usa SOLO estos, no agregues otros):\n${JSON.stringify(
          ingredientesBodega,
        )}\n`
      : "";
    // El tope de /generarMenu es semanal y aquí solo se cambia un plato, así
    // que la regla se queda en la restricción de ingredientes.
    const reglaCosto = hayBodega
      ? "- Usa únicamente ingredientes de la bodega.\n- Mantén un costo similar al del plato actual."
      : "- Mantén un costo similar al del plato actual.";

    // El perfil que se guardó junto al menú: es lo que mantiene las alergias y
    // el objetivo del usuario vigentes en el plato nuevo. Sin él la IA solo
    // conoce el plato actual y podría colar un alimento prohibido.
    const { menuCreadoPerfil } = snapshot.docs[0].data();
    const perfilTexto = menuCreadoPerfil
      ? JSON.stringify(menuCreadoPerfil, null, 2)
      : "No disponible.";

    // Los turnos previos van como texto dentro del prompt y no como `messages`
    // de la API: así no hay que garantizar la alternancia user/assistant que
    // esa forma exige. Solo los últimos turnos, que es lo que da contexto.
    const historialTexto = Array.isArray(historial)
      ? historial
          .slice(-8)
          .filter((t) => t?.text)
          .map((t) => `${t.from === "user" ? "usuario" : "Rita"}: ${t.text}`)
          .join("\n")
      : "";

    const prompt = `
Eres Rita, nutricionista virtual. El usuario quiere CAMBIAR un plato de su menú.
Responde con calidez, en español, con tono cercano de WhatsApp.

PLATO ACTUAL (${mealType}):
${JSON.stringify(currentMeal, null, 2)}

PERFIL DEL USUARIO (respeta SIEMPRE sus alergias y restricciones):
${perfilTexto}
${bloqueBodega}
CONVERSACIÓN PREVIA:
${historialTexto || "Ninguna, es el primer mensaje."}

LO QUE PIDE AHORA EL USUARIO:
${feedback || "Quiere otra opción distinta."}

REGLAS:
- Si rechaza el plato o un ingrediente: cámbialo de verdad, no devuelvas lo mismo.
- Si el comentario es positivo o pide un ajuste menor: conserva al menos un ingrediente o la idea del plato.
- El plato nuevo debe seguir siendo del tipo de comida: ${mealType}.
- Nunca incluyas un alimento prohibido por alergias o restricciones del perfil.
${reglaCosto}
- "mensaje": una o dos frases explicando qué cambiaste. Sin markdown.
- "nombre": un nombre gourmet y apetecible.
- "descripcion": atractiva y que se entienda qué es, máximo 50 palabras.
- "calorias" como número, sin comillas ni unidades.
- "ingredientes" como objeto con ingredientes y cantidades exactas.
- "vitaminas" como objeto con tipos y porcentaje.
- "proteinas" como objeto con clave "total".
- "minerales" como objeto con tipo y cantidad.

FORMATO (SOLO JSON válido, sin markdown, sin explicaciones):
{
  "mensaje": "texto corto para el chat",
  "plato": {
    "nombre": "nombre del plato",
    "descripcion": "descripcion del plato",
    "ingredientes": {
      "ingrediente1": "cantidad",
      "ingrediente2": "cantidad"
    },
    "calorias": 0,
    "vitaminas": {
      "vitamina1": "porcentaje"
    },
    "proteinas": {
      "total": 0
    },
    "minerales": {
      "mineral1": "cantidad"
    }
  }
}

IMPORTANTE:
- NO markdown
- NO explicaciones
- SOLO JSON válido
`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system:
        "Eres una nutricionista profesional. Responde EXCLUSIVAMENTE con un JSON válido y bien " +
        "formado, sin markdown, sin comentarios y sin texto adicional.",
      messages: [{ role: "user", content: prompt }],
    });

    const textResponse =
      message.content.find((b) => b.type === "text")?.text ?? "";

    if (!textResponse) {
      return res.status(500).json({ error: "La IA no devolvió respuesta" });
    }

    console.log(textResponse);

    const cleaned = repararJSON(textResponse);

    // Mismo motivo que el guard de /generarMenu: `repararJSON` devuelve null
    // con un JSON irreparable, y un plato a medias (sin nombre) rompería la
    // tarjeta del menú si el usuario lo guardara.
    if (!cleaned?.plato?.nombre) {
      return res.status(500).json({ error: "La IA devolvió un plato inválido" });
    }

    res.json({
      success: true,
      mensaje: cleaned.mensaje || "Te preparé otra opción, dime qué te parece 😊",
      plato: cleaned.plato,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error regenerando el plato" });
  }
});

/* ============================================================
   RITA — Chat conversacional (nutricionista virtual)
   Conversa con el usuario, decide dinámicamente cada pregunta y,
   cuando tiene información suficiente, llama a la herramienta
   "guardar_perfil" para cerrar la conversación con el perfil listo.
   ============================================================ */

const RITA_SYSTEM = `Eres Rita, una nutricionista virtual cálida, profesional y motivadora.
Hablas en español con un tono cercano, humano y natural, como si conversaras por WhatsApp.
Tu ÚNICO objetivo es conocer al usuario para diseñarle un menú alimenticio personalizado.

Reglas de la conversación:
- Preséntate brevemente en tu primer mensaje y haz SOLO una pregunta.
- Haz UNA sola pregunta por mensaje. Nunca envíes una lista de preguntas ni parezcas un formulario.
- Antes de cada nueva pregunta, comenta con calidez y de forma breve la respuesta anterior
  (por ejemplo: "¡Excelente objetivo! 💪", "Perfecto, eso me ayudará mucho.",
  "Entiendo, evitaremos esos alimentos."). Usa emojis con moderación.
- Decide dinámicamente la siguiente pregunta según lo que el usuario ya te contó; adáptate a sus
  respuestas (si es vegetariano, profundiza en proteínas vegetales; si quiere masa muscular,
  pregunta por entrenamiento o consumo de proteína; etc.). Cada conversación puede ser distinta.
- Debes averiguar de forma progresiva: objetivo, edad, peso, estatura, nivel de actividad física,
  enfermedades o alergias, alimentos favoritos, alimentos que no le gustan y preferencias alimenticias. Añade cualquier otra pregunta que
  consideres útil para un mejor menú. (NO preguntes cuántas comidas al día: eso lo define su plan.)
- No te desvíes hacia temas ajenos a la nutrición ni alargues la conversación innecesariamente.
- Nunca preguntes indefinidamente. En cuanto tengas información suficiente para un menú de alta
  calidad, DEJA de preguntar y LLAMA a la herramienta "guardar_perfil" con todos los datos
  recopilados. Acompáñala de un mensaje cálido de cierre.`;

const guardarPerfilTool = {
  name: "guardar_perfil",
  description:
    "Guarda el perfil completo del usuario. Llámala SOLO cuando ya tengas información suficiente " +
    "para diseñar un menú de alta calidad; a partir de ese momento no se harán más preguntas.",
  input_schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "nombre del usuario si lo mencionó",
      },
      goal: {
        type: "string",
        description: "objetivo principal (ej. bajar peso, ganar músculo)",
      },
      age: { type: "number", description: "edad en años" },
      weight: { type: "number", description: "peso en kg" },
      height: { type: "number", description: "estatura en cm" },
      activity: { type: "string", description: "nivel de actividad física" },
      allergies: { type: "string", description: "enfermedades o alergias" },
      likes: { type: "string", description: "alimentos favoritos" },
      dislikes: { type: "string", description: "alimentos que no le gustan" },
      preferences: {
        type: "string",
        description: "preferencias alimenticias (vegetariano, keto, etc.)",
      },
      notes: {
        type: "string",
        description: "cualquier otro dato relevante para el menú",
      },
    },
    required: ["goal"],
  },
};

const RITA_CIERRE =
  "Perfecto. Ya tengo toda la información que necesito. Ahora voy a diseñar un menú " +
  "completamente personalizado para ti.";

app.post("/ritaChat", async (req, res) => {
  try {
    const { messages } = req.body;

    // El array de mensajes ES la memoria de la conversación; llega completo del
    // cliente en cada turno (backend stateless). Si viene vacío, se siembra un
    // turno inicial para que Rita genere su saludo y primera pregunta.
    const convo =
      Array.isArray(messages) && messages.length > 0
        ? messages
        : [
            {
              role: "user",
              content: "Hola, quiero crear mi menú personalizado.",
            },
          ];

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: RITA_SYSTEM,
      tools: [guardarPerfilTool],
      messages: convo,
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (toolUse) {
      return res.json({
        done: true,
        profile: toolUse.input,
        message: text || RITA_CIERRE,
      });
    }

    return res.json({ done: false, message: text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error en la conversación con Rita" });
  }
});

function repararJSON(jsonString) {
  let cleanedString = jsonString.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanedString);
  } catch {
    let open = (cleanedString.match(/{/g) || []).length;
    let close = (cleanedString.match(/}/g) || []).length;

    while (close < open) {
      cleanedString += "}";
      close++;
    }

    try {
      return JSON.parse(cleanedString);
    } catch {
      return null;
    }
  }
}

/*Verifvar corrrep*/

app.post("/Verificaremail", async (req, res) => {
  try {
    let { email, userId } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    email = email.trim().toLowerCase();

    const usersRef = db.collection("UsuariosActivos");

    const querySnapshot = await usersRef
      .where("datapayphone.email", "==", email)
      .get();

    let exists = false;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(data);

      // 🔥 ignorar el mismo usuario
      if (data.clientTransactionId !== userId) {
        exists = true;
      }
    });

    return res.json({
      exists,
      message: exists ? "El correo ya está en uso" : "Correo disponible",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/*actualisar correo*/
app.post("/updateEmail", async (req, res) => {
  try {
    const { userId, newEmail } = req.body;

    if (!userId || !newEmail) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const emailNormalized = newEmail.trim().toLowerCase();

    const usersRef = db.collection("UsuariosActivos");

    // 🔴 1. Verificar si el correo ya está en uso por OTRO usuario
    const emailQuery = await usersRef
      .where("datapayphone.email", "==", emailNormalized)
      .get();

    let emailEnUso = false;

    emailQuery.forEach((doc) => {
      const data = doc.data();

      if (data.clientTransactionId !== userId) {
        emailEnUso = true;
      }
    });

    if (emailEnUso) {
      return res.json({
        success: false,
        message: "El correo ya está en uso por otro usuario",
      });
    }

    // 🟢 2. Buscar usuario actual
    const userQuery = await usersRef
      .where("clientTransactionId", "==", userId)
      .get();

    if (userQuery.empty) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const userDoc = userQuery.docs[0];

    // 🟢 3. Actualizar email
    await userDoc.ref.update({
      "datapayphone.email": emailNormalized,
    });

    return res.json({
      success: true,
      message: "Correo actualizado correctamente",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/*bajar el plan a starter*/
app.post("/downgradePlan", async (req, res) => {
  console.log("entro en downgrade plan");

  try {
    const { userId } = req.body;

    if (!userId) {
      console.log("faltan datos");
      return res.status(400).json({ error: "Faltan datos" });
    }

    await db.collection("UsuariosActivos").doc(userId).update({
      "cart.nombre": "Plan Starter",
      "cart.datedAt": new Date().toISOString(),
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al bajar plan" });
  }
});

exports.api = onRequest(app);
