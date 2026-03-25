import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./HOME/Home";
import Formo from "./Formulario/Formo";
import { useState } from "react";
import MenuDinamico from "./Menu/MenuDinamico";
import Formulariopagos from "./Menu/Pagos/Formulariopagos";
import DetallePlan from "./Menu/Plano/DetallePlan";
import Verific from "./Verificarcobro/Verific";
import GeoGate from "./GeoGate/GeoGate";

const MAX_FREE_TRIALS = 3;
const TRIAL_KEY = "rita_ia_trials";

const TrialGate = ({ children }) => {
  const count = parseInt(localStorage.getItem(TRIAL_KEY) || "0", 10);
  if (count > MAX_FREE_TRIALS) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [preferencias, setPreferencias] = useState(null);

  return (
    <GeoGate>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/Formulario"
            element={
              <TrialGate>
                <Formo setPreferencias={setPreferencias} />
              </TrialGate>
            }
          />
          <Route
            path="/menu"
            element={<MenuDinamico preferencias={preferencias} />}
          />
          <Route path="/detales" element={<DetallePlan />} />
          <Route path="/verificarcobro" element={<Verific />} />
          <Route path="/Formulariopagos" element={<Formulariopagos />} />
        </Routes>
      </HashRouter>
    </GeoGate>
  );
}

export default App;
