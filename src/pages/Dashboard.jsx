import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InformacionPersonal from "./InformacionPersonal";
import Formacion from "./Formacion";
import Experiencia from "./Experiencia";
import OtrosDocumentos from "./OtrosDocumentos";
import AlertContainer from "../components/AlertContainer";
import useAlert from "../hooks/useAlert";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Hook para manejar alertas
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  // Estado del formulario (incluye cargo)
  const [formData, setFormData] = useState({
    nombre: "",
    numeroIdentificacion: "",
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
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3000/empleados", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Datos de empleados recibidos:", data.empleados);
        console.log("Primer empleado:", data.empleados[0]);
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

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    // Pre-llenar el formulario con los datos del empleado
    setFormData({
      nombre: employee.nombre || "",
      numeroIdentificacion: employee.numeroidentificacion || "",
      contrato: employee.contrato || "",
      fecha_inicio: employee.fecha_inicio || "",
      fecha_fin: employee.fecha_fin || "",
      sueldo: employee.sueldo || "",
      tipo_contrato: employee.tipo_contrato || "",
      cargo: employee.cargo || "",
    });
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
    // Limpiar formulario
    setFormData({
      nombre: "",
      numeroIdentificacion: "",
      contrato: "",
      fecha_inicio: "",
      fecha_fin: "",
      sueldo: "",
      tipo_contrato: "",
      cargo: "",
    });
  };

  const openDeleteConfirm = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setSelectedEmployee(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir a mayúsculas automáticamente para el campo contrato
    if (name === 'contrato') {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } 
    // Capitalizar automáticamente las iniciales para el campo nombre
    else if (name === 'nombre') {
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

  const handleKeyDown = (e) => {
    const { name } = e.target;
    
    // Para campos de nombres, solo permitir letras y espacios
    if (name === 'nombre') {
      const allowedChars = /[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/;
      if (!allowedChars.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("Token:", token);
    console.log("Token length:", token ? token.length : 0);
    console.log("Form data:", formData);
    
    if (!token) {
      showError("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
      return;
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

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

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
          numeroIdentificacion: "",
          contrato: "",
          fecha_inicio: "",
          fecha_fin: "",
          sueldo: "",
          tipo_contrato: "",
          cargo: "",
        });
        closeModal();
        showSuccess("Empleado creado exitosamente");
      } else {
        // Obtener el mensaje de error específico del backend
        console.log("Error response status:", response.status);
        
        // Manejar errores de autenticación específicamente
        if (response.status === 401) {
          showError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          // Opcional: redirigir al login
          // window.location.href = '/login';
          return;
        }
        
        if (response.status === 403) {
          showError("No tienes permisos para realizar esta acción.");
          return;
        }
        
        try {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          const errorMessage = errorData?.message || "Error al crear el empleado";
          showError(errorMessage);
        } catch (parseError) {
          console.log("Parse error:", parseError);
          // Si no se puede parsear el JSON, mostrar mensaje genérico con código de estado
          showError(`Error al crear el empleado (${response.status})`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);
      
      // Determinar el tipo de error y mostrar mensaje específico
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError("Error de conexión: No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.");
      } else if (error.name === 'AbortError') {
        showError("La petición fue cancelada");
      } else {
        showError(`Error inesperado: ${error.message}`);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (!token) {
      showError("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
      return;
    }

    if (!selectedEmployee) {
      showError("No se ha seleccionado un empleado para editar.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/empleados/${selectedEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        
        // Actualizar la lista de empleados
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmployee.id ? updatedEmployee.empleado : emp
          )
        );

        closeEditModal();
        showSuccess("Empleado actualizado exitosamente");
      } else {
        if (response.status === 401) {
          showError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          return;
        }
        
        if (response.status === 403) {
          showError("No tienes permisos para realizar esta acción.");
          return;
        }
        
        try {
          const errorData = await response.json();
          const errorMessage = errorData?.message || "Error al actualizar el empleado";
          showError(errorMessage);
        } catch (parseError) {
          showError(`Error al actualizar el empleado (${response.status})`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError("Error de conexión: No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.");
      } else if (error.name === 'AbortError') {
        showError("La petición fue cancelada");
      } else {
        showError(`Error inesperado: ${error.message}`);
      }
    }
  };

  const handleDeleteEmployee = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (!token) {
      showError("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
      return;
    }

    if (!selectedEmployee) {
      showError("No se ha seleccionado un empleado para eliminar.");
      return;
    }

    console.log("Intentando eliminar empleado:", selectedEmployee);
    console.log("ID del empleado:", selectedEmployee.id);

    try {
      const response = await fetch(`http://localhost:3000/empleados/${selectedEmployee.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("Empleado eliminado exitosamente:", result);
        
        // Remover el empleado de la lista
        setEmployees((prev) => 
          prev.filter((emp) => emp.id !== selectedEmployee.id)
        );

        closeDeleteConfirm();
        showSuccess("Empleado eliminado exitosamente");
      } else {
        if (response.status === 401) {
          showError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          return;
        }
        
        if (response.status === 403) {
          showError("No tienes permisos para realizar esta acción.");
          return;
        }
        
        try {
          const errorData = await response.json();
          const errorMessage = errorData?.message || "Error al eliminar el empleado";
          showError(errorMessage);
        } catch (parseError) {
          showError(`Error al eliminar el empleado (${response.status})`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError("Error de conexión: No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.");
      } else if (error.name === 'AbortError') {
        showError("La petición fue cancelada");
      } else {
        showError(`Error inesperado: ${error.message}`);
      }
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
          <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </header>

      <main className="dashboard-main">
        <div className="table-actions">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <button className="crear-btn" onClick={openModal}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Crear nuevo empleado</span>
          </button>
        </div>

        <div className="employee-table-container">
          <div className="employee-table-wrapper">
            <table className="employee-table tabla-empleados">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
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
                  <td>{emp.numeroidentificacion || "-"}</td>
                  <td>{emp.contrato}</td>
                  <td>{formatDate(emp.fecha_inicio)}</td>
                  <td>{formatDate(emp.fecha_fin)}</td>
                  <td>{formatMoney(emp.sueldo)}</td>
                  <td>{emp.tipo_contrato}</td>
                  <td>{emp.cargo || "-"}</td>
                  <td className="col-acciones">
                    <div className="acciones">
                      <button className="info-btn" onClick={() => openInfoModal(emp)} title="Información Personal">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>Info Personal</span>
                      </button>
                      <button className="formacion-btn" onClick={() => openFormacionModal(emp)} title="Formación Académica">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <span>Formación</span>
                      </button>
                      <button className="experiencia-btn" onClick={() => openExperienciaModal(emp)} title="Experiencia Laboral">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        <span>Experiencia</span>
                      </button>
                      <button className="otros-documentos-btn" onClick={() => openOtrosDocumentosModal(emp)} title="Otros Documentos">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        <span>Documentos</span>
                      </button>
                      <button className="edit-btn" onClick={() => openEditModal(emp)} title="Editar Empleado">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button className="delete-btn" onClick={() => openDeleteConfirm(emp)} title="Eliminar Empleado">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        <span>Eliminar</span>
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
                onKeyDown={handleKeyDown}
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
                title="Solo letras y espacios"
                required
              />
              </label>
              <label className="field">
                <span className="field-title">Número de identificación *</span>
                <input
                  type="text"
                  name="numeroIdentificacion"
                  placeholder="Número de identificación"
                  value={formData.numeroIdentificacion}
                  onChange={handleInputChange}
                  pattern="[0-9]{6,12}"
                  title="Solo números, entre 6 y 12 dígitos"
                  onKeyDown={(e) => {
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
                  pattern="[A-Z0-9\-]+"
                  title="Solo letras, números y guiones (se convierten automáticamente a mayúsculas)"
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
                onKeyDown={(e) => {
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
                <select
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                required
                >
                  <option value="" disabled>Seleccione un cargo</option>
                  <option value="Asesor">Asesor</option>
                  <option value="Agente de call center">Agente de call center</option>
                  <option value="Analista de facturación y contratación">Analista de facturación y contratación</option>
                  <option value="Aprendiz">Aprendiz</option>
                  <option value="Asistente de facturación">Asistente de facturación</option>
                  <option value="Auxiliar administrativo">Auxiliar administrativo</option>
                  <option value="Auxiliar contable y financiero">Auxiliar contable y financiero</option>
                  <option value="Auxiliar contable y Tesorería">Auxiliar contable y Tesorería</option>
                  <option value="Auxiliar de archivo">Auxiliar de archivo</option>
                  <option value="Auxiliar de droguería">Auxiliar de droguería</option>
                  <option value="Auxiliar de enfermería">Auxiliar de enfermería</option>
                  <option value="Auxiliar de farmacia">Auxiliar de farmacia</option>
                  <option value="Auxiliar de óptica">Auxiliar de óptica</option>
                  <option value="Auxiliar de servicios generales">Auxiliar de servicios generales</option>
                  <option value="Auxiliar Siau">Auxiliar Siau</option>
                  <option value="Coordinador asistencial">Coordinador asistencial</option>
                  <option value="Coordinador contable y financiero">Coordinador contable y financiero</option>
                  <option value="Coordinador de facturación y contratación">Coordinador de facturación y contratación</option>
                  <option value="Coordinador administrativo">Coordinador administrativo</option>
                  <option value="Coordinador de tics">Coordinador de tics</option>
                  <option value="Cuidador">Cuidador</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Gestor de servicios">Gestor de servicios</option>
                  <option value="Gestor de servicios empresariales">Gestor de servicios empresariales</option>
                  <option value="Instrumentador quirúrgico">Instrumentador quirúrgico</option>
                  <option value="Jefe de cirugía">Jefe de cirugía</option>
                  <option value="Jefe de talento humano">Jefe de talento humano</option>
                  <option value="Líder de apoyo diagnóstico y terapéutico">Líder de apoyo diagnóstico y terapéutico</option>
                  <option value="Médico especialista">Médico especialista</option>
                  <option value="Optómetra">Optómetra</option>
                  <option value="Orientador">Orientador</option>
                  <option value="Regente de farmacia">Regente de farmacia</option>
                  <option value="Subgerente administrativo">Subgerente administrativo</option>
                  <option value="Supervisor call center">Supervisor call center</option>
                </select>
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

      {/* Modal de edición */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar empleado</h3>

            <form className="empleado-form" onSubmit={handleEditSubmit}>
              <label className="field">
                <span className="field-title">Nombre completo *</span>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
                title="Solo letras y espacios"
                required
              />
              </label>
              <label className="field">
                <span className="field-title">Número de identificación *</span>
                <input
                  type="text"
                  name="numeroIdentificacion"
                  placeholder="Número de identificación"
                  value={formData.numeroIdentificacion}
                  onChange={handleInputChange}
                  pattern="[0-9]{6,12}"
                  title="Solo números, entre 6 y 12 dígitos"
                  onKeyDown={(e) => {
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
                  pattern="[A-Z0-9\-]+"
                  title="Solo letras, números y guiones (se convierten automáticamente a mayúsculas)"
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
                onKeyDown={(e) => {
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
                <select
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                required
                >
                  <option value="" disabled>Seleccione un cargo</option>
                  <option value="Asesor">Asesor</option>
                  <option value="Agente de call center">Agente de call center</option>
                  <option value="Analista de facturación y contratación">Analista de facturación y contratación</option>
                  <option value="Aprendiz">Aprendiz</option>
                  <option value="Asistente de facturación">Asistente de facturación</option>
                  <option value="Auxiliar administrativo">Auxiliar administrativo</option>
                  <option value="Auxiliar contable y financiero">Auxiliar contable y financiero</option>
                  <option value="Auxiliar contable y Tesorería">Auxiliar contable y Tesorería</option>
                  <option value="Auxiliar de archivo">Auxiliar de archivo</option>
                  <option value="Auxiliar de droguería">Auxiliar de droguería</option>
                  <option value="Auxiliar de enfermería">Auxiliar de enfermería</option>
                  <option value="Auxiliar de farmacia">Auxiliar de farmacia</option>
                  <option value="Auxiliar de óptica">Auxiliar de óptica</option>
                  <option value="Auxiliar de servicios generales">Auxiliar de servicios generales</option>
                  <option value="Auxiliar Siau">Auxiliar Siau</option>
                  <option value="Coordinador asistencial">Coordinador asistencial</option>
                  <option value="Coordinador contable y financiero">Coordinador contable y financiero</option>
                  <option value="Coordinador de facturación y contratación">Coordinador de facturación y contratación</option>
                  <option value="Coordinador administrativo">Coordinador administrativo</option>
                  <option value="Coordinador de tics">Coordinador de tics</option>
                  <option value="Cuidador">Cuidador</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Gestor de servicios">Gestor de servicios</option>
                  <option value="Gestor de servicios empresariales">Gestor de servicios empresariales</option>
                  <option value="Instrumentador quirúrgico">Instrumentador quirúrgico</option>
                  <option value="Jefe de cirugía">Jefe de cirugía</option>
                  <option value="Jefe de talento humano">Jefe de talento humano</option>
                  <option value="Líder de apoyo diagnóstico y terapéutico">Líder de apoyo diagnóstico y terapéutico</option>
                  <option value="Médico especialista">Médico especialista</option>
                  <option value="Optómetra">Optómetra</option>
                  <option value="Orientador">Orientador</option>
                  <option value="Regente de farmacia">Regente de farmacia</option>
                  <option value="Subgerente administrativo">Subgerente administrativo</option>
                  <option value="Supervisor call center">Supervisor call center</option>
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeEditModal}>
                  Cancelar
                </button>
                <button type="submit" className="guardar-btn">
                  Actualizar empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && selectedEmployee && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro de que deseas eliminar al empleado <strong>{selectedEmployee.nombre}</strong>?
            </p>
            <p className="warning-text">
              Esta acción no se puede deshacer y se eliminarán todos los datos asociados al empleado.
            </p>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeDeleteConfirm}>
                Cancelar
              </button>
              <button type="button" className="delete-confirm-btn" onClick={handleDeleteEmployee}>
                Eliminar empleado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  );
};

export default Dashboard;