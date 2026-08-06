import { useEffect, useState } from "react";
import { MEAL_ICONS, MEAL_LABELS, etiquetaDeDia } from "../Rita/comidas";
import ModalNutrientes from "./ModalNutrientes";
import { formatearNumero } from "./nutricionCore";
import { lecturaDeComida, nutricionDeDia } from "./progreso";

/**
 * ¿Estamos en una pantalla estrecha?
 *
 * Hace falta en JavaScript y no basta el CSS porque `open` es un atributo del
 * DOM: no hay forma de abrir o cerrar un <details> desde una media query. El
 * mismo corte de 640 px que usa la hoja de estilos.
 */
const useMovil = () => {
  const consulta = "(max-width: 640px)";
  const [movil, setMovil] = useState(
    () => typeof window !== "undefined" && window.matchMedia(consulta).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const alCambiar = (e) => setMovil(e.matches);
    mq.addEventListener("change", alCambiar);
    // Por si el ancho cambió entre el primer render y este efecto.
    setMovil(mq.matches);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  return movil;
};

/**
 * Un día del plan con sus comidas y sus casillas.
 *
 * Es un <details> y no un <article>: en móvil las cinco tarjetas sumaban unos
 * 1.700 px de scroll, así que se pliegan y solo queda abierto el día de hoy.
 * <summary> ya es nativamente un botón con `aria-expanded` y navegable con
 * teclado, así que no hay que inventarse roles ni atajos.
 *
 * La casilla de cada comida es un <input type="checkbox"> de verdad con su
 * <label> asociado, por el mismo motivo.
 */
const TarjetaDia = ({
  menu,
  estado,
  esHoy,
  marcas,
  onAlternar,
  onVerNutrientes,
  claveDe,
  abiertoInicial,
}) => {
  const lecturaDia = nutricionDeDia(menu, estado.dia, estado.comidas, {
    marcas,
    soloConsumidas: true,
  });
  const planificado = nutricionDeDia(menu, estado.dia, estado.comidas);

  const pct = estado.total > 0 ? (estado.hechas / estado.total) * 100 : 0;

  const [abierto, setAbierto] = useState(abiertoInicial);
  // Al cruzar el breakpoint (girar el móvil, redimensionar) cambia el valor por
  // defecto y hay que volver a sincronizar lo que está abierto.
  useEffect(() => setAbierto(abiertoInicial), [abiertoInicial]);

  return (
    <details
      className={`nutri-dia-card ${estado.completo ? "is-completo" : ""} ${
        esHoy ? "is-hoy" : ""
      }`}
      open={abierto}
      onToggle={(e) => setAbierto(e.currentTarget.open)}
    >
      {/* Solo <span>: el modelo de contenido de <summary> es contenido de
          frase, así que un <div> o un <h4> aquí dentro sería HTML inválido. */}
      <summary className="nutri-dia-summary">
        <span className="nutri-dia-head">
          <span className="nutri-dia-titulo">
            <span className="nutri-dia-nombre">
              {etiquetaDeDia(estado.dia, estado.indice)}
              {esHoy && <span className="nutri-dia-hoy">Hoy</span>}
            </span>
            <span className="nutri-dia-sub">
              {estado.hechas} de {estado.total} comidas ·{" "}
              {formatearNumero(lecturaDia.calorias ?? 0)} de{" "}
              {formatearNumero(planificado.calorias ?? 0)} kcal
            </span>
          </span>
          <span className="nutri-dia-check" aria-hidden="true">
            {estado.completo ? "✅" : `${Math.round(pct)}%`}
          </span>
          <span className="nutri-dia-flecha" aria-hidden="true">
            ▾
          </span>
        </span>

        {/* Dentro del summary para que el progreso del día se siga viendo
            cuando la tarjeta está plegada. */}
        <span className="nutri-dia-barra" aria-hidden="true">
          <span className="nutri-dia-barra-fill" style={{ width: `${pct}%` }} />
        </span>
      </summary>

      <ul className="nutri-comidas">
        {estado.comidas.map((meal) => {
          const plato = menu[estado.dia][meal];
          const consumida = !!marcas[claveDe(estado.dia, meal)];
          const id = `nutri-${estado.dia}-${meal}`;
          const lectura = lecturaDeComida(menu, estado.dia, meal);

          return (
            <li
              key={meal}
              className={`nutri-comida ${consumida ? "is-consumida" : ""}`}
            >
              <input
                type="checkbox"
                id={id}
                className="nutri-comida-check"
                checked={consumida}
                onChange={() => onAlternar(estado.dia, meal)}
              />
              <label className="nutri-comida-label" htmlFor={id}>
                <span className="nutri-comida-caja" aria-hidden="true" />
                <span className="nutri-comida-icono" aria-hidden="true">
                  {MEAL_ICONS[meal] || "🍽️"}
                </span>
                <span className="nutri-comida-texto">
                  <span className="nutri-comida-tipo">
                    {MEAL_LABELS[meal] || meal}
                  </span>
                  <span className="nutri-comida-nombre">{plato?.nombre}</span>
                </span>
                {lectura.calorias != null && (
                  <span className="nutri-comida-kcal">
                    {formatearNumero(lectura.calorias)}
                    <small>kcal</small>
                  </span>
                )}
              </label>
              <button
                type="button"
                className="nutri-comida-ver"
                onClick={() => onVerNutrientes({ dia: estado.dia, meal })}
                aria-label={`Ver nutrientes de ${plato?.nombre}`}
              >
                🔬
              </button>
            </li>
          );
        })}
      </ul>

      {estado.total === 0 && (
        <p className="nutri-dia-vacio">Rita no generó comidas para este día.</p>
      )}
    </details>
  );
};

/**
 * Plan semanal completo con las casillas de "consumida".
 *
 * Marcar recalcula el resumen diario y el semanal en el mismo render: todo sale
 * de `marcas`, que es el único estado, así que no hay dos cifras que puedan
 * discrepar.
 */
const PlanSemanal = ({
  menu,
  progreso,
  marcas,
  claveDe,
  onAlternar,
  indiceHoy,
}) => {
  const [detalle, setDetalle] = useState(null);
  const movil = useMovil();

  const platoDetalle = detalle ? menu?.[detalle.dia]?.[detalle.meal] : null;

  return (
    <section className="nutri-bloque">
      <div className="nutri-bloque-head">
        <h3 className="nutri-bloque-titulo">📅 Tu plan de la semana</h3>
        <p className="nutri-bloque-sub">
          Marca cada comida cuando la hayas tomado. El progreso se guarda solo y
          te sigue en todos tus dispositivos.
          {movil && " Toca un día para desplegarlo."}
        </p>
      </div>

      <div className="nutri-dias-grid">
        {progreso.dias.map((estado) => (
          <TarjetaDia
            key={estado.dia}
            menu={menu}
            estado={estado}
            esHoy={estado.indice === indiceHoy}
            marcas={marcas}
            claveDe={claveDe}
            onAlternar={onAlternar}
            onVerNutrientes={setDetalle}
            // En PC se ven los cinco días; en móvil solo el de hoy, y el resto
            // se despliega tocando su cabecera.
            abiertoInicial={!movil || estado.indice === indiceHoy}
          />
        ))}
      </div>

      {detalle && platoDetalle && (
        <ModalNutrientes
          icono={MEAL_ICONS[detalle.meal] || "🍽️"}
          label={MEAL_LABELS[detalle.meal] || detalle.meal}
          plato={platoDetalle}
          lectura={lecturaDeComida(menu, detalle.dia, detalle.meal)}
          consumida={!!marcas[claveDe(detalle.dia, detalle.meal)]}
          onAlternar={() => onAlternar(detalle.dia, detalle.meal)}
          onCerrar={() => setDetalle(null)}
        />
      )}
    </section>
  );
};

export default PlanSemanal;
