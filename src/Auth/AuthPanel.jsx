import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../FIRBAS/Firebase";

const mensajesError = {
  "auth/email-already-in-use": "Este correo ya está registrado. Inicia sesión.",
  "auth/invalid-email": "El correo electrónico no es válido.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "No existe una cuenta con este correo.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/too-many-requests":
    "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  "auth/operation-not-allowed":
    "El inicio de sesión con correo no está habilitado.",
  "auth/network-request-failed":
    "Error de conexión. Revisa tu internet e inténtalo de nuevo.",
};

const traducirError = (codigo) =>
  mensajesError[codigo] || "Ocurrió un error. Inténtalo de nuevo.";

const AuthPanel = () => {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError("");
    setEnviando(true);

    try {
      if (modo === "registro") {
        if (!nombre.trim()) {
          setError("Ingresa tu nombre completo.");
          setEnviando(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(
          auth,
          correo.trim(),
          password,
        );
        await setDoc(doc(db, "UsuariosActivos", cred.user.uid), {
          uid: cred.user.uid,
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.trim(),
          plan: "free",
          fechaRegistro: serverTimestamp(),
        });
        try {
          await updateProfile(cred.user, { displayName: nombre.trim() });
        } catch {
          // displayName es opcional; no bloquear el registro si falla
        }
      } else {
        await signInWithEmailAndPassword(auth, correo.trim(), password);
      }
      // Éxito: onAuthStateChanged actualiza el estado y RootScreen muestra UsuarioHome.
    } catch (err) {
      setError(traducirError(err?.code));
      setEnviando(false);
    }
  };

  const esRegistro = modo === "registro";

  return (
    <div className="auth-card">
      <div className="auth-card-glow" />

      <div className="auth-header">
        <h2 className="auth-title">
          {esRegistro ? "Crea tu cuenta" : "Bienvenido de nuevo"}
        </h2>
        <p className="auth-subtitle">
          {esRegistro
            ? "Regístrate gratis y empieza a comer mejor con Rita Fit."
            : "Inicia sesión para continuar con tu plan."}
        </p>
      </div>

      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!esRegistro}
          className={`auth-tab ${!esRegistro ? "auth-tab-active" : ""}`}
          onClick={() => cambiarModo("login")}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={esRegistro}
          className={`auth-tab ${esRegistro ? "auth-tab-active" : ""}`}
          onClick={() => cambiarModo("registro")}
        >
          Crear cuenta
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {esRegistro && (
          <div className="auth-input-group">
            <span className="auth-input-icon">👤</span>
            <input
              type="text"
              className="auth-input"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>
        )}

        <div className="auth-input-group">
          <span className="auth-input-icon">✉️</span>
          <input
            type="email"
            className="auth-input"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            maxLength={200}
            required
          />
        </div>

        {esRegistro && (
          <div className="auth-input-group">
            <span className="auth-input-icon">📱</span>
            <input
              type="tel"
              className="auth-input"
              placeholder="Número de teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              autoComplete="tel"
              maxLength={20}
              required
            />
          </div>
        )}

        <div className="auth-input-group">
          <span className="auth-input-icon">🔒</span>
          <input
            type={verPassword ? "text" : "password"}
            className="auth-input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={esRegistro ? "new-password" : "current-password"}
            minLength={6}
            required
          />
          <button
            type="button"
            className="auth-input-toggle"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {verPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={enviando}>
          {enviando
            ? "Procesando..."
            : esRegistro
              ? "Crear cuenta"
              : "Iniciar sesión"}
        </button>
      </form>

      <p className="auth-switch">
        {esRegistro ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => cambiarModo("login")}
            >
              Inicia sesión
            </button>
          </>
        ) : (
          <>
            ¿Aún no tienes cuenta?{" "}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => cambiarModo("registro")}
            >
              Créala gratis
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthPanel;
