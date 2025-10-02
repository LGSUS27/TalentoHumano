import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InformacionPersonal from "./InformacionPersonal";
import Formacion from "./Formacion";
import Experiencia from "./Experiencia";
import OtrosDocumentos from "./OtrosDocumentos";
import logoOftalmolaser from "../assets/logoblanco.png";
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
    setSelectedEmployee(null); // Limpiar empleado seleccionado
    navigate("/");
  };

  const toggleMenu = () => setShowMenu((s) => !s);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openInfoModal = (employee) => {
    // Si es un empleado diferente, limpiamos el anterior
    if (selectedEmployee && selectedEmployee.id !== employee.id) {
      setSelectedEmployee(null);
    }
    setSelectedEmployee(employee);
    setShowInfoModal(true);
  };
  const closeInfoModal = () => {
    setShowInfoModal(false);
    // No reseteamos selectedEmployee para mantener los datos
  };

  const openFormacionModal = (employee) => {
    // Si es un empleado diferente, limpiamos el anterior
    if (selectedEmployee && selectedEmployee.id !== employee.id) {
      setSelectedEmployee(null);
    }
    setSelectedEmployee(employee);
    setShowFormacionModal(true);
  };
  const closeFormacionModal = () => {
    setShowFormacionModal(false);
    // No reseteamos selectedEmployee para mantener los datos
  };

  const openExperienciaModal = (employee) => {
    // Si es un empleado diferente, limpiamos el anterior
    if (selectedEmployee && selectedEmployee.id !== employee.id) {
      setSelectedEmployee(null);
    }
    setSelectedEmployee(employee);
    setShowExperienciaModal(true);
  };
  const closeExperienciaModal = () => {
    setShowExperienciaModal(false);
    // No reseteamos selectedEmployee para mantener los datos
  };

  const openOtrosDocumentosModal = (employee) => {
    // Si es un empleado diferente, limpiamos el anterior
    if (selectedEmployee && selectedEmployee.id !== employee.id) {
      setSelectedEmployee(null);
    }
    setSelectedEmployee(employee);
    setShowOtrosDocumentosModal(true);
  };
  const closeOtrosDocumentosModal = () => {
    setShowOtrosDocumentosModal(false);
    // No reseteamos selectedEmployee para mantener los datos
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Capitalizar automáticamente la primera letra del cargo
    if (name === 'cargo' && value.length > 0) {
      const palabras = value.split(' ');
      const palabrasCapitalizadas = palabras.map(palabra => {
        if (palabra.length > 0) {
          return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        }
        return palabra;
      });
      setFormData((prev) => ({ ...prev, [name]: palabrasCapitalizadas.join(' ') }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Validaciones específicas
    if (!formData.nombre || formData.nombre.trim() === "") {
      alert("Error: El nombre es obligatorio");
      return;
    }

    // Validar nombres (solo letras y espacios)
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombresRegex.test(formData.nombre)) {
      alert("Error: El nombre solo puede contener letras y espacios");
      return;
    }

    if (!formData.cedula || formData.cedula.trim() === "") {
      alert("Error: La cédula es obligatoria");
      return;
    }

    // Validar formato de cédula (solo números, entre 6 y 12 dígitos)
    const cedulaRegex = /^\d{6,12}$/;
    if (!cedulaRegex.test(formData.cedula)) {
      alert("Error: La cédula debe contener solo números (6-12 dígitos)");
      return;
    }

    if (!formData.contrato || formData.contrato.trim() === "") {
      alert("Error: El número de contrato es obligatorio");
      return;
    }

    if (!formData.fecha_inicio) {
      alert("Error: La fecha de inicio es obligatoria");
      return;
    }

    if (!formData.fecha_fin) {
      alert("Error: La fecha de fin es obligatoria");
      return;
    }

    // Validar fechas
    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaFin = new Date(formData.fecha_fin);

    // La fecha de inicio no puede ser anterior a 2002
    const fechaMinimaInicio = new Date('2002-01-01');
    if (fechaInicio < fechaMinimaInicio) {
      alert("Error: La fecha de inicio no puede ser anterior a 2002");
      return;
    }

    // La fecha de fin solo debe ser posterior a la fecha de inicio
    if (fechaInicio > fechaFin) {
      alert("Error: La fecha de inicio no puede ser posterior a la fecha de fin");
      return;
    }

    if (!formData.sueldo || formData.sueldo <= 0) {
      alert("Error: El sueldo debe ser mayor a 0");
      return;
    }

    if (!formData.tipo_contrato || formData.tipo_contrato === "") {
      alert("Error: Debe seleccionar un tipo de contrato");
      return;
    }

    if (!formData.cargo || formData.cargo.trim() === "") {
      alert("Error: El cargo es obligatorio");
      return;
    }

    // Validar cargo (solo letras, espacios y algunos caracteres especiales)
    const cargoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/;
    if (!cargoRegex.test(formData.cargo)) {
      alert("Error: El cargo solo puede contener letras, espacios, guiones y puntos");
      return;
    }

    // Validar que la primera letra del cargo sea mayúscula
    if (formData.cargo && formData.cargo.trim() !== "") {
      const primeraLetra = formData.cargo.trim().charAt(0);
      if (primeraLetra !== primeraLetra.toUpperCase() || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(primeraLetra)) {
        alert("Error: El cargo debe comenzar con una letra mayúscula");
        return;
      }
    }

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

        // Usar SOLO lo que devuelve el backend (no usar || formData)
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
        <div className="header-left">
          <img
            src={logoOftalmolaser}
            alt="Oftalmoláser Logo"
            className="header-logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="dashboard-title">Sistema de Talento Humano</div>
        </div>
        <button className="user-button" onClick={handleLogout}>
          <span className="user-icon"></span>
          Cerrar sesión
        </button>
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
          <div className="employee-table-wrapper">
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
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Crear nuevo empleado</h3>

            <form className="empleado-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field-title">Nombre completo *</span>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
                title="Solo letras y espacios"
                required
              />
              </label>
              <label className="field">
                <span className="field-title">Cédula *</span>
                <input
                  type="text"
                  name="cedula"
                  placeholder="Cédula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  pattern="[0-9]{6,12}"
                  title="Solo números, entre 6 y 12 dígitos"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </label>
              <label className="field">
                <span className="field-title">No. Contrato *</span>
                <input
                  type="text"
                  name="contrato"
                  placeholder="No. Contrato"
                  value={formData.contrato}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </label>

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

              <label className="field">
                <span className="field-title">Sueldo *</span>
              <input
                type="number"
                name="sueldo"
                placeholder="Sueldo"
                value={formData.sueldo}
                onChange={handleInputChange}
                min="1"
                title="Solo números, debe ser mayor a 0"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
                required
              />
              </label>
              <label className="field">
                <span className="field-title">Tipo de contrato *</span>
                <select
                  name="tipo_contrato"
                  value={formData.tipo_contrato}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Seleccione tipo de contrato</option>
                  <option value="Prestación de servicios">Prestación de servicios</option>
                  <option value="Laboral">Laboral</option>
                  <option value="De aprendizaje">De aprendizaje</option>
                </select>
              </label>
              <label className="field">
                <span className="field-title">Cargo *</span>
              <input
                type="text"
                name="cargo"
                placeholder="Cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+"
                title="Solo letras, espacios, guiones y puntos"
                required
              />
              </label>

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