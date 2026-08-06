import { useEffect, useRef, useState } from "react";
import { formatearMedida, formatearNumero } from "./nutricionCore";
import {
  estadoCumplimiento,
  porcentaje,
  TEXTO_ESTADO,
} from "./objetivosNutricion";

// No hay librería de gráficos en el proyecto (ni la va a haber por unos
// anillos y unas barras): todo es SVG a mano y CSS. La curva de aceleración es
// la misma que la de .md-macro-fill para que anillos y barras animen como un
// solo sistema.
const TRANSICION = "cubic-bezier(.4, 0, .2, 1)";

/**
 * Anima de 0 al valor final en el primer pintado.
 *
 * Sin esto el anillo aparece ya relleno y no se ve el progreso. El
 * requestAnimationFrame es necesario: cambiar el estado en el mismo frame que
 * el montaje haría que el navegador colapse los dos valores y no haya
 * transición que animar.
 */
const useValorAnimado = (destino) => {
  const [valor, setValor] = useState(0);
  const montado = useRef(false);

  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      const id = requestAnimationFrame(() => setValor(destino));
      return () => cancelAnimationFrame(id);
    }
    setValor(destino);
  }, [destino]);

  return valor;
};

/* ------------------------------------------------------------------ */
/* Anillo de progreso                                                  */
/* ------------------------------------------------------------------ */

/**
 * Anillo de una métrica frente a su objetivo.
 *
 * El arco se dibuja con stroke-dasharray/offset sobre un círculo girado -90°
 * para que empiece arriba. El relleno se limita al 100 % aunque el porcentaje
 * lo supere: un anillo que da más de una vuelta no se distingue de uno lleno.
 *
 * Sin objetivo (el menú no trae ese promedio) se enseña el total y el anillo se
 * queda en gris: no hay contra qué medirlo y no se inventa una meta.
 */
export const AnilloProgreso = ({
  etiqueta,
  icono,
  valor,
  unidad,
  objetivo,
  tamano = 132,
  grosor = 11,
  neutro = false,
}) => {
  const pct = porcentaje(valor, objetivo);
  // Con el día recién empezado y nada marcado, un 0 % es literalmente un
  // déficit, pero pintar los anillos en rojo a las ocho de la mañana se lee
  // como un reproche. Mientras no haya ninguna comida marcada van en gris:
  // todavía no hay nada que juzgar.
  const estado = neutro ? "sindatos" : estadoCumplimiento(pct);

  const r = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * r;
  const relleno = Math.min(Math.max(pct ?? 0, 0), 100) / 100;
  const animado = useValorAnimado(relleno);

  const texto =
    objetivo > 0
      ? `${etiqueta}: ${formatearNumero(valor)} de ${formatearNumero(objetivo)} ${unidad}, ${Math.round(pct ?? 0)} %. ${TEXTO_ESTADO[estado]}`
      : `${etiqueta}: ${formatearNumero(valor)} ${unidad}`;

  return (
    <div className={`nutri-anillo is-${estado}`}>
      {/* El SVG y el texto del centro van en su propia caja relativa: así el
          centrado no depende del padding de la tarjeta ni del tamaño elegido. */}
      <span className="nutri-anillo-caja">
        <svg
          className="nutri-anillo-svg"
          viewBox={`0 0 ${tamano} ${tamano}`}
          width={tamano}
          height={tamano}
          role="img"
          aria-label={texto}
        >
          <title>{texto}</title>
          <circle
            className="nutri-anillo-fondo"
            cx={tamano / 2}
            cy={tamano / 2}
            r={r}
            fill="none"
            strokeWidth={grosor}
          />
          <circle
            className="nutri-anillo-arco"
            cx={tamano / 2}
            cy={tamano / 2}
            r={r}
            fill="none"
            strokeWidth={grosor}
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - animado)}
            transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
            style={{ transition: `stroke-dashoffset .9s ${TRANSICION}` }}
          />
        </svg>

        <span className="nutri-anillo-centro" aria-hidden="true">
          <span className="nutri-anillo-icono">{icono}</span>
          <span className="nutri-anillo-valor">{formatearNumero(valor)}</span>
          <span className="nutri-anillo-meta">
            {objetivo > 0 ? `de ${formatearNumero(objetivo)} ${unidad}` : unidad}
          </span>
        </span>
      </span>

      <span className="nutri-anillo-label">
        {etiqueta}
        {pct != null && (
          <span className="nutri-anillo-pct">{Math.round(pct)} %</span>
        )}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Barra                                                               */
/* ------------------------------------------------------------------ */

/**
 * Una fila del desglose: nombre, valor y barra de progreso.
 *
 * Recibe la etiqueta y la unidad tal cual vienen del menú, sin catálogo fijo:
 * las claves de vitaminas y minerales las inventa la IA en cada generación y
 * un catálogo cerrado se comía las que no conociera ("Manganeso").
 *
 * Sin objetivo se muestra solo el valor, sin barra ni porcentaje. Es el caso
 * de los minerales: el menú los da en mg y no declara ninguna meta, así que
 * ponerles un porcentaje exigiría una tabla de referencia inventada.
 */
export const BarraNutriente = ({
  etiqueta,
  icono,
  medida,
  objetivo,
  compacta = false,
}) => {
  const valor = medida?.valor ?? null;
  const pct = porcentaje(valor, objetivo);
  const estado = estadoCumplimiento(pct);
  const relleno = Math.min(Math.max(pct ?? 0, 0), 100);
  const animado = useValorAnimado(relleno);
  const conBarra = pct != null;

  return (
    <div
      className={`nutri-barra-row is-${estado} ${
        compacta ? "nutri-barra-row--compacta" : ""
      } ${conBarra ? "" : "nutri-barra-row--sinmeta"}`}
    >
      {icono && (
        <span className="nutri-barra-icono" aria-hidden="true">
          {icono}
        </span>
      )}

      <span className="nutri-barra-nombre">{etiqueta}</span>

      <span className="nutri-barra-cifra">
        <strong>{formatearMedida(medida)}</strong>
        {objetivo > 0 && (
          <span className="nutri-barra-meta">
            {" "}
            / {formatearNumero(objetivo)} {medida?.unidad}
          </span>
        )}
      </span>

      {conBarra ? (
        <>
          <span
            className="nutri-barra"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${etiqueta}: ${Math.round(pct)} % del objetivo`}
          >
            <span
              className="nutri-barra-fill"
              style={{
                width: `${animado}%`,
                transition: `width .9s ${TRANSICION}`,
              }}
            />
          </span>
          <span className="nutri-barra-pct">{Math.round(pct)} %</span>
        </>
      ) : (
        // Sin meta no se pinta barra: una barra vacía se leería como "0 %".
        <span className="nutri-barra-nometa">acumulado</span>
      )}
    </div>
  );
};
