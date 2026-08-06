import { useCallback, useMemo, useState } from "react";
import CarruselMetricas from "./CarruselMetricas";
import ModalCancelar from "./ModalCancelar";
import ModalEditarPlato from "./ModalEditarPlato";
import ModalOrdenar from "./ModalOrdenar";
import ModalPlato from "./ModalPlato";
import {
  clavePedido,
  loadPedidos,
  pedidosDeDia,
  savePedidos,
} from "./menuStorage";
// Orden y etiquetas de comidas y días. Viven en comidas.js porque la sección
// de Nutrición usa exactamente los mismos valores.
import {
  MEAL_ICONS,
  MEAL_LABELS,
  MEAL_ORDER,
  diasDeMenu,
  etiquetaDeDia,
} from "./comidas";
// Lectura del `resumen_semanal`: normalización de claves y tabla de alias con
// las variantes antiguas. Vive en Nutrición porque allí también se usa, y dos
// copias de la tabla de alias acabarían desincronizadas.
import { ALIAS_RESUMEN, normalizarResumen } from "../Nutricion/objetivosNutricion";
import { aNumero } from "../Nutricion/nutricionCore";

// Promedios diarios del resumen semanal.
const METRICAS = [
  { emoji: "🔥", label: "Calorías", unidad: "kcal / día", alias: ALIAS_RESUMEN.calorias },
  { emoji: "💪", label: "Proteínas", unidad: "g / día", alias: ALIAS_RESUMEN.proteinas },
  { emoji: "🍞", label: "Carbohidratos", unidad: "g / día", alias: ALIAS_RESUMEN.carbohidratos },
  { emoji: "🥑", label: "Grasas", unidad: "g / día", alias: ALIAS_RESUMEN.grasas },
  { emoji: "🌾", label: "Fibra", unidad: "g / día", alias: ALIAS_RESUMEN.fibra },
];

// Primer alias con un número utilizable.
const valorMetrica = (resumen, alias) => {
  for (const clave of alias) {
    const num = aNumero(resumen[clave]);
    if (num != null) return num;
  }
  return null;
};

