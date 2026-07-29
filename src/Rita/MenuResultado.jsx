import { useState } from "react";

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
  const resumenSemanal = menu?.resumen_semanal;
  console.log(menu);

  return (
    <div className="rita-menu">
      <div className="menu-header">
        <h1 className="menu-header-title">Tu Plan de Comidas</h1>
        {profile?.name && (
          <div className="menu-header-badge">¡Hola {profile.name}! 🎉</div>
        )}
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
            onClick={() => setSelectedDay(day)}
          >
            Día {index + 1}
          </button>
        ))}
      </div>

      <div className="menu-meals">
        {comidas.map((meal) => {
          const details = diaActual[meal];
          return (
            <div key={meal} className={`meal-card ${meal}`}>
              <h3>{MEAL_LABELS[meal] || meal}</h3>
              <p className="meal-name">{details.nombre}</p>
              <p className="meal-desc">{details.descripcion}</p>
              <div className="meal-nutrients">
                <div className="nutrient-group">
                  <span className="nutrient-label">Calorías</span>
                  <span className="nutrient-value">
                    {details.calorias} kcal
                  </span>
                </div>
                <div className="nutrient-group">
                  <span className="nutrient-label">Proteínas</span>
                  <span className="nutrient-value">
                    {details.proteinas ? details.proteinas.total : "—"}
                  </span>
                </div>
                {details.vitaminas && (
                  <div className="nutrient-group">
                    <span className="nutrient-label">Vitaminas</span>
                    {Object.entries(details.vitaminas).map(([key, value]) => (
                      <span className="nutrient-value" key={key}>
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
                {details.minerales && (
                  <div className="nutrient-group">
                    <span className="nutrient-label">Minerales</span>
                    {Object.entries(details.minerales).map(([key, value]) => (
                      <span className="nutrient-value" key={key}>
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {resumenSemanal && (
        <div className="resumen-semanal">
          <h3>Resumen Semanal</h3>

          <p>{resumenSemanal.objetivo}</p>
          <p>
            {" "}
            promedio calorias diarias:{" "}
            {resumenSemanal.promedio_calorias_diarias}
          </p>
          <p>
            {" "}
            promedio proteínas diarias:{" "}
            {resumenSemanal.promedio_proteinas_diarias}
          </p>
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
    </div>
  );
};

export default MenuResultado;
