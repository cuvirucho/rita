import {
  HashRouter,
  Routes,
  Route
} from 'react-router-dom'
import Home from './HOME/Home';
import Formo from './Formulario/Formo';
import { useState } from 'react';
import MenuDinamico from './Menu/MenuDinamico';
import Formulariopagos from './Menu/Pagos/Formulariopagos';

function App() {
  const [preferencias, setPreferencias] = useState(null);
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Formulario" element={<Formo setPreferencias={setPreferencias}    />} />
        <Route path="/menu" element={<MenuDinamico preferencias={preferencias} />} />
        <Route path="/Formulariopagos" element={<Formulariopagos preferencias={""} />} />
      </Routes>
    </HashRouter>
  );
}

export default App
