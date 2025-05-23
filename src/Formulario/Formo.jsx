import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Formo = ({setPreferencias}) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    goal: "bajar peso",
    dietaryRestrictions: "",
    dislikes: "",
    like: "",

  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);
    setPreferencias(formData);
    navigate("/menu");
  };


  useEffect(() => {
    // Desplazar al principio de la página cuando se monte el componente
    window.scrollTo(0, 0);
  }, []);



  return (
   
   <section  className='confullseccionformu'     >
     <img 
        src="https://res.cloudinary.com/db8e98ggo/image/upload/v1743140857/gifs_para_apps_gpxkfq.png" 
        alt="GIF animado" 
        className="logingfomi"
      />

 <h1 className='titulopricopafomu'  > Potencia tu vida con un plan comidas personalisado  </h1>
 <section>

 <video className="video" autoPlay loop muted>
        <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743095590/Copia_de_Sin_t%C3%ADtulo_V%C3%ADdeo_qm0svk.mp4" type="video/mp4" />
        Tu navegador no soporta videos.
      </video>
  <h2> Cuentanos sobre ti   </h2>
  <p> Al llenar este formulario nuestra ia de nutricion generara el mejor menu para ti    </p>
 </section>
   
   <form className="conteform" onSubmit={handleSubmit}>
      <label  className='itmeformo'  >Nombre:  <input  className='impuformo'   type="text" name="name" value={formData.name} onChange={handleChange} required /></label>
      <label className='itmeformo'   >Edad: <input    className='impuformo'    type="number" name="age" value={formData.age} onChange={handleChange} required /></label>
      <label className='itmeformo'   >Peso (kg): <input   className='impuformo'   type="number" name="weight" value={formData.weight} onChange={handleChange} required /></label>
      <label  className='itmeformo'  >Altura (cm): <input    className='impuformo' type="number" name="height" value={formData.height} onChange={handleChange} required /></label>
      <label  className='itmeformo'  >Objetivo:
        <select  className='impuformo'    name="goal" value={formData.goal} onChange={handleChange}>
          <option value="Bajar peso">Bajar de peso</option>
          <option value="Aumentar musculo">Aumentar músculo</option>
          <option value="Cuidado de diabetes">Cuidado de diabetes</option>
          <option value="Cuidado de  hipertensión">Cuidado de  hipertensión</option>
          <option value="Cuidado de  gastritis">Cuidado de  Gastritis</option>
        </select>
      </label>
      <label className='itmeformo'  >Restricciones alimenticias: <input   className='impuformo' type="text" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} /></label>
      <label className='itmeformo'   >Alimentos que no te gustan: <input   className='impuformo'   type="text" name="dislikes" value={formData.dislikes} onChange={handleChange} /></label>
      <label className='itmeformo'   >Cuentale a la IA que te gusta comer <input   className='impuformo'   type="text" name="like" value={formData.like} onChange={handleChange} /></label>
      

      <button className='btnecuat'    type="submit">Enviar Encuesta</button>
    </form>
    </section>
  );
};


export default Formo