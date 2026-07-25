import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import menuDiario from "../MenuDiario/menuDiario";
import Footer from "../HOME/Footer";

const OBJETIVO_LABEL = {
  ganar_musculo: "Ganar masa muscular 💪",
  bajar_peso: "Bajar de peso 🔥",
};

function OrdenDiaria() {
  const navigate = useNavigate();
  const { state } = useLocation();
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
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const togglePlato = (i) => {
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

  const seleccionadosArr = platos.filter((_, i) => seleccionados.has(i));
  const subtotal = seleccionadosArr.reduce((sum, p) => sum + (p.Precio || 0), 0);
  const total = subtotal;
  const cantidad = seleccionadosArr.length;

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
              onClick={() => setModalOpen(true)}
              disabled={cantidad === 0}
            >
              Continuar
            </button>
          </aside>
        </div>
      </div>

      {/* Modal método de pago */}
      {modalOpen && (
        <div
          className="orden-modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div className="orden-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="orden-modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <h2 className="orden-modal-title">Elige tu método de pago</h2>
            <div className="orden-pay-grid">
              <button type="button" className="orden-pay-btn">
                <span className="orden-pay-icon" aria-hidden="true">
                  💵
                </span>
                Transferencia
              </button>
              <button type="button" className="orden-pay-btn">
                <span className="orden-pay-icon" aria-hidden="true">
                  💳
                </span>
                Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default OrdenDiaria;
