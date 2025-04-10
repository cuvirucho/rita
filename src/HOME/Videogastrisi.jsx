import React, { useEffect, useState } from 'react';

const Videogastrisi = () => {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.matchMedia('(max-width: 768px)').matches) {
        setVideoSrc('https://res.cloudinary.com/db8e98ggo/video/upload/v1744253809/rita_751_x_1080_px_751_x_1080_px_3_ucrdn2.mp4'); // Versión móvil
      } else {
        setVideoSrc('https://res.cloudinary.com/db8e98ggo/video/upload/v1744253819/rita_751_x_1080_px_751_x_1080_px_1920_x_1080_px_3_sybxvy.mp4'); // Versión desktop
      }
    };

    checkScreenSize(); // Ejecutar al cargar
    window.addEventListener('resize', checkScreenSize); // Ejecutar al redimensionar

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!videoSrc) return null;

  return (
    <video className="videopalnes" autoPlay loop muted playsInline>
      <source src={videoSrc} type="video/mp4" />
      Tu navegador no soporta videos.
    </video>
    
  );
};

export default Videogastrisi;
