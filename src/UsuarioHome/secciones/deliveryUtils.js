// Helpers puros de la sección Delivery (entrega a domicilio).
// Sin React ni componentes: así el módulo no dispara la regla
// react-refresh/only-export-components (mismo criterio que ritaApi.js).

/* ------------------------------------------------------------------ */
/* Plan del usuario                                                    */
/* ------------------------------------------------------------------ */

/**
 * Normaliza el plan a "free" | "starter" | "premium".
 *
 * Conviven dos representaciones del plan: el registro propio escribe
 * `plan: "free"` (Auth/AuthPanel.jsx) y la Cloud Function de pagos escribe
 * `cart.nombre` / `cart.title` / `cart.style` ("Plan Starter", "basic"…).
 * Se revisan ambas.
 *
 * No se reutiliza `planDeUsuario` de Rita/ritaApi.js porque aquel nunca
 * devuelve "free" a propósito (su uso es "cuántas comidas genero"), y aquí
 * necesitamos distinguir al usuario gratuito para bloquear la sección.
 */
export const planDelivery = (perfil) => {
  if (!perfil) return "free";

  const texto = [
    perfil.plan,
    perfil.cart?.nombre,
    perfil.cart?.title,
    perfil.cart?.style,
  ]
    .filter(Boolean)
    .map(String)
    .join(" ")
    .toLowerCase();

  if (texto.includes("premium")) return "premium";
  if (texto.includes("starter") || texto.includes("basic")) return "starter";
  return "free";
};

/**
 * Mismo normalizador con un nombre que no chirría fuera de Delivery.
 *
 * Es el único del proyecto que distingue "free" de verdad: `planDeUsuario`
 * (Rita/ritaApi.js) nunca lo devuelve a propósito, y las comprobaciones sueltas
 * `perfil?.plan === "free"` que hay por ahí no ven a los usuarios que pagaron
 * por Payphone, cuyo plan solo consta en `cart.nombre`.
 */
export const planUsuario = planDelivery;

// Ubicaciones que permite cada plan (tal como se anuncian en Menu/Plano/Planos.jsx).
export const LIMITE_DIRECCIONES = { free: 0, starter: 2, premium: 3 };

/**
 * Entregas (viajes del pedido) que incluye cada plan POR DÍA del menú.
 *
 * Coincide en números con LIMITE_DIRECCIONES, pero es otro concepto y por eso
 * es otra constante: aquel limita cuántas ubicaciones se guardan, este cuántas
 * veces sale la comida hacia el usuario. Si algún día se cambia el número de
 * ubicaciones de un plan, las entregas no tienen por qué seguirlo.
 *
 * En la ÚLTIMA entrega disponible del día todo lo que quede pendiente viaja en
 * ese envío (ver Rita/ModalOrdenar.jsx).
 */
export const LIMITE_ENTREGAS = { free: 0, starter: 2, premium: 3 };

export const NOMBRE_PLAN = {
  free: "Free",
  starter: "Starter",
  premium: "Premium",
};

/* ------------------------------------------------------------------ */
/* Zona de entrega                                                     */
/* ------------------------------------------------------------------ */

// Constantes y fórmula replicadas de GeoGate/GeoGate.jsx (allí viven dentro
// de un useEffect y no se exportan). Si algún día se centralizan, GeoGate
// debería importarlas desde aquí para que las dos copias no se desincronicen.
export const CUENCA = { lat: -2.9001, lng: -79.0059 };
export const RADIO_MAX_KM = 40;

export const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const dentroDeZona = (lat, lng) =>
  haversineKm(lat, lng, CUENCA.lat, CUENCA.lng) <= RADIO_MAX_KM;

/* ------------------------------------------------------------------ */
/* Local de Rita                                                       */
/* ------------------------------------------------------------------ */

/**
 * Punto de recogida. Se ofrece cuando un pedido ya no se puede cancelar
 * (Rita/ModalCancelar.jsx), y es la misma "Recogida en nuestro local" que
 * anuncian los planes en Menu/Plano/DetallePlan.jsx.
 *
 * TODO: coordenadas y dirección reales del local. Ahora mismo apuntan al
 * centro de Cuenca, así que el botón del mapa abre el sitio equivocado.
 */
export const LOCAL = {
  nombre: "Rita",
  direccion: "Cuenca, Ecuador",
  lat: CUENCA.lat,
  lng: CUENCA.lng,
};

// El mismo número que atiende en HOME/Footer.jsx.
export const WHATSAPP_RITA = "593963200325";

// Formato universal de Google Maps: funciona en web, Android e iOS.
export const urlMapaLocal = () =>
  `https://www.google.com/maps/search/?api=1&query=${LOCAL.lat},${LOCAL.lng}`;

