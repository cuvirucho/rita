import React, { useEffect, useState } from 'react';
import { db } from '../FIRBAS/Firebase';
import { useNavigate } from 'react-router-dom';
import { generarMenu } from './Genradoria';
import { collection, getDocs } from 'firebase/firestore';
import Formulariopagos from './Pagos/Formulariopagos';
import Planos from './Plano/Planos';
import Footer from '../HOME/Footer';

const MenuDinamico = ({ preferencias }) => {
  const [listaigre, setListaIgre] = useState(null);
  const [menu, setMenu] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

 
  // Generar menú solo cuando listaigre está disponible
  useEffect(() => {
   
      cargarMenu();
    
  }, []); // Se ejecuta cuando listaigre cambia

  const cargarMenu = async () => {
    const nuevoMenu = await generarMenu(preferencias);
    setMenu(nuevoMenu);
    setCargando(false);
  };

  // Obtener ingredientes cuando se monta el componente
  useEffect(() => {
    if (!preferencias) {
      navigate('/'); // Si no hay preferencias, volver al formulario
      return;
    }

  }, []); // Se ejecuta solo una vez al montar

  console.log(menu);


console.log(preferencias);





//calendariao ///



const [selectedDay, setSelectedDay] = useState("dia1");






///PAGOS//*
//ACTIVADOD EFORMI //
const [actiivarfomuoago, setActiivarfomuoago] = useState(false)
const actipago = () =>{

setActiivarfomuoago(true)

}
 


  return(

    <>

   <section  className='contefullmnusalu'    >   

<img 
        src="https://res.cloudinary.com/db8e98ggo/image/upload/v1743140857/gifs_para_apps_gpxkfq.png" 
        alt="GIF animado" 
        className="logingfomi"
      />
{
  menu?
<>
  <div className="calendarcontainer">
  <h2  className='tiuloscidas' >Plan de Comidas</h2>
  
  <h3 className='frese'   >Nuestros menus se renuevan cada semanda </h3>
 
 

 

  <h2  className='usiaro'   >¡Hola {preferencias.name}! 🎉</h2>
<p className='frese2'  >Estamos emocionados de acompañarte en tu camino hacia un cuerpo más fuerte y saludable. Este menú ha sido especialmente diseñado para ayudarte a alcanzar tu meta de <strong>{preferencias.goal}</strong> de manera efectiva.</p>



<p className='frese2'> Primera semana</p>
<div className="days">
    {Object.keys(menu).map((day, index) => (
      <button id='btfia'
      key={index}
      className={selectedDay === day ? "active" : ""}
      onClick={() => setSelectedDay(day)}
      >
        Día {index + 1}
      </button>
    ))}
  </div>
 

  <div className="meals">
    {Object.entries(menu[selectedDay]).map(([meal, details], index) => (
      <div key={index} className={`meal-card ${meal}`}>
        <h3>{meal.charAt(0).toUpperCase() + meal.slice(1)}</h3>
        <p><strong>{details.nombre}</strong></p>
        <p>{details.descripcion}</p>
        <div     className='contingre'  >

       
        
 
       <div> <p><strong>Vitaminas</strong></p> {details.vitaminas ? Object.entries(details.vitaminas).map(([key, value], index) => (
  <p key={index}>{key}: {value}</p>
)) : 'No disponible'}
</div>

<p><strong>Proteinas</strong> {details.proteinas ? details.proteinas.total : 'No disponible'}</p>


<div> 
<p><strong>Minerales</strong></p> {details.minerales ? Object.entries(details.minerales).map(([key, value], index) => (
  <span key={index}>{key}: {value}</span>
)) : 'No disponible'}
</div>
        
        <p><strong>Calorías</strong> {details.calorias}</p>
        </div>
      </div>
    ))}
  </div>
</div>



<article className='contefullpagos'  > 

<section className='contebenficos'  >
<p className='frese'  >Esto es solo una prueba de lo que nuesta <strong className='ia'   >IA </strong> de nutricion puede hacer por ti adquire tu menbrecia  llena tu vida de salud y beneficos  </p>

<div  className='contSCROBENFICOS'  >


<ul  className='contelistabenefi'   >
           

      






           {/* seion 1   */ }
             
              
           <li id='itembeni1'   >    
                 
                
                 <img className="gif"    src="https://res.cloudinary.com/db8e98ggo/image/upload/v1736136676/PROSESANDO_17_kdybz5.gif" alt="Descripción de la imagen" />
     
                   
                   
                     <strong  className='tiylcdofunciona4'>Control total</strong>
                     <p className='tiylcdofunciona3'  >Crea tu menú personalizado con tus gustos y deja que nuestra IA optimice tu elección </p>
                 </li>
                 
                 
                   {/* seion 2  */ }
              
              
              
               
               <li   id='itembeni1'   >    
                  
               <img className="gif"    src="https://res.cloudinary.com/db8e98ggo/image/upload/v1735997330/PROSESANDO_12_xjsila.gif" alt="Descripción de la imagen" />
                     
                      <strong  className='tiylcdofunciona4'  > Segimineto fit</strong>
                      <p className='tiylcdofunciona3'   > En nuestra plataforma, registra tus comidas con calorías, vitaminas y nutrientes para un mejor control.</p>
                  </li>
   
                       {/* seion 3  */ }
              
                       <li id='itembeni1'   >  
               <video  className="gif" autoPlay loop muted>
           <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1739459854/PROSESANDO_fpgklg.mp4" type="video/mp4" />
           Tu navegador no soporta videos.
         </video>
   
   
                    <strong  className='tiylcdofunciona4'  >Delivery Gratis</strong> 
               <p className='tiylcdofunciona3'  > Llevamos tu paquete de comidas fit a donde quieras.</p>
   
                </li>
              
              
              
                 {/* seion 4  */ }
               <li id='itembeni1'  >  
                 
               <img className="gif"    src="https://res.cloudinary.com/db8e98ggo/image/upload/v1735948964/PROSESANDO_5_dtun5r.gif" alt="Descripción de la imagen" />
   
                   <strong  className='tiylcdofunciona4'    >IA de entrenamineto</strong>
                   <p className='tiylcdofunciona3'    > Accede a nuestra IA personalizada para entrenar en casa o el gym y alcanzar tus objetivos.</p>
              </li>
           
           
             </ul>
         

   </div>
  




  <p className='fresepago'  > 
  Adquire tu suscripcion mensual con todos estos benficios   

</p>


<section >
  <Planos/>
</section>

</section>




</article>


</>
:
<div className='contcargapant'  >

 <p className='frese'   >La IA de nutricion esta crando algo especial para ti </p> 
 
 <video  className="cargapantd" autoPlay loop muted>
           <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743620220/gifs_para_apps_1_vyt05f.mp4" type="video/mp4" />
           Tu navegador no soporta videos.
         </video>
   

</div>
}



   </section>
   <p className='frese'    >¡Registrate hoy y comienza a trabajar en tu mejor versión!</p>
<Footer/>


</>

  );


};

export default MenuDinamico;
