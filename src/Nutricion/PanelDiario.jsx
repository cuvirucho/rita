import { AnilloProgreso, BarraNutriente } from "./NutriGraficos";
import { formatearMedida } from "./nutricionCore";
import { etiquetaDeDiaCorto } from "../Rita/comidas";

/**
 * Lista de micronutrientes tal como vienen del menú.
 *
 * No hay catálogo: se recorre lo que el plato traía. Las vitaminas llegan en %
 * del valor diario, así que su objetivo es 100 y se les puede pintar barra.
 * Los minerales llegan en mg sin ninguna meta declarada, así que se muestra el
 * acumulado y nada más.
 */
const ListaMicros = ({ titulo, icono, micros, objetivo, pie }) => {
  const entradas = Object.entries(micros ?? {});

  return (
    <div className="nutri-micros">
      <h4 className="nutri-micros-titulo">
        {icono} {titulo}
      </h4>

      {entradas.length === 0 ? (
        <p className="nutri-micros-vacio">
          Marca alguna comida para ver lo que aporta.
        </p>
      ) : (
        <div className="nutri-micros-grid">
          {entradas.map(([etiqueta, medida]) => (
            <BarraNutriente
              key={etiqueta}
              etiqueta={etiqueta}
              medida={medida}
              objetivo={objetivo}
              compacta
            />
          ))}
        </div>
      )}

      {pie && entradas.length > 0 && <p className="nutri-micros-pie">{pie}</p>}
    </div>
  );
};

/**
 * Resumen del día seleccionado: lo consumido frente a lo que declara el menú.
 *
 * Solo se enseña lo que el menú trae de verdad. Un plato de Rita tiene
 * calorías, proteínas y sus vitaminas y minerales; no tiene carbohidratos,
 * grasas ni fibra, así que esos tres aparecen aparte y rotulados como promedio
 * del plan, nunca como algo consumido.
 */
const PanelDiario = ({
  dias,
  indiceSeleccionado,
  onSeleccionarDia,
  indiceHoy,
  esFinDeSemana,
  consumido,
  planificado,
  objetivos,
  comidasMarcadas,
  totalComidasDia,
}) => {
  const sinMarcar = comidasMarcadas === 0;

  const promediosDelPlan = [
    { clave: "carbohidratos", icono: "🍞", label: "Carbohidratos" },
    { clave: "grasas", icono: "🥑", label: "Grasas" },
    { clave: "fibra", icono: "🌾", label: "Fibra" },
  ].filter((m) => objetivos[m.clave]);

  return (
    <section className="nutri-bloque nutri-panel">
      <div className="nutri-bloque-head">
        <h3 className="nutri-bloque-titulo">📊 Resumen del día</h3>
        <p className="nutri-bloque-sub">
          {sinMarcar
            ? "Marca tus comidas en el plan de abajo para ver lo que llevas consumido."
            : `Llevas ${comidasMarcadas} de ${totalComidasDia} comidas de este día.`}
        </p>
      </div>

      {/* Selector de días. La etiqueta sale de la CLAVE del día ("jueves"), no
          de su posición: la IA devuelve los días desordenados. */}
      <div className="nutri-dias-tabs" role="tablist" aria-label="Día del plan">
        {dias.map((estado) => (
          <button
            key={estado.dia}
            type="button"
            role="tab"
            aria-selected={estado.indice === indiceSeleccionado}
            className={`nutri-dia-btn ${
              estado.indice === indiceSeleccionado ? "active" : ""
            } ${estado.completo ? "is-completo" : ""}`}
            onClick={() => onSeleccionarDia(estado.indice)}
          >
            {etiquetaDeDiaCorto(estado.dia, estado.indice)}
            {estado.indice === indiceHoy && (
              <span className="nutri-dia-btn-punto" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {esFinDeSemana && (
        <p className="nutri-nota-finde">
          🗓️ Tu plan cubre de lunes a viernes. Te mostramos el lunes.
        </p>
      )}

      <div className="nutri-anillos nutri-anillos--dos">
        <AnilloProgreso
          etiqueta="Calorías"
          icono="🔥"
          valor={consumido?.calorias ?? 0}
          unidad="kcal"
          objetivo={objetivos.calorias?.valor}
          neutro={sinMarcar}
        />
        <AnilloProgreso
          etiqueta="Proteínas"
          icono="💪"
          valor={consumido?.proteinas?.valor ?? 0}
          unidad={consumido?.proteinas?.unidad || "g"}
          objetivo={objetivos.proteinas?.valor}
          neutro={sinMarcar}
        />
      </div>

      {sinMarcar && planificado?.calorias != null && (
        <p className="nutri-planificado">
          Este día tiene{" "}
          <strong>{Math.round(planificado.calorias)} kcal</strong> planificadas
          en {totalComidasDia} comidas.
        </p>
      )}

      <div className="nutri-micros-wrap">
        <ListaMicros
          titulo="Vitaminas"
          icono="🍊"
          micros={consumido?.vitaminas}
          objetivo={100}
          pie="El menú da las vitaminas como porcentaje del valor diario recomendado."
        />
        <ListaMicros
          titulo="Minerales"
          icono="⛏️"
          micros={consumido?.minerales}
          pie="El menú no declara un objetivo diario de minerales, así que se muestra lo acumulado."
        />
      </div>

      {promediosDelPlan.length > 0 && (
        <div className="nutri-promedios">
          <h4 className="nutri-micros-titulo">📋 Promedios de tu plan</h4>
          <p className="nutri-promedios-sub">
            Cifras que Rita calculó para el menú entero. No son lo que llevas
            consumido: los platos no traen este desglose comida a comida.
          </p>
          <ul className="nutri-promedios-grid">
            {promediosDelPlan.map((m) => (
              <li key={m.clave} className="nutri-promedio">
                <span className="nutri-promedio-icono" aria-hidden="true">
                  {m.icono}
                </span>
                <span className="nutri-promedio-label">{m.label}</span>
                <span className="nutri-promedio-valor">
                  {formatearMedida(objetivos[m.clave])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {objetivos.objetivo && (
        <div className="nutri-contexto">
          <span className="nutri-contexto-icono" aria-hidden="true">
            🎯
          </span>
          <div>
            <p className="nutri-contexto-titulo">{objetivos.objetivo}</p>
            <p className="nutri-contexto-texto">
              {objetivos.hay
                ? "Los objetivos diarios son los promedios que Rita calculó para este menú."
                : "Este menú no trae promedios diarios, así que se muestran los totales sin porcentaje."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default PanelDiario;
