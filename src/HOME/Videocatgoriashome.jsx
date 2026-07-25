import React, { useEffect, useState } from "react";

const Videocatgoriashome = ({ onLoaded }) => {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setVideoSrc(
          "https://res.cloudinary.com/db8e98ggo/video/upload/v1785004602/rita_751_x_1080_px_751_x_1080_px_1920_x_1080_px_cutf4q.mp4",
        );
      } else {
        setVideoSrc(
          "https://res.cloudinary.com/db8e98ggo/video/upload/v1785004602/rita_751_x_1080_px_751_x_1080_px_1920_x_1080_px_cutf4q.mp4",
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
