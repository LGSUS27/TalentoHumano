import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AlertContainer from "./AlertContainer";
import useAlert from "../hooks/useAlert";
import "./Login.css";
import logoOftalmolaser from "../assets/oftalmolaser.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  
  // Hook para manejar alertas
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  // Validación en tiempo real
  const validateUsername = (value) => {
    if (!value.trim()) {
      setUsernameError("El usuario es obligatorio");
      return false;
    }
    if (value.length < 3) {
      setUsernameError("El usuario debe tener al menos 3 caracteres");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("El usuario solo puede contener letras, números y guiones bajos");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError("La contraseña es obligatoria");
      return false;
    }
    if (value.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos antes de enviar
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    if (!isUsernameValid || !isPasswordValid) {
      showError("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsLoading(true);
    const API = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(`${API}/login`, { username, password });

      if (response.data?.success && response.data?.token) {
        // Guardar token con opción de recordar
        if (rememberMe) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("rememberMe", "true");
        } else {
          sessionStorage.setItem("token", response.data.token);
          localStorage.removeItem("rememberMe");
        }
        
        showSuccess("Inicio de sesión exitoso");
        // Pequeño delay para mostrar el mensaje de éxito antes de navegar
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      } else {
        showError(response.data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      if (err.response?.status === 401) {
        showError("Usuario o contraseña incorrectos");
      } else if (err.response?.status === 403) {
        showError("Acceso denegado");
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        showError("No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.");
      } else {
        showError("Error de conexión. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-section">
          <img src={logoOftalmolaser} alt="Oftalmoláser Logo" className="logo" />
        </div>
        
        <div className="login-content">
          <h2 className="login-title">Sistema de Talento Humano</h2>
          <p className="login-subtitle">Accede a tu cuenta para continuar</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={handleUsernameChange}
                onBlur={() => validateUsername(username)}
                required
                className={`login-input ${usernameError ? 'input-error' : ''}`}
              />
              {usernameError && <span className="field-error">{usernameError}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => validatePassword(password)}
                required
                className={`login-input ${passwordError ? 'input-error' : ''}`}
              />
              {passwordError && <span className="field-error">{passwordError}</span>}
            </div>

            <div className="remember-me-group">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-me-checkbox"
                />
                <span className="remember-me-text">Recordarme</span>
              </label>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span>Iniciando sesión...</span>
                  <div className="loading-spinner"></div>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  );
};

export default Login;
