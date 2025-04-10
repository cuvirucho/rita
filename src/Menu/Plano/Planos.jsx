import React from 'react';
import { Link } from 'react-router-dom';

const Planos = ({name}) => {
  const planData = [
    {
      title: 'Plan Básico',
      price: '$65 / mes',
      features: ['5 comida diarias', 'Ia de nuticon', 'Entrega a domicilio','Menú personalizado', 'Recogida en local'],
      style: 'basic'
    },
    {
      title: 'Plan Premium',
      price: '$85 / mes',
      features: ['Plan Básico ', 'Gratis gia de entrenamiento ', 'Entrega a varias locaciones', 'Club de beneficios'],
      style: 'premium'
    }
  ];

  return (
    <div className="plans-container">
      {planData.map((plan, index) => (
        <div key={index} className={`plan-card ${plan.style}`}>
          <h2>{plan.title} {name} </h2>
          <p className="price">{plan.price}</p>
          <ul>
            {plan.features.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <Link className='btnpñla' to="/Formulariopagos" >Elegir plan</Link>
        </div>
      ))}
    </div>
  );
};

export default Planos;
