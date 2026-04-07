const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://ritafitcanbio.netlify.app",
      "http://localhost:5173/Formulariopagos",
      "https://moritasgo.netlify.app",
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

        if (existingUserDoc) {
          // Usuario ya existe: solo actualizar el plan/cart y datos del nuevo pago
          await existingUserDoc.ref.update({
            cart: orderData.cart,

            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
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
        }
      } else {
        console.warn(
          `Orden no encontrada para clientTransactionId: ${clientTxId}`,
        );
      }
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/*crador de menupruen*/

app.post("/generarMenu", async (req, res) => {
  try {
    const { preferencias } = req.body;

    const prompt = `
  Genera un menú de  7 dias  Ponle un nombre gurmet a todos los platos   Para cada día, quiero que sigas estrictamente el  formato JSON, usando claves como "desayuno", "snack1", "almuerzo", "snack2" y "cena". Agrega una pequeña y atractiva decipcion del plato que no super los 75 palabras 
 
  Cada comida debe incluir cantidades exactas en gramos de cada ingrediente y sus calorias vitaminas proteinas minerales.
  
  Considera las siguientes peticones del usuario: ${JSON.stringify(
    preferencias,
  )}.
  Considera los gustos  del usuario: ${JSON.stringify(preferencias.like)}.

  El costo total del mes no debe superar los $100.
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

 "descripcion": Agrega una pequeña y atractiva decipcion del plato que no super las 100 palabras  

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

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (!response || !response.candidates?.length) {
      return res.status(500).json({ error: "La IA no devolvió respuesta" });
    }

    const textResponse = response.candidates[0].content.parts[0].text;

    const cleaned = repararJSON(textResponse);

    res.json({
      success: true,
      menu: cleaned,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando menú" });
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

exports.api = onRequest(app);
