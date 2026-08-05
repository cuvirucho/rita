import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CUENCA,
  ETIQUETAS_RAPIDAS,
  RADIO_MAX_KM,
  buscarLugares,
  dentroDeZona,
  formatearCoords,
  geocodificarInverso,
  iconoLugar,
  obtenerUbicacionActual,
} from "./deliveryUtils";

// Pantalla de selección de ubicación: el mapa se arrastra debajo de un pin
// fijo en el centro (UX de Uber Eats / Rappi). Se carga con React.lazy desde
// Delivery.jsx para que Leaflet quede en su propio chunk.
const DeliveryMapa = ({
  inicial,
  guardando,
  errorGuardado,
  onCancelar,
  onConfirmar,
}) => {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);

  // Punto de partida congelado: el efecto de creación del mapa corre una vez.
  const inicialRef = useRef(
    inicial?.lat && inicial?.lng
      ? { lat: inicial.lat, lng: inicial.lng }
      : { ...CUENCA },
  );
  const centroRef = useRef(inicialRef.current);
  const ultimaPeticionRef = useRef(0);
  const erroresTileRef = useRef(0);

  const [centro, setCentro] = useState(inicialRef.current);
  const [arrastrando, setArrastrando] = useState(false);
  const [geoEstado, setGeoEstado] = useState("cargando"); // cargando | ok | error
  const [direccionTexto, setDireccionTexto] = useState(inicial?.direccion || "");
  const [direccionManual, setDireccionManual] = useState(
    inicial?.direccion || "",
  );
  const [ciudad, setCiudad] = useState(inicial?.ciudad || "");
  const [etiqueta, setEtiqueta] = useState(inicial?.etiqueta || "Casa");
  const [etiquetaLibre, setEtiquetaLibre] = useState(
    inicial?.etiqueta &&
      !ETIQUETAS_RAPIDAS.some((e) => e.valor === inicial.etiqueta)
      ? inicial.etiqueta
      : "",
  );
  const [referencia, setReferencia] = useState(inicial?.referencia || "");
  const [errorGps, setErrorGps] = useState("");
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [tilesFallan, setTilesFallan] = useState(false);

  // Buscador con autocompletado
  const buscadorRef = useRef(null);
  const seleccionadoRef = useRef(false); // evita re-buscar tras elegir una opción
  const [consulta, setConsulta] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(-1);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  const enZona = dentroDeZona(centro.lat, centro.lng);

  /* --------------------------------------------------------------- */
  /* Ciclo de vida del mapa                                           */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    // Siempre crear aquí y siempre destruir en el cleanup: saltarse la
    // creación con un `if (ref.current) return` es justo lo que provoca el
    // "Map container is already initialized" en el doble montaje de StrictMode.
    const mapa = L.map(contenedor, {
      center: [inicialRef.current.lat, inicialRef.current.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.5,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 11,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
      .on("tileerror", () => {
        erroresTileRef.current += 1;
        if (erroresTileRef.current > 8) setTilesFallan(true);
      })
      .addTo(mapa);

    L.control.zoom({ position: "bottomright" }).addTo(mapa);

    const alEmpezar = () => setArrastrando(true);
    const alTerminar = () => {
      setArrastrando(false);
      const c = mapa.getCenter();
      const prev = centroRef.current;
      // Un clic sin desplazamiento también dispara moveend: no re-geocodificar.
      if (
        prev &&
        Math.abs(prev.lat - c.lat) < 1e-6 &&
        Math.abs(prev.lng - c.lng) < 1e-6
      ) {
        return;
      }
      const nuevo = { lat: c.lat, lng: c.lng };
      centroRef.current = nuevo;
      setCentro(nuevo);
    };

    mapa.on("movestart", alEmpezar);
    mapa.on("zoomstart", alEmpezar);
    mapa.on("moveend", alTerminar);

    mapaRef.current = mapa;

    // El contenedor puede medir 0px mientras corre la animación fadeInUp de
    // .usuario-seccion-wrap; también cubre los cambios de orientación.
    const ro = new ResizeObserver(() => mapa.invalidateSize());
    ro.observe(contenedor);

    return () => {
      ro.disconnect();
      mapa.off();
      mapa.remove(); // libera _leaflet_id → el remontaje de StrictMode es seguro
      mapaRef.current = null;
    };
  }, []);

  /* --------------------------------------------------------------- */
  /* GPS automático solo desde el puente de la app nativa             */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    // Si ya veníamos editando una dirección, respetamos su punto.
    if (inicial?.lat && inicial?.lng) return;

    const rn = window.REACT_NATIVE_LOCATION;
    if (
      !rn ||
      typeof rn.latitude !== "number" ||
      typeof rn.longitude !== "number"
    ) {
      // En navegador NO se pide permiso automáticamente: sería un segundo
      // prompt tras el de GeoGate. El usuario lo pide con el botón 🎯.
      return;
    }
    mapaRef.current?.setView([rn.latitude, rn.longitude], 17);
    // El setView dispara moveend, que actualiza el centro y geocodifica.
  }, [inicial]);

  /* --------------------------------------------------------------- */
  /* Geocodificación inversa (debounce + abort + techo de 1 req/s)    */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    if (!centro) return;

    const ctrl = new AbortController();
    setGeoEstado("cargando");

    const espera = Math.max(
      700,
      1100 - (Date.now() - ultimaPeticionRef.current),
    );

    const t = setTimeout(async () => {
      ultimaPeticionRef.current = Date.now();
      try {
        const r = await geocodificarInverso(centro.lat, centro.lng, ctrl.signal);
        setDireccionTexto(r.texto);
        setCiudad(r.ciudad);
        setGeoEstado("ok");
      } catch (err) {
        if (err?.name === "AbortError") return; // reemplazada por otra más nueva
        setGeoEstado("error");
      }
    }, espera);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [centro]);

  /* --------------------------------------------------------------- */
  /* Buscador: autocompletado (debounce + abort)                      */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    // Al elegir una sugerencia se escribe su título en el input, lo que
    // dispararía otra búsqueda inmediata. Este flag salta esa ejecución.
    if (seleccionadoRef.current) {
      seleccionadoRef.current = false;
      return;
    }

    const q = consulta.trim();
    if (q.length < 3) {
      setSugerencias([]);
      setBuscando(false);
      setErrorBusqueda("");
      return;
    }

    const ctrl = new AbortController();
    setBuscando(true);

    const t = setTimeout(async () => {
      try {
        const r = await buscarLugares(q, ctrl.signal);
        setSugerencias(r);
        setResaltado(-1);
        setAbierto(true);
        setErrorBusqueda(r.length ? "" : "Sin resultados dentro de Cuenca.");
        setBuscando(false);
      } catch (err) {
        // No se usa `finally`: en un abort hay una búsqueda más nueva en curso
        // y apagar el spinner ahí haría parpadear el indicador.
        if (err?.name === "AbortError") return;
        setSugerencias([]);
        setAbierto(true);
        setErrorBusqueda(
          "No pudimos buscar ahora. Arrastra el mapa para elegir el punto.",
        );
        setBuscando(false);
      }
    }, 320);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [consulta]);

  // Cierre al tocar fuera. `pointerdown` y no `blur`: blur + setTimeout es
  // frágil en WebView móvil y se come el primer toque sobre una sugerencia.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => {
      if (!buscadorRef.current?.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  const elegirSugerencia = (s) => {
    if (!s) return;
    seleccionadoRef.current = true;
    setConsulta(s.titulo);
    setSugerencias([]);
    setAbierto(false);
    setResaltado(-1);
    setErrorBusqueda("");

    // Feedback inmediato en el sheet, sin esperar a la red.
    setDireccionTexto(s.titulo);
    setGeoEstado("ok");

    // flyTo dispara moveend → la geocodificación inversa refina la dirección
    // con lo que realmente hay bajo el pin. La cadena ya existe.
    mapaRef.current?.flyTo([s.lat, s.lng], 17, { duration: 0.8 });
  };

  const alTeclear = (e) => {
    if (!abierto || !sugerencias.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResaltado((i) => (i + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((i) => (i <= 0 ? sugerencias.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      elegirSugerencia(sugerencias[resaltado >= 0 ? resaltado : 0]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  };

  const limpiarBusqueda = () => {
    setConsulta("");
    setSugerencias([]);
    setAbierto(false);
    setErrorBusqueda("");
  };

  /* --------------------------------------------------------------- */
  /* Acciones                                                         */
  /* --------------------------------------------------------------- */
  const usarMiUbicacion = async () => {
    setErrorGps("");
    setBuscandoGps(true);
    try {
      const pos = await obtenerUbicacionActual();
      mapaRef.current?.flyTo([pos.lat, pos.lng], 17, { duration: 0.8 });
    } catch (err) {
      setErrorGps(err?.mensaje || "No pudimos obtener tu ubicación.");
    } finally {
      setBuscandoGps(false);
    }
  };

  const etiquetaFinal = (etiquetaLibre.trim() || etiqueta).slice(0, 24);
  const direccionFinal =
    geoEstado === "error" ? direccionManual.trim() : direccionTexto.trim();

  const puedeConfirmar =
    enZona &&
    !guardando &&
    geoEstado !== "cargando" &&
    direccionFinal.length >= 8 &&
    etiquetaFinal.length > 0;

  const confirmar = () => {
    if (!puedeConfirmar) return;
    onConfirmar({
      lat: centro.lat,
      lng: centro.lng,
      direccion: direccionFinal,
      referencia: referencia.trim(),
      etiqueta: etiquetaFinal,
      ciudad: ciudad || "Cuenca",
    });
  };

  const textoBoton = guardando
    ? "Guardando…"
    : !enZona
      ? "Ubicación fuera de zona"
      : "Confirmar ubicación";

  return (
    <div className="delivery-mapa-screen">
      <div className="delivery-mapa-top">
        <button
          type="button"
          className="delivery-volver"
          onClick={onCancelar}
          aria-label="Volver a mis ubicaciones"
        >
          ←
        </button>
        <h2 className="delivery-mapa-titulo">Elige tu ubicación</h2>
      </div>

      {/* Fuera de .delivery-mapa a propósito: ese contenedor tiene
          overflow:hidden y recortaría el desplegable de sugerencias. */}
      <div className="delivery-buscador" ref={buscadorRef}>
        <div className="delivery-buscador-campo">
          <span className="delivery-buscador-lupa" aria-hidden="true">
            🔍
          </span>
          <input
            className="delivery-buscador-input"
            type="text"
            role="combobox"
            aria-expanded={abierto && sugerencias.length > 0}
            aria-controls="delivery-sugerencias"
            aria-autocomplete="list"
            aria-activedescendant={
              resaltado >= 0 ? `delivery-sug-${resaltado}` : undefined
            }
            aria-label="Buscar calle o lugar en Cuenca"
            placeholder="Busca tu calle o un lugar cercano"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onFocus={() => sugerencias.length && setAbierto(true)}
            onKeyDown={alTeclear}
          />
          {buscando && <span className="delivery-spinner" />}
          {!buscando && consulta && (
            <button
              type="button"
              className="delivery-buscador-limpiar"
              onClick={limpiarBusqueda}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {abierto && (sugerencias.length > 0 || errorBusqueda) && (
          <ul
            className="delivery-sugerencias"
            id="delivery-sugerencias"
            role="listbox"
          >
            {sugerencias.map((s, i) => (
              <li
                key={s.id}
                id={`delivery-sug-${i}`}
                role="option"
                aria-selected={i === resaltado}
              >
                <button
                  type="button"
                  className={`delivery-sugerencia ${
                    i === resaltado ? "is-active" : ""
                  }`}
                  // No perder el foco del input antes de que corra el onClick.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegirSugerencia(s)}
                  onMouseEnter={() => setResaltado(i)}
                >
                  <span className="delivery-sugerencia-icono">
                    {iconoLugar(s.tipo)}
                  </span>
                  <span className="delivery-sugerencia-texto">
                    <span className="delivery-sugerencia-titulo">
                      {s.titulo}
                    </span>
                    {s.detalle && (
                      <span className="delivery-sugerencia-detalle">
                        {s.detalle}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
            {!sugerencias.length && errorBusqueda && (
              <li className="delivery-buscador-vacio">{errorBusqueda}</li>
            )}
          </ul>
        )}
      </div>

      {tilesFallan && (
        <p className="delivery-tiles-error">
          El mapa no se está cargando bien, revisa tu conexión.
        </p>
      )}

      <div className={`delivery-mapa ${arrastrando ? "is-dragging" : ""}`}>
        <div ref={contenedorRef} className="delivery-mapa-canvas" />

        {/* Pin fijo al centro: no es un L.Marker, así el arrastre es fluido
            y evitamos el clásico 404 del icono por defecto de Leaflet. */}
        <div className="delivery-pin" aria-hidden="true">
          <span className="delivery-pin-icon">📍</span>
          <span className="delivery-pin-sombra" />
        </div>

        <button
          type="button"
          className="delivery-fab-gps"
          onClick={usarMiUbicacion}
          disabled={buscandoGps}
        >
          {buscandoGps ? (
            <>
              <span className="delivery-spinner" />
              Buscando…
            </>
          ) : (
            <>🎯 Mi ubicación</>
          )}
        </button>
      </div>

      <div className="delivery-sheet">
        <span className="delivery-sheet-handle" aria-hidden="true" />

        {geoEstado === "cargando" ? (
          <>
            <span className="delivery-skel delivery-skel--dir" />
            <span className="delivery-skel delivery-skel--ciudad" />
          </>
        ) : geoEstado === "error" ? (
          <>
            <p className="delivery-sheet-coords">
              📍 {formatearCoords(centro.lat, centro.lng)}
            </p>
            <label className="delivery-label" htmlFor="delivery-dir-manual">
              Dirección
            </label>
            <input
              id="delivery-dir-manual"
              className="delivery-input"
              type="text"
              maxLength={160}
              value={direccionManual}
              onChange={(e) => setDireccionManual(e.target.value)}
              placeholder="Ej. Av. Loja 12-34 y Remigio Crespo"
            />
          </>
        ) : (
          <>
            <p className="delivery-sheet-dir">📍 {direccionTexto}</p>
            {ciudad && <p className="delivery-sheet-ciudad">{ciudad}</p>}
          </>
        )}

        {!enZona && (
          <p className="delivery-alerta delivery-alerta--zona">
            ⚠️ Esta ubicación está fuera de nuestra zona de entrega. Por ahora
            entregamos solo en Cuenca y hasta {RADIO_MAX_KM} km a la redonda.
          </p>
        )}

        {errorGps && <p className="delivery-alerta">📡 {errorGps}</p>}

        {errorGuardado && (
          <p className="delivery-alerta delivery-alerta--error">
            😕 {errorGuardado}
          </p>
        )}

        <span className="delivery-label">Etiqueta</span>
        <div className="delivery-chips">
          {ETIQUETAS_RAPIDAS.map((e) => (
            <button
              key={e.valor}
              type="button"
              className={`delivery-chip ${
                !etiquetaLibre && etiqueta === e.valor ? "is-active" : ""
              }`}
              onClick={() => {
                setEtiqueta(e.valor);
                setEtiquetaLibre("");
              }}
            >
              {e.icono} {e.valor}
            </button>
          ))}
          <button
            type="button"
            className={`delivery-chip ${etiquetaLibre ? "is-active" : ""}`}
            onClick={() => {
              setEtiqueta("");
              setEtiquetaLibre(etiquetaLibre || "Otro");
            }}
          >
            📍 Otro
          </button>
        </div>

        {etiquetaLibre !== "" && (
          <input
            className="delivery-input"
            type="text"
            maxLength={24}
            value={etiquetaLibre}
            onChange={(e) => setEtiquetaLibre(e.target.value)}
            placeholder="Ej. Casa de mamá"
            aria-label="Nombre de la ubicación"
          />
        )}

        <label className="delivery-label" htmlFor="delivery-referencia">
          Referencia (opcional)
        </label>
        <input
          id="delivery-referencia"
          className="delivery-input"
          type="text"
          maxLength={160}
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          placeholder="Portón azul, timbre 2"
        />

        <button
          type="button"
          className="delivery-confirmar"
          onClick={confirmar}
          disabled={!puedeConfirmar}
        >
          {guardando && <span className="delivery-spinner" />}
          {textoBoton}
        </button>
      </div>
    </div>
  );
};

export default DeliveryMapa;
