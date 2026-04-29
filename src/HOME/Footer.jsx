const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>Rita Fit</h3>
          <p>
            Nutrición inteligente potenciada por IA. Planes de comida
            personalizados, delivery a tu puerta y seguimiento nutricional
            completo.
          </p>
        </div>

        <div className="footer-links">
          <h4>Navegación</h4>
          <ul>
            <li>
              <a href="#inicio">Inicio</a>
            </li>
            <li>
              <a href="#como-funciona">Cómo Funciona</a>
            </li>
            <li>
              <a href="#planes">Planes</a>
            </li>
            <li>
              <a href="#testimonios">Testimonios</a>
            </li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Redes Sociales</h4>
          <div className="footer-social">
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              🎵 TikTok
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61577464739446"
              target="_blank"
              rel="noopener noreferrer"
            >
              📘 Facebook
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              📸 Instagram
            </a>
            <a
              href="https://wa.me/593963200325"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Rita Fit. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
