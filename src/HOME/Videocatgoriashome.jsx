import React, { useEffect, useState } from "react";

const Videocatgoriashome = () => {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setVideoSrc(
          "https://res.cloudinary.com/db8e98ggo/video/upload/v1744566093/rita_1_vxkc1w.mp4",
        ); // Versión móvil
      } else {
        setVideoSrc(
          "https://res.cloudinary.com/db8e98ggo/video/upload/v1744566093/rita_1_vxkc1w.mp4",
        ); // Versión desktop
      }
    };

    checkScreenSize(); // Ejecutar al cargar
    window.addEventListener("resize", checkScreenSize); // Ejecutar al redimensionar

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!videoSrc) return null;

  return (
    <video className="hero-video" autoPlay loop muted playsInline>
      <source src={videoSrc} type="video/mp4" />
      Tu navegador no soporta videos.
    </video>
  );
};

export default Videocatgoriashome;
