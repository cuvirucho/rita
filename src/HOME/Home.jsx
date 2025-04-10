import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GoTriangleRight } from "react-icons/go";
import { SiCodefresh } from "react-icons/si";
import { LuChefHat } from "react-icons/lu";

import { FaHandHoldingHeart } from "react-icons/fa";
import Videocatgoriashome from './Videocatgoriashome';
import Videosmucoloplnes from './Videosmucoloplnes';
import Videiofievriolnes from './Videiofievriolnes';
import Videopricipla from './Videopricipla';
import Videogastrisi from './Videogastrisi';
import Reviews from './Reseñas/Reviews';
import { MdDeliveryDining } from "react-icons/md";

import Planos from '../Menu/Plano/Planos';
import Footer from './Footer';

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [flippedIndex, setFlippedIndex] = useState(null);
const [loquiero, setLoquiero] = useState("")
  const handleClick = (index) => {
    setFlippedIndex(flippedIndex === index ? null : index); // Cambia el estado solo para el índice clickeado
  };


  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const louqero=(name) =>{
scrollToSection("cabituvid")
setLoquiero(name)
  }
  useEffect(() => {
    // Desplazar al principio de la página cuando se monte el componente
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
    <div>
      <header className="header">
       
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        <button className='linkmenu' onClick={() => scrollToSection('inicio')}>Inicio</button>
    <button className='linkmenu' onClick={() => scrollToSection('cabituvid')}>Planes y Beneficios</button>
    <button className='linkmenu' onClick={() => scrollToSection('vida')}>Regístrate</button>
    <button className='linkmenu' onClick={() => scrollToSection('footer')}>Contáctanos</button>
        </nav>
      </header>

     
    </div>
    
 
    <section className="hero" id='inicio'   >
  
  
  <Videopricipla/>
  
  <div className="btnsconte">

    
    <button className='btnlocomo1' onClick={() => scrollToSection('cabituvid')}>Explorar Planes </button>


    <button    className="btnlocomo2"   onClick={() => scrollToSection('planes')} >
      Conocer Más
      <GoTriangleRight />

    </button>
  </div>


  
  </section>





  <section className="COMO">
     
     
     <p className='titulocomo'   >Planes de Nutrición Personalizados para Ti</p>
    
    

          <h3 className='tiylcdofunciona2'  >En Rita Fit diseñamos planes adaptados a tus necesidades para que disfrutes de una vida más saludable.</h3>
          
          
          <ul  className='contelistadepaso'   >
           

      






        {/* seion 1   */ }
          
           
        <li className='itemsecmo1'   >    
              
      
  
                <div  className='ESFER'  >
                <SiCodefresh />
                </div>
                
                  <p  className='tiylcdofunciona'>Ingredientes Frescos y Naturales</p>
                
              </li>
              
              
                {/* seion 2  */ }
           
           
           
            
            <li className='itemsecmo1'  >    
               
            <div  className='ESFER'  >
            <LuChefHat />

                </div>
                
   
                  
                   <p  className='tiylcdofunciona'  >Menús Variados y Deliciosos creados con IA</p>
                  
               </li>

                    {/* seion 3  */ }
           
                    <li className='itemsecmo1'  >  
                    <div  className='ESFER'  >
                    <MdDeliveryDining />


                </div>
                


                 <p  className='tiylcdofunciona'  >Entrega Directa a Tu Puerta</p> 
          

             </li>
           
           
           
              {/* seion 4  */ }
            <li className='itemsecmo1'  >  
              
            <div  className='ESFER'  >
            <FaHandHoldingHeart />

                </div>
                

                <p  className='tiylcdofunciona'    >Mejorando Tu Bienestar</p>
                
           </li>
         
          </ul>
      
      
  
  
  
  
     </section>



<section className="planes" id='planes'>
  
<p className='titulplaness'   >Explora Nuestras Categorías</p>
    
    

   
    
<ul className="contelistaplanes">
      {/* Sección 1 */}
      <li
        className={`itemseplanes1${flippedIndex === 0 ? 'flipped' : ''}`}
        onClick={() => handleClick(0)}
      >

<div className="front">
        <img 
        src="https://static.vecteezy.com/system/resources/previews/020/936/170/non_2x/portrait-of-a-happy-playful-girl-eating-fresh-salad-from-a-bowl-in-her-kitchen-beautiful-fit-woman-eating-healthy-salad-after-fitness-workout-photo.jpg" 
        alt="Ejemplo desde URL" 
        className='imgsecmo1'
      />

  
    <strong  className='tiylcdofunciona'>Planes Para peder peso</strong>
    <p  className='decricioplan'>Opciones diseñadas para mantener el equilibrio nutricional.</p>
    </div>
        <div className="back">
         <Videocatgoriashome/>
         <button onClick={()=> louqero("peder peso")} className="btnlopl1">
      Lo quiero
    </button>
         <p  className="btnlopl2">
      Mas planes
    </p>
        </div>
      </li>

      {/* Sección 2 */}
      <li
        className={`itemseplanes1${flippedIndex === 1 ? 'flipped' : ''}`}
        onClick={() => handleClick(1)}
      >
        <div className="front">
       <img 
              src="data:image/jpeg;base64,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" 
              alt="Ejemplo desde URL" 
              className='imgsecmo1'
            />
      
        
          <strong  className='tiylcdofunciona'>Dieta para ganar musculos</strong>
          <p  className='decricioplan'>Adaptadas a tus objetivos específicos de salud.</p>
          </div>   
          <div className="back">
         <Videosmucoloplnes/>
         <button onClick={()=> louqero("ganar musculo")}className="btnlopl1">
      Lo quiero
    </button>
         <p  className="btnlopl2">
      Mas planes
    </p>
        </div>
      </li>
    {/* seion 3  */ }
     
   
     
    <li
        className={`itemseplanes1${flippedIndex === 2 ? 'flipped' : ''}`}
        onClick={() => handleClick(2)}
      >
         <div className="front">
        <img 
              src="https://clinicaangloamericana.pe/wp-content/uploads/2020/11/CA_WEB_1200x800_diabetes.png" 
              alt="Ejemplo desde URL" 
              className='imgsecmo1'
            />
      
        
          <strong  className='tiylcdofunciona'>Plan contra la diabetes</strong>
          <p  className='decricioplan'>Cuida tu cuerpo  tu salud  y transforman tu estilo de vida!</p>
          </div>
          <div className="back">
         <Videiofievriolnes/>
         <button onClick={()=> louqero("contra la diabetes")}className="btnlopl1">
      Lo quiero
    </button>
         <p  className="btnlopl2">
      Mas planes
    </p>
        </div>
              </li>
              
     
     
        {/* seion 4  */ }
  

        <li
        className={`itemseplanes1${flippedIndex === 3 ? 'flipped' : ''}`}
        onClick={() => handleClick(3)}
      >
        <div className="front">
        <img 
              src="https://www.webconsultas.com/sites/default/files/styles/wc_adaptive_image__small/public/media/2024/03/20/gastritis_aguda.jpg.webp" 
              alt="Ejemplo desde URL" 
              className='imgsecmo1'
            />
      
        
          <strong  className='tiylcdofunciona'>Dieta contra gastriti</strong>
          <p  className='decricioplan'>alivia los síntomas de la gastritis de forma natural."</p>
          </div>
          <div className="back">
         <Videogastrisi/>
         <button onClick={()=> louqero("contra gastriti")} className="btnlopl1">
      Lo quiero
    </button>
         <p  className="btnlopl2">
      Mas planes
    </p>
        </div>
              </li>




    </ul>
  
  </section>




<section className="mas" id='mas'>



<Reviews/>


</section>










<section className="cabaituvid" id='vida'>



<div className='coteinfocabi'  >
  <h2   className='tulocabi'  >
  Transforma Tu Vida con Rita Fit
  </h2>
  <p   className='descabi'  >
  Empieza hoy a disfrutar de una alimentación saludable y personalizada. ¡Tu bienestar está a solo un clic de distancia!
  </p>
  <button  onClick={() => scrollToSection('cabituvid')} className="btnlcabituvid">
      Explorar Planes
    </button>
</div>

<img 
        src="https://chvmpionmind.com/wp-content/uploads/2024/03/vida-sana.jpeg" 
        alt="Ejemplo desde URL" 
        className='caiaimg'
      />


</section>


<section className="PLNES" id='cabituvid'>
 <div>

 <p className='cooplnes'  >
 Descubre Nuestros Planes
 </p>
 <h2>
 Planes Flexibles para Tu Estilo de Vida
 </h2>
 <p>
 Elige el plan que mejor se adapte a tus necesidades y comienza tu viaje hacia una vida más saludable con Rita Fit.
 </p>
 
 
</div>
 <Planos name={loquiero}  />
 
  </section>



<section className="gotest">
    <p  className='empisatitulo'  >Empiesa tu nueva vida !</p>
    <Link className='txbtngoformu'  to="/Formulario">
   <button className='btnlocomo11'   >
   
     Prueba nuestra IA 
   </button>
     </Link>
   
 
   
    </section>


<section className="footer"   id='footer'>
  <div className='contfooter'>
  <p className='titulofotter'  >¿Tienes preguntas? ¡Estamos aquí para ayudarte!</p>
  <p className='descfooter'  >Contáctanos y descubre cómo Rita Fit puede transformar tu vida.</p>
 
  <button className='btnlocontac' onClick={() => window.open('https://wa.me/593963200325', '_blank')}>
  Contactanos
</button>

 
  </div>

<Footer/>
  </section>


    </>
  )
}

export default Home