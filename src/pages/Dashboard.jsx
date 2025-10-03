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
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    console.log("Token length:", token ? token.length : 0);
    console.log("Form data:", formData);
    
    if (!token) {
      showError("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
      return;
    }

    // TEMPORAL: Comentar validaciones del frontend para probar mensajes del backend
    /*
    // Validaciones específicas
    if (!formData.nombre || formData.nombre.trim() === "") {
      showError("El nombre es obligatorio");
      return;
    }

    // Validar nombres (solo letras y espacios)
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombresRegex.test(formData.nombre)) {
      showError("El nombre solo puede contener letras y espacios");
      return;
    }

    if (!formData.numeroIdentificacion || formData.numeroIdentificacion.trim() === "") {
      showError("El número de identificación es obligatorio");
      return;
    }

    // Validar formato de número de identificación (solo números, entre 6 y 12 dígitos)
    const cedulaRegex = /^\d{6,12}$/;
    if (!cedulaRegex.test(formData.numeroIdentificacion)) {
      showError("El número de identificación debe contener solo números (6-12 dígitos)");
      return;
    }

    if (!formData.contrato || formData.contrato.trim() === "") {
      showError("El número de contrato es obligatorio");
      return;
    }
    */

    /*
    if (!formData.fecha_inicio) {
      showError("La fecha de inicio es obligatoria");
      return;
    }

    if (!formData.fecha_fin) {
      showError("La fecha de fin es obligatoria");
      return;
    }

    // Validar fechas
    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaFin = new Date(formData.fecha_fin);

    // La fecha de inicio no puede ser anterior a 2002
    const fechaMinimaInicio = new Date('2002-01-01');
    if (fechaInicio < fechaMinimaInicio) {
      showError("La fecha de inicio no puede ser anterior a 2002");
      return;
    }

    // La fecha de fin solo debe ser posterior a la fecha de inicio
    if (fechaInicio > fechaFin) {
      showError("La fecha de inicio no puede ser posterior a la fecha de fin");
      return;
    }

    if (!formData.sueldo || formData.sueldo <= 0) {
      showError("El sueldo debe ser mayor a 0");
      return;
    }

    if (!formData.tipo_contrato || formData.tipo_contrato === "") {
      showError("Debe seleccionar un tipo de contrato");
      return;
    }

    if (!formData.cargo || formData.cargo.trim() === "") {
      showError("El cargo es obligatorio");
      return;
    }
    */

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
                  <td>{emp.numeroIdentificacion}</td>
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

      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  );
};

export default Dashboard;