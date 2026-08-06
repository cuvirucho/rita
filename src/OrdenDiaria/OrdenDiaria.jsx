import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import menuDiario from "../MenuDiario/menuDiario";
import Footer from "../HOME/Footer";
import { useAuth } from "../Auth/AuthContext";
import { abrirWhatsApp, urlWhatsApp } from "../lib/whatsapp";
import { WHATSAPP_RITA } from "../UsuarioHome/secciones/deliveryUtils";

const OBJETIVO_LABEL = {
  ganar_musculo: "Ganar masa muscular 💪",
  bajar_peso: "Bajar de peso 🔥",
};

function OrdenDiaria() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, perfil } = useAuth();
  const objetivo = state?.objetivo || "ganar_musculo";
  const tipoInicial = state?.tipo;

  const platos = useMemo(() => menuDiario[objetivo] || [], [objetivo]);

  // Índices seleccionados. Preselecciona el plato desde el que se navegó.
  const [seleccionados, setSeleccionados] = useState(() => {
    const set = new Set();
    const idx = platos.findIndex((p) => p.tipo === tipoInicial);
    if (idx !== -1) set.add(idx);
    return set;
  });
  // Se muestra tras abrir WhatsApp; se limpia si el pedido vuelve a cambiar.
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const togglePlato = (i) => {
    setEnviado(false);
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const seleccionadosArr = useMemo(
    () => platos.filter((_, i) => seleccionados.has(i)),
    [platos, seleccionados],
  );
  const subtotal = seleccionadosArr.reduce((sum, p) => sum + (p.Precio || 0), 0);
  const total = subtotal;
  const cantidad = seleccionadosArr.length;

  const nombre = perfil?.nombre || user?.displayName || "";

  // Texto que le llega a Rita. Se memoriza para reutilizarlo tal cual en el
  // enlace de respaldo, y así el chat siempre lleva el mismo pedido.
  const mensaje = useMemo(() => {
    const lineas = seleccionadosArr.map(
      (p) => `${p.icono} ${p.nombre} — $${p.Precio || 0}`,
    );
    return [
      "Hola Rita 👋 Quiero hacer este pedido:",
      "",
      `Menú: ${OBJETIVO_LABEL[objetivo] || "Menú diario"}`,
      "",
      ...lineas,
      "",
      `Total: $${total}`,
      "",
      nombre
        ? `Soy ${nombre}. ¿Me confirmas disponibilidad?`
        : "¿Me confirmas disponibilidad?",
    ].join("\n");
  }, [seleccionadosArr, objetivo, total, nombre]);

  const enviarPedido = () => {
    if (cantidad === 0) return;
    abrirWhatsApp(WHATSAPP_RITA, mensaje);
    setEnviado(true);
  };

  return (
    <div className="orden-page">
      <img
        src="https://res.cloudinary.com/db8e98ggo/image/upload/v1743140857/gifs_para_apps_gpxkfq.png"
        alt="Rita Fit"
        className="menu-page-logo"
      />

      <div className="orden-container">
        <button className="orden-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="orden-header">
          <span className="section-badge">🛒 Tu pedido</span>
          <h1 className="orden-title">Arma tu pedido del día</h1>
          <p className="orden-subtitle">
            Menú: <strong>{OBJETIVO_LABEL[objetivo] || "Menú diario"}</strong>.
            Agrega o quita los platos que quieras y revisa tu resumen.
          </p>
        </div>

        <div className="orden-layout">
          {/* Lista de platos seleccionables */}
          <div className="orden-list">
            {platos.map((plato, i) => {
              const activo = seleccionados.has(i);
              return (
                <button
                  type="button"
                  key={plato.tipo}
                  className={`orden-item ${activo ? "is-selected" : ""}`}
                  onClick={() => togglePlato(i)}
                  aria-pressed={activo}
                >
                  <span className="orden-item-icon" aria-hidden="true">
                    {plato.icono}
                  </span>
                  <span className="orden-item-info">
                    <span className="orden-item-tipo">{plato.tipo}</span>
                    <span className="orden-item-nombre">{plato.nombre}</span>
                    <span className="orden-item-desc">{plato.descripcion}</span>
                  </span>
                  <span className="orden-item-right">
                    <span className="orden-item-precio">${plato.Precio}</span>
                    <span className="orden-item-check" aria-hidden="true">
                      {activo ? "✓" : "+"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Resumen del pedido */}
          <aside className="orden-summary">
            <h2 className="orden-summary-title">Resumen del pedido</h2>
            <p className="orden-summary-count">
              Platos seleccionados: <strong>{cantidad}</strong>
            </p>

            <div className="orden-summary-lines">
              {seleccionadosArr.length === 0 ? (
                <p className="orden-summary-empty">
                  Aún no has seleccionado ningún plato.
                </p>
              ) : (
                seleccionadosArr.map((p) => (
                  <div className="orden-sum-line" key={p.tipo}>
                    <span className="orden-sum-name">
                      {p.icono} {p.nombre}
                    </span>
                    <span className="orden-sum-price">${p.Precio}</span>
                  </div>
                ))
              )}
            </div>

            <div className="orden-sum-divider" />
            <div className="orden-sum-line">
              <span>Subtotal</span>
              <span className="orden-sum-price">${subtotal}</span>
            </div>
            <div className="orden-sum-total">
              <span>Total a pagar</span>
              <span>${total}</span>
            </div>

            <button
              type="button"
              className="orden-continuar"
              onClick={enviarPedido}
              disabled={cantidad === 0}
            >
              📲 Enviar pedido por WhatsApp
            </button>

            {enviado && (
              <p className="orden-enviado">
                Te abrimos WhatsApp para confirmar tu pedido.{" "}
                <a
                  href={urlWhatsApp(WHATSAPP_RITA, mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ¿No se abrió? Toca aquí
                </a>
              </p>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OrdenDiaria;
