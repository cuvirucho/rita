import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tira horizontal con los promedios diarios del resumen semanal.
 *
 * Mismo modelo que el carrusel de beneficios de la portada (Home.jsx): scroll
 * nativo + CSS scroll-snap en vez de mover un `translateX` por JS, así el
 * deslizamiento táctil y su inercia salen gratis. El arrastre con ratón se hace
 * manipulando `scrollLeft`.
 *
 * Diferencias a propósito con el de la portada:
 * - Eventos de puntero en vez de solo ratón, ignorando lo que no sea "mouse":
 *   en táctil manda el scroll nativo y así no se pelean los dos.
 * - Las flechas se deshabilitan en los extremos en lugar de dar la vuelta: en
 *   una tira con varias tarjetas visibles el salto del final al principio
 *   despista.
 * - Los controles no se pintan si no hay nada que desplazar (pocas métricas o
 *   pantalla ancha).
 */
const CarruselMetricas = ({ metricas }) => {
  const pistaRef = useRef(null);
  const arrastrando = useRef(false);
  const inicioX = useRef(0);
  const inicioScroll = useRef(0);
  const [activo, setActivo] = useState(0);
  // Ambos a true de salida: sin desbordamiento los dos extremos son ciertos a
  // la vez, así que los controles no parpadean antes de la primera medida.
  const [limites, setLimites] = useState({ inicio: true, final: true });

  // Índice de la tarjeta más centrada + posición respecto a los extremos.
  const medir = useCallback(() => {
    const el = pistaRef.current;
    if (!el) return;

    const centro = el.scrollLeft + el.clientWidth / 2;
    let mejor = 0;
    let menorDist = Infinity;
    Array.from(el.children).forEach((tarjeta, i) => {
      const centroTarjeta = tarjeta.offsetLeft + tarjeta.offsetWidth / 2;
      const dist = Math.abs(centroTarjeta - centro);
      if (dist < menorDist) {
        menorDist = dist;
        mejor = i;
      }
    });
    setActivo(mejor);

    // El margen de 1px absorbe los redondeos a fracción de píxel del zoom.
    const inicio = el.scrollLeft <= 1;
    const final = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    // `onScroll` dispara decenas de veces por segundo al arrastrar: devolver el
    // estado anterior cuando no ha cambiado evita un render por fotograma.
    setLimites((prev) =>
      prev.inicio === inicio && prev.final === final
        ? prev
        : { inicio, final },
    );
  }, []);

  // Al redimensionar cambia cuántas tarjetas caben, y con ello si hay
  // desbordamiento; la primera llamada fija además el estado inicial.
  useEffect(() => {
    const el = pistaRef.current;
    if (!el) return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [medir, metricas.length]);

  const alBajarPuntero = (e) => {
    if (e.pointerType !== "mouse") return; // táctil: scroll nativo
    const el = pistaRef.current;
    if (!el) return;
    arrastrando.current = true;
    inicioX.current = e.clientX;
    inicioScroll.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    el.classList.add("is-dragging");
  };

  const alMoverPuntero = (e) => {
    if (!arrastrando.current) return;
    const el = pistaRef.current;
    if (!el) return;
    el.scrollLeft = inicioScroll.current - (e.clientX - inicioX.current);
  };

  const alSoltarPuntero = (e) => {
    if (!arrastrando.current) return;
    arrastrando.current = false;
    const el = pistaRef.current;
    if (!el) return;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.classList.remove("is-dragging");
  };

  // Centra la tarjeta i, acotando el índice a los extremos.
  const irA = (i) => {
    const el = pistaRef.current;
    if (!el) return;
    const indice = Math.max(0, Math.min(i, metricas.length - 1));
    const tarjeta = el.children[indice];
    if (!tarjeta) return;
    el.scrollTo({
      left: tarjeta.offsetLeft - (el.clientWidth - tarjeta.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  // Sin desbordamiento se está en los dos extremos a la vez: nada que controlar.
  const hayDesplazamiento = !(limites.inicio && limites.final);

  return (
    <div className="resumen-carrusel">
      {hayDesplazamiento && (
        <button
          type="button"
          className="resumen-flecha prev"
          onClick={() => irA(activo - 1)}
          disabled={limites.inicio}
          aria-label="Métrica anterior"
        >
          ‹
        </button>
      )}

      <div
        className="resumen-pista"
        ref={pistaRef}
        tabIndex={0}
        role="group"
        aria-label="Promedios diarios"
        onScroll={medir}
        onPointerDown={alBajarPuntero}
        onPointerMove={alMoverPuntero}
        onPointerUp={alSoltarPuntero}
        onPointerCancel={alSoltarPuntero}
      >
        {metricas.map((m) => (
          <div className="resumen-item" key={m.label}>
            <span className="emoji">{m.emoji}</span>
            <small>{m.label}</small>
            <h2>{m.valor}</h2>
            <span>{m.unidad}</span>
          </div>
        ))}
      </div>

      {hayDesplazamiento && (
        <button
          type="button"
          className="resumen-flecha next"
          onClick={() => irA(activo + 1)}
          disabled={limites.final}
          aria-label="Métrica siguiente"
        >
          ›
        </button>
      )}

      {hayDesplazamiento && (
        <div className="resumen-puntos">
          {metricas.map((m, i) => (
            <button
              key={m.label}
              type="button"
              className={`resumen-punto ${activo === i ? "active" : ""}`}
              onClick={() => irA(i)}
              aria-label={`Ir a ${m.label}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarruselMetricas;
