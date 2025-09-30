import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import logoOftalmolaser from "../assets/oftalmolaser.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const API = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(`${API}/login`, { username, password });

      if (response.data?.success && response.data?.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      setError("No se pudo conectar con el servidor");
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
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="login-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>

            <button type="submit" className="login-button">
              <span>Iniciar Sesión</span>
              <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
