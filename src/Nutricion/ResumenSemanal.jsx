import { useState } from "react";
import { BarraNutriente } from "./NutriGraficos";
import { dividirLectura } from "./nutricionCore";

/**
 * Estadísticas de la semana y resumen nutricional acumulado.
 *
 * Las barras comparan la MEDIA de los días con comidas marcadas contra el
 * objetivo diario, no el total de la semana contra el objetivo de un día: si
 * no, alguien que cumple tres días aparecería con un 300 % de todo.
 */
const ResumenSemanal = ({ progreso, semana, objetivos, onReiniciar }) => {
  const [confirmando, setConfirmando] = useState(false);

  // Se divide entre los días con alguna comida marcada, no entre los días
  // completos: si no, un día a medias inflaría la media de los demás.
  const diasConAlgo = progreso.dias.filter((d) => d.hechas > 0).length;
  const media = dividirLectura(semana, Math.max(diasConAlgo, 1));

  const tarjetas = [
    {
      id: "completado",
      icono: "📈",
      valor: `${Math.round(progreso.porcentaje)}%`,
      label: "Plan completado",
      modificador: "completado",
    },
    {
      id: "hechas",
      icono: "✅",
      valor: progreso.comidasHechas,
      label: "Comidas realizadas",
      modificador: "hechas",
    },
    {
      id: "pendientes",
      icono: "🍽️",
      valor: progreso.comidasPendientes,
      label: "Comidas pendientes",
      modificador: "pendientes",
    },
    {
      id: "racha",
      icono: "🔥",
      valor: progreso.racha,
      // "días del plan" y no "días seguidos" a secas: el menú no guarda fechas,
      // así que una racha de calendario sería inventada.
      label:
        progreso.racha === 1 ? "Día del plan seguido" : "Días del plan seguidos",
      modificador: "racha",
    },
  ];

  const vitaminas = Object.entries(media?.vitaminas ?? {});
  const minerales = Object.entries(media?.minerales ?? {});

  return (
    <section className="nutri-bloque">
      <div className="nutri-bloque-head">
        <h3 className="nutri-bloque-titulo">🏆 Tu semana</h3>
        <p className="nutri-bloque-sub">
          {progreso.diasCompletos} de {progreso.totalDias} días completos ·{" "}
          {progreso.comidasHechas} de {progreso.totalComidas} comidas.
        </p>
      </div>

      <div className="nutri-stats">
        {tarjetas.map((t) => (
          <article
            key={t.id}
            className={`nutri-stat nutri-stat--${t.modificador}`}
          >
            <span className="nutri-stat-icono" aria-hidden="true">
              {t.icono}
            </span>
            <span className="nutri-stat-valor">{t.valor}</span>
            <span className="nutri-stat-label">{t.label}</span>
          </article>
        ))}
      </div>

      <span
        className="nutri-semana-barra"
        role="progressbar"
        aria-valuenow={Math.round(progreso.porcentaje)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso del plan semanal"
      >
        <span
          className="nutri-semana-barra-fill"
          style={{ width: `${progreso.porcentaje}%` }}
        />
      </span>

      {progreso.comidasHechas > 0 ? (
        <>
          <h4 className="nutri-micros-titulo nutri-micros-titulo--semana">
            🥗 Media diaria de lo que llevas consumido
          </h4>
          <div className="nutri-barras">
            <BarraNutriente
              etiqueta="Calorías"
              icono="🔥"
              medida={
                media.calorias == null
                  ? null
                  : { valor: media.calorias, unidad: "kcal" }
              }
              objetivo={objetivos.calorias?.valor}
            />
            <BarraNutriente
              etiqueta="Proteínas"
              icono="💪"
              medida={media.proteinas}
              objetivo={objetivos.proteinas?.valor}
            />
            {vitaminas.map(([etiqueta, medidaVit]) => (
              <BarraNutriente
                key={`vit-${etiqueta}`}
                etiqueta={etiqueta}
                icono="🍊"
                medida={medidaVit}
                objetivo={100}
              />
            ))}
            {minerales.map(([etiqueta, medidaMin]) => (
              <BarraNutriente
                key={`min-${etiqueta}`}
                etiqueta={etiqueta}
                icono="⛏️"
                medida={medidaMin}
              />
            ))}
          </div>
          <p className="nutri-nota-media">
            Media sobre {diasConAlgo}{" "}
            {diasConAlgo === 1
              ? "día con comidas marcadas"
              : "días con comidas marcadas"}
            .
          </p>
        </>
      ) : (
        <p className="nutri-semana-vacia">
          Todavía no has marcado ninguna comida. En cuanto marques la primera,
          aquí verás tu resumen nutricional de la semana.
        </p>
      )}

      {progreso.comidasHechas > 0 && (
        <div className="nutri-reiniciar">
          {confirmando ? (
            <>
              <span className="nutri-reiniciar-pregunta">
                ¿Seguro? Se desmarcarán las {progreso.comidasHechas} comidas.
              </span>
              <button
                type="button"
                className="btn btn-outline nutri-reiniciar-si"
                onClick={() => {
                  onReiniciar();
                  setConfirmando(false);
                }}
              >
                Sí, reiniciar
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setConfirmando(false)}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className="nutri-reiniciar-btn"
              onClick={() => setConfirmando(true)}
            >
              ↺ Reiniciar la semana
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default ResumenSemanal;