const MenuResultado = ({
  menu,
  esFree,
  profile,
  plan = "starter",
  userId,
  onReiniciar,
  onPlatoActualizado,
}) => {
  // Ordenados por el día real que nombran: la IA los devuelve desordenados
  // (un menú llegó como lunes, jueves, viernes, martes, miercoles).
  const dias = diasDeMenu(menu);
  const [selectedDay, setSelectedDay] = useState(dias[0] || "dia1");
  // Comida cuyo detalle se está mostrando (null = modal cerrado).
  const [detalle, setDetalle] = useState(null);
  // Comida sobre la que se pulsó "Ordenar" (null = modal cerrado).
  const [ordenando, setOrdenando] = useState(null);
  // Comida cuyo pedido se está cancelando (null = modal cerrado).
  const [cancelando, setCancelando] = useState(null);
  // Comida que se está cambiando con Rita (null = modal cerrado).
  const [editando, setEditando] = useState(null);
  // Comidas ya pedidas de ESTE menú; menuStorage las borra al generar otro.
  const [pedidos, setPedidos] = useState(loadPedidos);
  // Estables: los modales las usan como dependencia del listener de Escape.
  const cerrarDetalle = useCallback(() => setDetalle(null), []);
  const cerrarOrden = useCallback(() => setOrdenando(null), []);
  const cerrarCancelar = useCallback(() => setCancelando(null), []);
  const cerrarEditar = useCallback(() => setEditando(null), []);

  // Editar cuesta una llamada a la IA, así que queda fuera del plan free — que
  // tampoco puede crear otro menú. Sin `onPlatoActualizado` no habría dónde
  // guardar el plato nuevo, así que tampoco se ofrece.
  const puedeEditar = !esFree && !!onPlatoActualizado;

  // El modal avisa con TODAS las comidas del envío (la principal y los extras).
  const registrarPedido = useCallback(
    (claves, detalle) => {
      // Un solo ts para todo el envío: dentro del forEach cada comida podía
      // caer en un milisegundo distinto y parecer entregas separadas.
      const ts = Date.now();
      setPedidos((prev) => {
        const next = { ...prev };
        claves.forEach((meal) => {
          next[clavePedido(selectedDay, meal)] = { ...detalle, ts };
        });
        savePedidos(next);
        return next;
      });
    },
    [selectedDay],
  );

  // Cancelada la entrega en Firestore, se sueltan TODAS sus comidas: vuelven a
  // estar pendientes y esa entrega deja de gastar cupo del día.
  const soltarEntrega = useCallback((entregaId) => {
    setPedidos((prev) => {
      const next = {};
      Object.entries(prev).forEach(([clave, detalle]) => {
        if (detalle?.entregaId !== entregaId) next[clave] = detalle;
      });
      savePedidos(next);
      return next;
    });
    setCancelando(null);
  }, []);

  // Lo ya pedido del día visible. Memorizado porque el modal lo usa como
  // dependencia de sus useMemo: un objeto nuevo por render los invalidaría.
  const pedidosDia = useMemo(
    () => pedidosDeDia(pedidos, selectedDay),
    [pedidos, selectedDay],
  );

  const resumenSemanal = menu?.resumen_semanal;
  // Solo las métricas con dato: una tarjeta vacía descuadra la fila, y los
  // menús guardados antes de este cambio no traen carbos, grasas ni fibra.
  const metricas = useMemo(() => {
    const plano = normalizarResumen(resumenSemanal);
    return METRICAS.map((m) => ({
      ...m,
      valor: valorMetrica(plano, m.alias),
    })).filter((m) => m.valor != null);
  }, [resumenSemanal]);

  if (!menu || dias.length === 0) {
    return (
      <div className="usuario-empty">
        <span className="usuario-empty-icon">😕</span>
        <h3 className="usuario-empty-title">
          No pudimos generar tu menú esta vez.
        </h3>
        <p className="usuario-empty-text">
          Vuelve a intentarlo en unos minutos.
        </p>
        {onReiniciar && (
          <button
            type="button"
            className="usuario-empty-btn"
            onClick={onReiniciar}
          >
            <span className="usuario-empty-btn-icon">🔄</span>
            Intentar de nuevo
          </button>
        )}
      </div>
    );
  }

  const comidasDelPlan = MEAL_ORDER[plan] || MEAL_ORDER.starter;
  const diaActual = menu[selectedDay] || {};
  // Solo las comidas del plan que además existan en la respuesta de la IA.
  const comidas = comidasDelPlan.filter((meal) => diaActual[meal]);
  const indiceDia = dias.indexOf(selectedDay);
  const diaLabel = etiquetaDeDia(selectedDay, indiceDia >= 0 ? indiceDia : 0);

  // Las comidas del día en el formato que consume el modal de pedido.
  const comidasModal = comidas.map((meal) => ({
    key: meal,
    label: MEAL_LABELS[meal] || meal,
    icono: MEAL_ICONS[meal] || "🍽️",
    details: diaActual[meal],
  }));

  const cambiarDia = (day) => {
    setSelectedDay(day);
    setDetalle(null); // el detalle abierto ya no pertenece a este día
    setEditando(null); // ídem: se guardaría el plato en el día equivocado
  };

  return (
    <div className="rita-menu">
      <div className="menu-header">
        <h1 className="menu-header-title">Tu Plan de Comidas</h1>

        <p className="menu-header-desc">
          Este menú fue diseñado por Rita especialmente para ayudarte a alcanzar
          tu meta
          {profile?.goal ? (
            <>
              {" "}
              de <strong>{profile.goal}</strong>
            </>
          ) : null}
          . Se renueva cada semana.
        </p>
        <p className="menu-week-label">📅 Primera Semana</p>
      </div>

      <div className="menu-days">
        {dias.map((day, index) => (
          <button
            key={day}
            className={`menu-day-btn ${selectedDay === day ? "active" : ""}`}
            onClick={() => cambiarDia(day)}
          >
            {etiquetaDeDia(day, index)}
          </button>
        ))}
      </div>

      {/* Grid de comidas — key={selectedDay} re-monta y dispara la animación */}
      <div className="md-grid" key={selectedDay}>
        {comidas.map((meal, i) => {
          const details = diaActual[meal];
          const pedido = pedidos[clavePedido(selectedDay, meal)];

          return (
            <article
              key={meal}
              className={`md-card ${pedido ? "is-pedida" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Resumen clicable — abre el modal con el detalle del plato */}
              <button
                type="button"
                className="md-card-summary"
                onClick={() => setDetalle(meal)}
                aria-haspopup="dialog"
              >
                <span className="md-card-summary-top">
                  <span className="md-card-icon" aria-hidden="true">
                    {MEAL_ICONS[meal] || "🍽️"}
                  </span>
                  <span className="md-card-heading">
                    <span className="md-card-tipo">
                      {MEAL_LABELS[meal] || meal}
                      {/* Va en el resumen para que el estado se vea sin tener
                          que abrir el detalle. */}
                      {pedido && (
                        <span className="md-card-pedida-badge">✅ Pedido</span>
                      )}
                    </span>
                    <span className="md-card-nombre">{details.nombre}</span>
                  </span>
                  {details.calorias != null && (
                    <span className="md-card-cal">
                      <span className="md-cal-num">{details.calorias}</span>
                      <span className="md-cal-label">kcal</span>
                    </span>
                  )}
                  <span className="md-card-chevron" aria-hidden="true">
                    ›
                  </span>
                </span>
                <span className="md-card-desc">{details.descripcion}</span>
              </button>
            </article>
          );
        })}
      </div>

      {/* Sin objetivo ni una sola métrica no hay nada que resumir: se omite la
          tarjeta entera en vez de dejarla con solo el título. */}
      {resumenSemanal && (resumenSemanal.objetivo || metricas.length > 0) && (
        <div className="resumen-semanal-card">
          <div className="resumen-header">
            <h3>📊 Resumen Semanal</h3>
          </div>

          {resumenSemanal.objetivo && (
            <div className="objetivo-box">
              <span className="icono">🎯</span>
              <div>
                <small>Objetivo</small>
                <p>{resumenSemanal.objetivo}</p>
              </div>
            </div>
          )}

          {metricas.length > 0 && <CarruselMetricas metricas={metricas} />}
        </div>
      )}

      {/*nuevo menu solo si no es free*/}

      {!esFree && (
        <div className="rita-menu-actions">
          <button
            type="button"
            className="usuario-empty-btn"
            onClick={onReiniciar}
          >
            <span className="usuario-empty-btn-icon">✨</span>
            Crear otro menú
          </button>
        </div>
      )}

      {esFree && (
        <div className="rita-menu-actions">
          <p className="usuario-empty-btn">
            <span className="usuario-empty-btn-icon">✨</span>
            Activa tu plan a startet o premium para que esta comida llegue a
            domicilio y puedas crear más menús con una mejor personalización
          </p>
        </div>
      )}

      {detalle && diaActual[detalle] && (
        <ModalPlato
          icono={MEAL_ICONS[detalle] || "🍽️"}
          label={MEAL_LABELS[detalle] || detalle}
          details={diaActual[detalle]}
          pedido={pedidos[clavePedido(selectedDay, detalle)]}
          onCerrar={cerrarDetalle}
          // Se cierra este modal antes de abrir el siguiente: React agrupa
          // ambos set* en el mismo commit, así que no llegan a solaparse dos
          // overlays ni dos listeners de Escape.
          onOrdenar={() => {
            setDetalle(null);
            setOrdenando(detalle);
          }}
          onCancelar={() => {
            setDetalle(null);
            setCancelando(detalle);
          }}
          puedeEditar={puedeEditar}
          onEditar={() => {
            setDetalle(null);
            setEditando(detalle);
          }}
        />
      )}

      {editando && diaActual[editando] && (
        <ModalEditarPlato
          icono={MEAL_ICONS[editando] || "🍽️"}
          label={MEAL_LABELS[editando] || editando}
          mealType={editando}
          details={diaActual[editando]}
          userId={userId}
          onCerrar={cerrarEditar}
          // Solo aplica el cambio: el modal se queda abierto enseñando la
          // confirmación y se cierra él mismo pasados un par de segundos.
          onGuardar={(plato) => onPlatoActualizado(selectedDay, editando, plato)}
        />
      )}

      {ordenando && (
        <ModalOrdenar
          dia={selectedDay}
          diaLabel={diaLabel}
          mealKey={ordenando}
          comidas={comidasModal}
          pedidosDia={pedidosDia}
          onCerrar={cerrarOrden}
          onPedido={registrarPedido}
        />
      )}

      {cancelando && pedidosDia[cancelando]?.entregaId && (
        <ModalCancelar
          entregaId={pedidosDia[cancelando].entregaId}
          // Todas las comidas del mismo envío: se cancela el pedido completo.
          // Con la misma forma que los `items` de `entregas` ({nombre, label}),
          // que es lo que el modal sabe pintar.
          platos={comidasModal
            .filter(
              (c) =>
                pedidosDia[c.key]?.entregaId ===
                pedidosDia[cancelando].entregaId,
            )
            .map((c) => ({ nombre: c.details?.nombre, label: c.label }))}
          fechaEntrega={
            pedidosDia[cancelando].programadaParaMs
              ? new Date(pedidosDia[cancelando].programadaParaMs)
              : null
          }
          onCerrar={cerrarCancelar}
          onCancelada={soltarEntrega}
        />
      )}
    </div>
  );
};

export default MenuResultado;
