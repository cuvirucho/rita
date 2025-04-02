import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Formulariopagos = ({ preferciausaro }) => {
  // Estado único para almacenar toda la información del usuario
  const [usuariocplto, setUsuariocplto] = useState({
    document: '',
    documentType: 'CC',
    surname: '',
    email: '',
    phone: '',
    ...preferciausaro, // Cargar datos iniciales desde preferciausaro si existen
  });

  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  // Actualizar estado si `preferciausaro` cambia
  useEffect(() => {
    setUsuariocplto((prevState) => ({
      ...prevState,
      ...preferciausaro,
    }));
  }, [preferciausaro]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUsuariocplto((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!usuariocplto.document || !usuariocplto.phone || !usuariocplto.email) {
      alert('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    console.log('Datos enviados:', usuariocplto);
    alert("pasarela de pagos en construccion")
  };

  return (
    <div className="contefromufull">
      <h2 className="frese">Completa tu registro {usuariocplto.name}</h2>

      <form className="conetfomu" onSubmit={handleSubmit}>
        <div className="itemfomu">
          <label htmlFor="document">Identificación</label>
          <input
            className="iputfomu"
            type="number"
            id="document"
            value={usuariocplto.document}
            onChange={handleChange}
            required
          />
        </div>

        <div className="itemfomu">
          <label htmlFor="documentType">Tipo de Documento:</label>
          <select
            className="iputfomu"
            id="documentType"
            value={usuariocplto.documentType}
            onChange={handleChange}
          >
            <option value="CC">Cédula</option>
            <option value="RUC">RUC</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>

        <div className="itemfomu">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            className="iputfomu"
            type="email"
            id="email"
            value={usuariocplto.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="itemfomu">
          <label htmlFor="phone">Número de Teléfono:</label>
          <input
            className="iputfomu"
            type="number"
            id="phone"
            value={usuariocplto.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
       
          <button type="submit" className="btncompawr">
            Continuar
          </button>
          
        </div>
      </form>
    </div>
  );
};

export default Formulariopagos;
