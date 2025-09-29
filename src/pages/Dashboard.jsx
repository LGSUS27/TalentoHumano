import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InformacionPersonal from "./InformacionPersonal";
import Formacion from "./Formacion";
import Experiencia from "./Experiencia";
import OtrosDocumentos from "./OtrosDocumentos";
import "./Dashboard.css";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showFormacionModal, setShowFormacionModal] = useState(false);
  const [showExperienciaModal, setShowExperienciaModal] = useState(false);
  const [showOtrosDocumentosModal, setShowOtrosDocumentosModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado del formulario (incluye cargo)
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    contrato: "",
    fecha_inicio: "",
    fecha_fin: "",
    sueldo: "",
    tipo_contrato: "",
    cargo: "",
  });

  const navigate = useNavigate();

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d) ? "-" : d.toLocaleDateString();
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const n = Number(value);
    if (isNaN(n)) return String(value);
    try {
      return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
    } catch {
      return `$${n.toLocaleString()}`;
    }
  };

  const loadEmployees = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3000/empleados", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.empleados);
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMenu = () => setShowMenu((s) => !s);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openInfoModal = (employee) => {
    setSelectedEmployee(employee);
    setShowInfoModal(true);
  };
  const closeInfoModal = () => {
    setSelectedEmployee(null);
    setShowInfoModal(false);
  };

  const openFormacionModal = (employee) => {
    setSelectedEmployee(employee);
    setShowFormacionModal(true);
  };
  const closeFormacionModal = () => {
    setSelectedEmployee(null);
    setShowFormacionModal(false);
  };

  const openExperienciaModal = (employee) => {
    setSelectedEmployee(employee);
    setShowExperienciaModal(true);
  };
  const closeExperienciaModal = () => {
    setSelectedEmployee(null);
    setShowExperienciaModal(false);
  };

  const openOtrosDocumentosModal = (employee) => {
    setSelectedEmployee(employee);
    setShowOtrosDocumentosModal(true);
  };
  const closeOtrosDocumentosModal = () => {
    setSelectedEmployee(null);
    setShowOtrosDocumentosModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3000/empleados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newEmployee = await response.json();

        // ✅ Usar SOLO lo que devuelve el backend (no usar || formData)
        if (newEmployee?.empleado) {
          setEmployees((prev) => [...prev, newEmployee.empleado]);
        } else {
          // Si por algún motivo no viene el objeto, recargar lista desde el servidor
          await loadEmployees();
        }

        // Limpiar formulario y cerrar
        setFormData({
          nombre: "",
          cedula: "",
          contrato: "",
          fecha_inicio: "",
          fecha_fin: "",
          sueldo: "",
          tipo_contrato: "",
          cargo: "",
        });
        closeModal();
      } else {
        alert("Error al crear el empleado");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error en la comunicación con el servidor");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    Object.values(emp).some((value) =>
      String(value ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">OFTALMOLASER SOCIEDAD DE CIRUGÍA DEL HUILA</div>
        <button className="user-button" onClick={toggleMenu}>
          admin <span className="arrow-icon">▼</span>
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </header>

      <main className="dashboard-main">
        <div className="table-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="crear-btn" onClick={openModal}>
            Crear nuevo empleado
          </button>
        </div>

        <div className="employee-table-container">
          <table className="employee-table tabla-empleados">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>N° Id</th>
                <th>N° Contrato</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Sueldo</th>
                <th>T. Contrato</th>
                <th>Cargo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => (
                <tr key={emp.id ?? index}>
                  <td className="col-nombre">
                    <span className="truncate" title={emp.nombre}>
                      {emp.nombre}
                    </span>
                  </td>
                  <td>{emp.cedula}</td>
                  <td>{emp.contrato}</td>
                  <td>{formatDate(emp.fecha_inicio)}</td>
                  <td>{formatDate(emp.fecha_fin)}</td>
                  <td>{formatMoney(emp.sueldo)}</td>
                  <td>{emp.tipo_contrato}</td>
                  <td>{emp.cargo || "-"}</td>
                  <td className="col-acciones">
                    <div className="acciones">
                      <button className="info-btn" onClick={() => openInfoModal(emp)}>
                        Información Personal
                      </button>
                      <button className="formacion-btn" onClick={() => openFormacionModal(emp)}>
                        Formación
                      </button>
                      <button className="experiencia-btn" onClick={() => openExperienciaModal(emp)}>
                        Experiencia
                      </button>
                      <button className="otros-documentos-btn" onClick={() => openOtrosDocumentosModal(emp)}>
                        Otros Documentos
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Crear nuevo empleado</h3>

            <form className="empleado-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="cedula"
                placeholder="Cédula"
                value={formData.cedula}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="contrato"
                placeholder="No. Contrato"
                value={formData.contrato}
                onChange={handleInputChange}
                required
              />

              {/* 👉 Etiqueta visible: Fecha inicio */}
              <label className="field">
                <span className="field-title">Fecha inicio</span>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleInputChange}
                  aria-label="Fecha inicio"
                  required
                />
              </label>

              {/* 👉 Etiqueta visible: Fecha fin */}
              <label className="field">
                <span className="field-title">Fecha fin</span>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleInputChange}
                  aria-label="Fecha fin"
                  min={formData.fecha_inicio || undefined}
                  required
                />
              </label>

              <input
                type="number"
                name="sueldo"
                placeholder="Sueldo"
                value={formData.sueldo}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="tipo_contrato"
                placeholder="Tipo de contrato"
                value={formData.tipo_contrato}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="cargo"
                placeholder="Cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                required
              />

              <button type="submit" className="guardar-btn">
                Guardar empleado
              </button>
            </form>
          </div>
        </div>
      )}

      {showInfoModal && selectedEmployee && (
        <InformacionPersonal empleado={selectedEmployee} onClose={closeInfoModal} />
      )}

      {showFormacionModal && selectedEmployee && (
        <Formacion empleado={selectedEmployee} onClose={closeFormacionModal} />
      )}

      {showExperienciaModal && selectedEmployee && (
        <Experiencia empleado={selectedEmployee} onClose={closeExperienciaModal} />
      )}

      {showOtrosDocumentosModal && selectedEmployee && (
        <OtrosDocumentos empleado={selectedEmployee} onClose={closeOtrosDocumentosModal} />
      )}
    </div>
  );
};

export default Dashboard;