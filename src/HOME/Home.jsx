import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
    <section className="hero">
   <video className="video-bg" autoPlay loop muted>
        <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743092295/Sin_t%C3%ADtulo_V%C3%ADdeo_1_z0kyje.mp4" type="video/mp4" />
        Tu navegador no soporta videos.
      </video>
  </section>

  <section className="COMO">
     
     
     <p className='titulocomo'   >Obtén un plan de comidas saludables diseñado para tus objetivos.</p>
    
    
     <div className="steps">
          <h3 className='tiylcdofunciona2'  >¿Cómo funciona?</h3>
          
          
          <ul  className='contelistadepaso'   >
           

      






        {/* seion 1   */ }
          
           
        <li className='itemsecmo1'   >    
              
              <video  className="gif" autoPlay loop muted>
          <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743111179/25_dnqd3f.mp4" type="video/mp4" />
          Tu navegador no soporta videos.
        </video>
  
                
                
                  <strong  className='tiylcdofunciona'>1 Elige tu Meta</strong>
                  <p className='tiylcdofunciona'  > Llena tu formulario dependiendo si buscas perder peso, ganar músculo o tienes necesidades especiales.</p>
              </li>
              
              
                {/* seion 2  */ }
           
           
           
            
            <li className='itemsecmo1'  >    
               
               <video  className="gif" autoPlay loop muted>
           <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743111180/26_sebbyn.mp4" type="video/mp4" />
           Tu navegador no soporta videos.
         </video>
   
                  
                   <strong  className='tiylcdofunciona'  >2  la IA de nutricion:</strong>
                   <p className='tiylcdofunciona'   > diseñamos tu plan personalizado a medida y que cubre tus nesecidades </p>
               </li>

                    {/* seion 3  */ }
           
                    <li className='itemsecmo1'  >  
            <video  className="gif" autoPlay loop muted>
        <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743111193/24_hsp4ja.mp4" type="video/mp4" />
        Tu navegador no soporta videos.
      </video>


                 <strong  className='tiylcdofunciona'  >3 Regístrate</strong> 
            <p className='tiylcdofunciona'  > Crea tu cuenta y completa tu suscripcion a tu plan de comidas</p>

             </li>
           
           
           
              {/* seion 4  */ }
            <li className='itemsecmo1'  >  
              
            <video  className="gif" autoPlay loop muted>
        <source src="https://res.cloudinary.com/db8e98ggo/video/upload/v1743111179/27_ootndx.mp4" type="video/mp4" />
        Tu navegador no soporta videos.
      </video>

                <strong  className='tiylcdofunciona'    >4 Recibe tu comida:</strong>
                <p className='tiylcdofunciona'    > Te enviamos tus comidas listas o puedes consumir en nuestro local.</p>
           </li>
          </ul>
      
      
        </div>
  
  
  
  
     </section>


<section className="gotest">
    <p  className='empisatitulo'  >Empiesa tu nueva vida !</p>
    <Link className='txbtngoformu'  to="/Formulario">
   <button className='btnlocomo11'   >
   
     Empesemos
   </button>
     </Link>
   
 
   
    </section>



    </>
  )
}

export default Home