// Caja que circunscribe la zona de entrega, para acotar el buscador en el
// servidor. Se DERIVA de CUENCA/RADIO_MAX_KM para que jamás se desincronice
// del filtro circular de dentroDeZona(). Formato de Photon: minLon,minLat,maxLon,maxLat.
const GRADOS_LAT = RADIO_MAX_KM / 111.32;
const GRADOS_LNG =
  RADIO_MAX_KM / (111.32 * Math.cos((CUENCA.lat * Math.PI) / 180));

export const BBOX_ZONA = [
  CUENCA.lng - GRADOS_LNG,
  CUENCA.lat - GRADOS_LAT,
  CUENCA.lng + GRADOS_LNG,
  CUENCA.lat + GRADOS_LAT,
]
  .map((n) => n.toFixed(4))
  .join(",");

/* ------------------------------------------------------------------ */
/* Ubicación actual (GPS)                                              */
/* ------------------------------------------------------------------ */

/**
 * Obtiene la ubicación actual con doble fuente.
 * 1) `window.REACT_NATIVE_LOCATION`: la web corre dentro de un WebView de
 *    React Native que ya inyecta la posición (mismo puente que usa GeoGate).
 * 2) `navigator.geolocation`, con timeout explícito — lo que le falta a GeoGate.
 *
 * Rechaza siempre con `{ codigo, mensaje }` para poder mostrar un texto útil.
 */
export const obtenerUbicacionActual = () =>
  new Promise((resolve, reject) => {
    const rn = window.REACT_NATIVE_LOCATION;
    if (
      rn &&
      typeof rn.latitude === "number" &&
      typeof rn.longitude === "number"
    ) {
      resolve({ lat: rn.latitude, lng: rn.longitude, origen: "app" });
      return;
    }

    if (!navigator.geolocation) {
      reject({
        codigo: "no-soportado",
        mensaje: "Tu dispositivo no permite obtener la ubicación.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precision: pos.coords.accuracy,
          origen: "gps",
        }),
      (err) => {
        const errores = {
          1: {
            codigo: "denegado",
            mensaje:
              "Activa los permisos de ubicación para usar tu posición actual. También puedes arrastrar el mapa.",
          },
          2: {
            codigo: "no-disponible",
            mensaje:
              "No pudimos obtener tu ubicación. Arrastra el mapa para elegir el punto.",
          },
          3: {
            codigo: "timeout",
            mensaje:
              "La ubicación está tardando demasiado. Arrastra el mapa para elegir el punto.",
          },
        };
        reject(
          errores[err?.code] || {
            codigo: "desconocido",
            mensaje: "No pudimos obtener tu ubicación.",
          },
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });

/* ------------------------------------------------------------------ */
/* Geocodificación inversa (Nominatim / OpenStreetMap)                 */
/* ------------------------------------------------------------------ */

const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

// Arma una dirección corta y legible: "Av. Loja 12-34, El Batán".
export const formatearDireccion = (data) => {
  const a = data?.address || {};
  const via = a.road || a.pedestrian || a.footway || a.residential || "";
  const numero = a.house_number ? ` ${a.house_number}` : "";
  const barrio =
    a.neighbourhood || a.suburb || a.quarter || a.city_district || "";

  const partes = [via ? `${via}${numero}` : "", barrio].filter(Boolean);
  if (partes.length) return partes.join(", ");

  // Último recurso: los dos primeros tramos del display_name.
  return String(data?.display_name || "")
    .split(",")
    .slice(0, 2)
    .join(", ")
    .trim();
};

export const ciudadDe = (data) => {
  const a = data?.address || {};
  return a.city || a.town || a.village || a.county || "";
};

/**
 * Traduce unas coordenadas a una dirección aproximada.
 *
 * Importante: no se añade NINGÚN header a este fetch. El navegador prohíbe
 * fijar User-Agent y cualquier header extra convertiría la petición simple en
 * un preflight CORS que Nominatim rechaza. La identificación se hace vía
 * Referer, que el navegador envía solo.
 */
export const geocodificarInverso = async (lat, lng, signal) => {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "es",
  });

  const resp = await fetch(`${NOMINATIM_REVERSE}?${params}`, { signal });
  if (!resp.ok) throw new Error(`Nominatim ${resp.status}`);

  const data = await resp.json();
  const texto = formatearDireccion(data);
  if (!texto) throw new Error("Sin dirección");

  return { texto, ciudad: ciudadDe(data) };
};

/* ------------------------------------------------------------------ */
/* Búsqueda con autocompletado (Photon / OpenStreetMap)                */
/* ------------------------------------------------------------------ */

// El buscador NO puede usar Nominatim: su política de uso prohíbe
// explícitamente el autocompletado ("Auto-complete search ... you must not
// implement such a service on the client side using the API"). Photon es el
// geocodificador de OSM hecho justamente para type-ahead. Sin API key.
// La geocodificación inversa de arriba sí se queda en Nominatim: eso está
// permitido y va 1 petición por movimiento del mapa.
const PHOTON_SEARCH = "https://photon.komoot.io/api/";

// Calles, direcciones con número, barrios y puntos de referencia.
// Se excluyen city/county/state/country a propósito: "Cuenca" o "Azuay" como
// resultado no sirven para fijar un punto de entrega.
const CAPAS = ["street", "house", "locality", "district", "other"];

// Caché en memoria: al borrar caracteres se repiten las mismas consultas.
// Photon es una instancia pública de cortesía, conviene no golpearla de más.
const cacheBusqueda = new Map();

const tituloLugar = (p) => {
  if (p.name) return p.name;
  if (p.street) return p.housenumber ? `${p.street} ${p.housenumber}` : p.street;
  return "";
};

// Línea secundaria de contexto, sin repetir lo que ya dice el título.
const detalleLugar = (p) =>
  [p.name && p.street ? p.street : "", p.district, p.city || p.county, p.state]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3)
    .join(", ");

