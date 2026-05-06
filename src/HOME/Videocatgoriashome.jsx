import React, { useEffect, useState } from "react";

const Videocatgoriashome = ({ onLoaded }) => {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setVideoSrc(
          "https://res.cloudinary.com/db8e98ggo/video/upload/v1744566093/rita_1_vxkc1w.mp4",
        );
      } else {
        setVideoSrc(
          "https://res.cloudinary.com/db8e98ggo/video/upload/v1744566093/rita_1_vxkc1w.mp4",
        );
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!videoSrc) return null;

  return (
    <video
      className="hero-video"
      autoPlay
      loop
      muted
      playsInline
      onCanPlay={() => onLoaded && onLoaded()}
    >
      <source src={videoSrc} type="video/mp4" />
      Tu navegador no soporta videos.
    </video>
  );
};

export default Videocatgoriashome;
