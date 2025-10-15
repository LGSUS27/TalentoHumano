import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import EmployeeDetails from "./pages/EmployeeDetails";
import Evaluaciones from "./pages/Evaluaciones";
import ProtectedRoute from "./shared/components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empleado/:id"
          element={
            <ProtectedRoute>
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluaciones"
          element={
            <ProtectedRoute>
              <Evaluaciones />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