export const iconoLugar = (tipo) => {
  if (tipo === "street") return "🛣️";
  if (tipo === "house") return "🏠";
  if (tipo === "district" || tipo === "locality") return "🏘️";
  return "📍";
};

/**
 * Sugerencias de lugares dentro de la zona de entrega.
 * Devuelve como máximo 6 resultados ya filtrados y sin duplicados.
 */
export const buscarLugares = async (texto, signal) => {
  const clave = texto.trim().toLowerCase();
  if (cacheBusqueda.has(clave)) return cacheBusqueda.get(clave);

  const params = new URLSearchParams({
    q: clave,
    limit: "12", // se piden 12 y se recortan a 6 tras filtrar
    countrycode: "ec",
    bbox: BBOX_ZONA,
    lat: String(CUENCA.lat), // sesgo hacia el centro de Cuenca
    lon: String(CUENCA.lng),
    zoom: "12",
  });
  CAPAS.forEach((c) => params.append("layer", c)); // `layer` es repetible

  const resp = await fetch(`${PHOTON_SEARCH}?${params}`, { signal });
  if (!resp.ok) throw new Error(`Photon ${resp.status}`);

  const data = await resp.json();
  const vistos = new Set();

  const resultados = (data?.features || [])
    .map((f) => {
      // OJO: Photon devuelve [lon, lat], al revés que Leaflet.
      const [lng, lat] = f.geometry?.coordinates || [];
      const p = f.properties || {};
      return {
        id: `${p.osm_type || "x"}${p.osm_id ?? `${lat},${lng}`}`,
        lat,
        lng,
        titulo: tituloLugar(p),
        detalle: detalleLugar(p),
        tipo: p.type,
      };
    })
    .filter((r) => {
      if (typeof r.lat !== "number" || typeof r.lng !== "number") return false;
      if (!r.titulo) return false;
      // El bbox es un cuadrado que circunscribe el círculo: sus esquinas caen
      // fuera de los 40 km. Este es el filtro que realmente manda.
      if (!dentroDeZona(r.lat, r.lng)) return false;
      const k = `${r.titulo}|${r.detalle}`;
      if (vistos.has(k)) return false; // Photon repite calles largas por tramos
      vistos.add(k);
      return true;
    })
    .slice(0, 6);

  if (cacheBusqueda.size > 30) {
    cacheBusqueda.delete(cacheBusqueda.keys().next().value);
  }
  cacheBusqueda.set(clave, resultados);

  return resultados;
};

/* ------------------------------------------------------------------ */
/* Varios                                                              */
/* ------------------------------------------------------------------ */

// crypto.randomUUID exige un contexto seguro y el WebView no siempre lo es,
// por eso el fallback no es opcional.
export const nuevoId = () => {
  try {
    if (typeof crypto?.randomUUID === "function") {
      return `dir_${crypto.randomUUID()}`;
    }
  } catch {
    /* contexto no seguro */
  }
  return `dir_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const formatearCoords = (lat, lng) =>
  `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;

// Emoji de la tarjeta según la etiqueta que eligió el usuario.
export const iconoEtiqueta = (etiqueta = "") => {
  const e = etiqueta.toLowerCase();
  if (e.includes("casa") || e.includes("hogar")) return "🏠";
  if (e.includes("trabajo") || e.includes("oficina")) return "💼";
  return "📍";
};

export const ETIQUETAS_RAPIDAS = [
  { valor: "Casa", icono: "🏠" },
  { valor: "Trabajo", icono: "💼" },
];

/* ------------------------------------------------------------------ */
/* Horario de atención                                                 */
/* ------------------------------------------------------------------ */

// Rita solo entrega dentro de esta franja. Fuera de ella el pedido se agenda
// para el día siguiente (ver Rita/ModalOrdenar.jsx).
export const HORA_APERTURA = 8;
export const HORA_CIERRE = 18;

const dosDigitos = (n) => String(n).padStart(2, "0");

// Los mismos límites en el formato que exige <input type="time">.
export const APERTURA_HHMM = `${dosDigitos(HORA_APERTURA)}:00`;
export const CIERRE_HHMM = `${dosDigitos(HORA_CIERRE)}:00`;

// Único sitio del que salen todos los textos de horario de la interfaz.
export const HORARIO_TEXTO = `${HORA_APERTURA}:00 a ${HORA_CIERRE}:00`;

// Minutos desde medianoche de un "HH:MM": permite comparar horas sin construir
// Dates. Devuelve NaN si el texto no es una hora válida.
export const minutosDe = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
};

