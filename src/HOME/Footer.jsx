import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Rita fit</h3>
          <p>Salud y binestar para todos</p>
        </div>

     

        <div className="footer-section">
          <h4>Redes Sociales</h4>
          <div className="social-icons">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href='https://wa.me/593963200325' target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Rita fit. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
