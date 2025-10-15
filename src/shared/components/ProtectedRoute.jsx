import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Buscar token en localStorage (sesión persistente) o sessionStorage (sesión temporal)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
