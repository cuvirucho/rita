import { useCallback, useMemo, useState } from "react";
import CarruselMetricas from "./CarruselMetricas";
import ModalCancelar from "./ModalCancelar";
import ModalOrdenar from "./ModalOrdenar";
import ModalPlato from "./ModalPlato";
import {
  clavePedido,
  loadPedidos,
  pedidosDeDia,
  savePedidos,
} from "./menuStorage";

// Orden y etiquetas de comidas según el plan. El backend genera hasta 5 comidas
// (desayuno, snack1, almuerzo, snack2, cena); aquí se muestra el subconjunto que
// corresponde al plan del usuario:
//   - starter / free (muestra): 3 comidas
//   - premium: 5 comidas
const MEAL_ORDER = {
  starter: ["desayuno", "almuerzo", "cena", "snack"],
  premium: ["desayuno", "snack", "almuerzo", "bebida", "cena"],
};

const MEAL_LABELS = {
  desayuno: "Desayuno",
  snack: "Snack día",
  almuerzo: "Almuerzo",
  bebida: "Bebida",
  cena: "Cena",
};

// Equivalente al campo `icono` que MenuDiario lee de sus datos estáticos: la IA
// no devuelve emoji, así que se deriva del tipo de comida.
const MEAL_ICONS = {
  desayuno: "🍳",
  snack: "🥜",
  almuerzo: "🍽️",
  bebida: "🥤",
  cena: "🌙",
};

// La IA no respeta siempre el nombre exacto de la clave: cuela espacios (el
// prompt llegó a pedir "calorias_promedio " con uno al final), mayúsculas o una
// variante del nombre. Se normaliza el objeto una vez y luego se busca por
// alias, en lugar de encadenar un `??` por cada variante.
const normalizarResumen = (resumen) => {
  if (!resumen || typeof resumen !== "object") return {};
  const plano = {};
  Object.entries(resumen).forEach(([clave, valor]) => {
    plano[clave.trim().toLowerCase()] = valor;
  });
  return plano;
};

// Los promedios llegan como número o como texto ("2400", "2400 kcal"): la
// unidad la pone la tarjeta, así que se conserva solo la parte numérica.
const valorMetrica = (resumen, alias) => {
  for (const clave of alias) {
    const bruto = resumen[clave];
    if (bruto == null || bruto === "") continue;
    if (typeof bruto === "number") return bruto;
    const num = String(bruto).match(/-?\d+(?:[.,]\d+)?/);
    if (num) return num[0].replace(",", ".");
  }
  return null;
};

// Promedios diarios del resumen semanal. Los alias van en minúscula y sin
// espacios porque `normalizarResumen` ya deja las claves así. Se mantienen las
// variantes antiguas: hay menús guardados en localStorage con esos nombres.
const METRICAS = [
  {
    emoji: "🔥",
    label: "Calorías",
    unidad: "kcal / día",
    alias: [
      "calorias_promedio",
      "promedio_calorias_diarias",
      "calorias_diarias_promedio",
      "promediocaloriasdiarias",
      "promediocalorias",
    ],
  },
  {
    emoji: "💪",
    label: "Proteínas",
    unidad: "g / día",
    alias: [
      "proteinas_promedio",
      "promedio_proteinas_diarias",
      "proteinas_diarias_promedio",
      "proteina_diaria_promedio",
      "promedioproteinasdiarias",
      "promedioproteinas",
    ],
  },
  {
    emoji: "🍞",
    label: "Carbohidratos",
    unidad: "g / día",
    alias: [
      "carbohidratos_promedio",
      "promedio_carbohidratos_diarios",
      "carbohidratos_diarios_promedio",
      "promediocarbohidratos",
      "carbos_promedio",
    ],
  },
  {
    emoji: "🥑",
    label: "Grasas",
    unidad: "g / día",
    alias: [
      "grasas_promedio",
      "promedio_grasas_diarias",
      "grasas_diarias_promedio",
      "promediograsas",
    ],
  },
  {
    emoji: "🌾",
    label: "Fibra",
    unidad: "g / día",
    alias: [
      "fibra_promedio",
      "promedio_fibra_diaria",
      "fibra_diaria_promedio",
      "promediofibra",
    ],
  },
];

const MenuResultado = ({
  menu,
  esFree,
  profile,
  plan = "starter",
  onReiniciar,
}) => {
  const dias = menu
    ? Object.keys(menu).filter((dia) => dia !== "resumen_semanal")
    : [];
  const [selectedDay, setSelectedDay] = useState(dias[0] || "dia1");
  // Comida cuyo detalle se está mostrando (null = modal cerrado).
  const [detalle, setDetalle] = useState(null);
  // Comida sobre la que se pulsó "Ordenar" (null = modal cerrado).
  const [ordenando, setOrdenando] = useState(null);
  // Comida cuyo pedido se está cancelando (null = modal cerrado).
  const [cancelando, setCancelando] = useState(null);
  // Comidas ya pedidas de ESTE menú; menuStorage las borra al generar otro.
  const [pedidos, setPedidos] = useState(loadPedidos);
  // Estables: los modales las usan como dependencia del listener de Escape.
  const cerrarDetalle = useCallback(() => setDetalle(null), []);
  const cerrarOrden = useCallback(() => setOrdenando(null), []);
  const cerrarCancelar = useCallback(() => setCancelando(null), []);

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
  const diaLabel = `Día ${indiceDia >= 0 ? indiceDia + 1 : 1}`;

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
            Día {index + 1}
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