export const minutosDeFecha = (fecha) =>
  fecha.getHours() * 60 + fecha.getMinutes();

// El cierre es exclusivo: a las 18:00 en punto ya está cerrado.
export const estaAbierto = (fecha = new Date()) => {
  const min = minutosDeFecha(fecha);
  return min >= HORA_APERTURA * 60 && min < HORA_CIERRE * 60;
};

/* ------------------------------------------------------------------ */
/* Estado de las entregas                                              */
/* ------------------------------------------------------------------ */

/**
 * Recorrido de un pedido de la colección `entregas`. El ORDEN DEL ARRAY ES EL
 * ORDEN DEL SEGUIMIENTO que ve el usuario, así que no se reordena a la ligera.
 *
 * `cancelado` queda fuera a propósito: no es un paso del camino, es una salida.
 */
export const ESTADOS_ENTREGA = [
  "pendiente",
  "preparando",
  "en_camino",
  "entregado",
];

export const INFO_ESTADO = {
  pendiente: {
    icono: "⏳",
    label: "Recibido",
    desc: "Recibimos tu pedido",
  },
  preparando: {
    icono: "👩‍🍳",
    label: "Preparando",
    desc: "Rita lo está cocinando",
  },
  en_camino: {
    icono: "🛵",
    label: "En camino",
    desc: "Tu pedido va en camino",
  },
  entregado: {
    icono: "✅",
    label: "Entregado",
    desc: "Pedido entregado",
  },
  cancelado: {
    icono: "❌",
    label: "Cancelado",
    desc: "Este pedido fue cancelado",
  },
};

// Un estado desconocido cuenta como "pendiente" (0) en vez de -1: si alguien
// escribe otra cosa en el campo, el seguimiento degrada en lugar de romperse.
export const indiceEstado = (estado) => {
  const i = ESTADOS_ENTREGA.indexOf(estado);
  return i === -1 ? 0 : i;
};

export const infoEstado = (estado) =>
  INFO_ESTADO[estado] || INFO_ESTADO.pendiente;

// Un pedido "cerrado": ya no se mueve, va al historial.
export const esEstadoFinal = (estado) =>
  estado === "entregado" || estado === "cancelado";

/* ------------------------------------------------------------------ */
/* Fechas de entrega                                                   */
/* ------------------------------------------------------------------ */

/**
 * Normaliza a Date lo que venga en `entrega.programadaPara`: Firestore lo
 * devuelve como Timestamp, pero mientras una escritura está pendiente puede
 * llegar ya como Date. Devuelve null si no hay nada usable.
 */
export const fechaDeValor = (valor) => {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor.toDate();
  if (valor instanceof Date) return valor;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
};

const mismoDia = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/* ------------------------------------------------------------------ */
/* Cancelación                                                         */
/* ------------------------------------------------------------------ */

// Margen mínimo para cancelar: con menos de una hora por delante la comida ya
// está en preparación y lo único que queda es retirarla en el local.
export const MINUTOS_CANCELACION = 60;

/**
 * ¿Queda tiempo para cancelar una entrega programada para `fechaEntrega`?
 *
 * Los pedidos "Ahora" nunca pasan: su hora de entrega es el momento en que se
 * hicieron, así que el margen ya está consumido de entrada.
 */
export const puedeCancelar = (fechaEntrega, ahora = new Date()) => {
  if (!fechaEntrega) return false;
  const margen = fechaEntrega.getTime() - ahora.getTime();
  return margen >= MINUTOS_CANCELACION * 60000;
};

// "Hoy a las 14:30" · "Mañana a las 09:00" · "02 ago a las 09:00"
export const textoFechaEntrega = (date) => {
  if (!date) return "Fecha por confirmar";

  const hora = `${dosDigitos(date.getHours())}:${dosDigitos(date.getMinutes())}`;
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  if (mismoDia(date, hoy)) return `Hoy a las ${hora}`;
  if (mismoDia(date, manana)) return `Mañana a las ${hora}`;

  const dia = date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
  });
  return `${dia} a las ${hora}`;
};
