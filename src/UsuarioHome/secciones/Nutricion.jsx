import { useMemo, useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { useMenuGuardado } from "../../Rita/useMenuGuardado";
import { MEAL_ORDER, indiceDeHoy } from "../../Rita/comidas";
import { planUsuario } from "./deliveryUtils";

import NutricionBloqueada from "../../Nutricion/NutricionBloqueada";
import PanelDiario from "../../Nutricion/PanelDiario";
import PlanSemanal from "../../Nutricion/PlanSemanal";
import ResumenSemanal from "../../Nutricion/ResumenSemanal";
import { claveConsumo } from "../../Nutricion/consumoStorage";
import { objetivosDelMenu } from "../../Nutricion/objetivosNutricion";
import {
  nutricionDeDia,
  nutricionDeSemana,
  progresoSemanal,
} from "../../Nutricion/progreso";
import { useConsumo } from "../../Nutricion/useConsumo";

/**
 * Panel de seguimiento nutricional.
 *
 * Toda la sección se apoya en un único estado —las comidas marcadas— y en el
 * menú que Rita ya generó: el resumen del día, el plan semanal y las
 * estadísticas se derivan de ahí en el mismo render, así que no hay dos cifras
 * que puedan discrepar.
 */
const Nutricion = () => {
  const { user, perfil } = useAuth();
  const plan = planUsuario(perfil);

  // El corte del plan Free va ANTES de cualquier hook de datos: así el usuario
  // gratuito no dispara ni una lectura de Firestore ni se calcula un solo
  // nutriente. Los hooks de abajo se llaman siempre porque este return está por
  // encima de todos ellos y `plan` no cambia dentro de un montaje.
  if (plan === "free") return <NutricionBloqueada />;

  return <NutricionPanel user={user} plan={plan} />;
};

const NutricionPanel = ({ user, plan }) => {
  const { estado, guardado } = useMenuGuardado(user?.uid);
  const menu = guardado?.menu ?? null;
  console.log(menu);

  const comidasDelPlan = MEAL_ORDER[plan] || MEAL_ORDER.starter;
  const { marcas, alternar, reiniciar, sincronizado } = useConsumo(
    user?.uid,
    menu,
  );

  // Los objetivos salen del propio menú, no de una tabla de referencia.
  const objetivos = useMemo(
    () => objetivosDelMenu(menu?.resumen_semanal),
    [menu],
  );

  const progreso = useMemo(
    () => progresoSemanal(menu, marcas, comidasDelPlan),
    [menu, marcas, comidasDelPlan],
  );

  // El día de hoy manda al abrir; a partir de ahí el usuario elige. Se busca
  // por NOMBRE de día, porque la IA los devuelve desordenados.
  const clavesDias = useMemo(
    () => progreso.dias.map((d) => d.dia),
    [progreso.dias],
  );
  const hoy = useMemo(() => indiceDeHoy(clavesDias), [clavesDias]);

  const [diaElegido, setDiaElegido] = useState(null);
  const indiceActivo = diaElegido ?? hoy.indice;
  const diaActivo = progreso.dias[indiceActivo];

  const consumido = useMemo(
    () =>
      diaActivo
        ? nutricionDeDia(menu, diaActivo.dia, comidasDelPlan, {
            marcas,
            soloConsumidas: true,
          })
        : null,
    [menu, diaActivo, comidasDelPlan, marcas],
  );

  const planificado = useMemo(
    () =>
      diaActivo ? nutricionDeDia(menu, diaActivo.dia, comidasDelPlan) : null,
    [menu, diaActivo, comidasDelPlan],
  );

  const semana = useMemo(
    () =>
      nutricionDeSemana(menu, comidasDelPlan, {
        marcas,
        soloConsumidas: true,
      }),
    [menu, comidasDelPlan, marcas],
  );

  const cabecera = (
    <div className="usuario-seccion-head">
      <span className="usuario-seccion-badge">🥗 Nutrición</span>
      <h2 className="usuario-seccion-title">Seguimiento nutricional</h2>
      <p className="usuario-seccion-sub">
        Tu progreso real frente a tus objetivos, comida a comida.
      </p>
    </div>
  );

  if (estado === "resolviendo") {
    return (
      <div className="usuario-seccion">
        {cabecera}
        <div className="nutri-skeleton" aria-busy="true" aria-live="polite">
          <span className="delivery-skel delivery-skel--card" />
          <span className="delivery-skel delivery-skel--card" />
        </div>
      </div>
    );
  }

  // Sin menú no hay nada que analizar: se invita a crearlo donde se crea, en
  // "Plan de Comidas", en vez de duplicar aquí el chat de Rita.
  if (!menu || progreso.totalDias === 0) {
    return (
      <div className="usuario-seccion">
        {cabecera}
        <div className="usuario-empty">
          <span className="usuario-empty-icon">🥗</span>
          <h3 className="usuario-empty-title">
            Aún no tienes un menú que analizar
          </h3>
          <p className="usuario-empty-text">
            Crea tu menú semanal con Rita en <strong>Plan de Comidas</strong> y
            aquí verás al instante las calorías, los macros, las vitaminas y los
            minerales de cada comida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuario-seccion nutri-panel">
      {cabecera}

      {!sincronizado && (
        <p className="nutri-sync nutri-sync--offline">
          📴 Sin conexión: tus marcas se guardan en este dispositivo y se
          sincronizarán al volver.
        </p>
      )}

      <PanelDiario
        dias={progreso.dias}
        indiceSeleccionado={indiceActivo}
        onSeleccionarDia={setDiaElegido}
        indiceHoy={hoy.indice}
        esFinDeSemana={hoy.esFinDeSemana && diaElegido == null}
        consumido={consumido}
        planificado={planificado}
        objetivos={objetivos}
        comidasMarcadas={diaActivo?.hechas ?? 0}
        totalComidasDia={diaActivo?.total ?? 0}
      />

      <PlanSemanal
        menu={menu}
        progreso={progreso}
        marcas={marcas}
        claveDe={claveConsumo}
        onAlternar={alternar}
        indiceHoy={hoy.indice}
      />

      <ResumenSemanal
        progreso={progreso}
        semana={semana}
        objetivos={objetivos}
        onReiniciar={reiniciar}
      />
    </div>
  );
};

export default Nutricion;
