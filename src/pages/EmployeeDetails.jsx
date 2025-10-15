import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import empleadosService from "../services/empleados.service";
import InformacionPersonal from "./InformacionPersonal";
import Formacion from "./Formacion";
import Experiencia from "./Experiencia";
import OtrosDocumentos from "./OtrosDocumentos";
import Evaluaciones from "./Evaluaciones";
import AlertContainer from "../shared/components/AlertContainer";
import useAlert from "../shared/hooks/useAlert";
import logoOftalmolaser from "../assets/logoblanco.png";
import "./EmployeeDetails.css";

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [employeePhoto, setEmployeePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    numeroIdentificacion: "",
    contrato: "",
    fecha_inicio: "",
    fecha_fin: "",
    sueldo: "",
    tipo_contrato: "",
    cargo: ""
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Hook para manejar alertas
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  useEffect(() => {
    const fetchEmployee = async () => {
      console.log('Cargando empleado con ID:', id);
      try {
        const response = await empleadosService.getById(id);
        console.log('Respuesta completa del servicio:', response);
        
        // El servicio retorna { data: { empleado: {...} } }
        if (response?.data?.empleado) {
          console.log('Empleado encontrado:', response.data.empleado);
          const emp = response.data.empleado;
          setEmployee(emp);
          setError(null);
          
          // Cargar datos en el formulario de edición
          setEditFormData({
            nombre: emp.nombre || "",
            numeroIdentificacion: emp.numeroidentificacion || emp.numeroIdentificacion || "",
            contrato: emp.contrato || "",
            fecha_inicio: emp.fecha_inicio ? emp.fecha_inicio.split('T')[0] : "",
            fecha_fin: emp.fecha_fin ? emp.fecha_fin.split('T')[0] : "",
            sueldo: emp.sueldo || "",
            tipo_contrato: emp.tipo_contrato || emp.tipoContrato || "",
            cargo: emp.cargo || ""
          });
          
          // Cargar la foto del empleado de información personal
          fetchEmployeePhoto(id);
        } else if (response?.empleado) {
          console.log('Empleado encontrado (formato alternativo):', response.empleado);
          const emp = response.empleado;
          setEmployee(emp);
          setError(null);
          
          // Cargar datos en el formulario de edición
          setEditFormData({
            nombre: emp.nombre || "",
            numeroIdentificacion: emp.numeroidentificacion || emp.numeroIdentificacion || "",
            contrato: emp.contrato || "",
            fecha_inicio: emp.fecha_inicio ? emp.fecha_inicio.split('T')[0] : "",
            fecha_fin: emp.fecha_fin ? emp.fecha_fin.split('T')[0] : "",
            sueldo: emp.sueldo || "",
            tipo_contrato: emp.tipo_contrato || emp.tipoContrato || "",
            cargo: emp.cargo || ""
          });
          
          // Cargar la foto del empleado
          fetchEmployeePhoto(id);
        } else {
          console.error('No se encontró el empleado en la respuesta:', response);
          setError('No se encontró el empleado en el formato esperado');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar empleado:', error);
        console.error('Detalles del error:', error.response || error.message);
        setError(error.response?.data?.message || error.message || 'Error al cargar el empleado');
        setLoading(false);
      }
    };

    const fetchEmployeePhoto = async (empleadoId) => {
      try {
        const token = localStorage.getItem('token');
        console.log('Cargando foto del empleado ID:', empleadoId);
        const response = await fetch(`http://localhost:3000/api/informacion-personal/empleado/${empleadoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Información personal completa:', data);
          
          // La imagen puede estar en varios formatos de respuesta
          const imagenPersonal = data.data?.imagen_personal || 
                                 data.data?.imagenPersonal ||
                                 data.imagen_personal ||
                                 data.imagenPersonal;
          
          console.log('Campo imagen_personal encontrado:', imagenPersonal);
          
          if (imagenPersonal) {
            const photoUrl = `http://localhost:3000/uploads/${imagenPersonal}`;
            setEmployeePhoto(photoUrl);
            console.log('URL de la foto configurada:', photoUrl);
          } else {
            console.log('No se encontró imagen_personal en la respuesta');
          }
        } else {
          console.log('Response no exitosa:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('Error al cargar la foto del empleado:', error);
        // No es crítico, simplemente no mostramos foto
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, navigate]);

  // Manejar cambios en el formulario de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios del formulario de edición
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await empleadosService.update(id, editFormData);
      
      if (response.data) {
        const updatedEmployee = response.data.empleado;
        setEmployee(updatedEmployee);
        showSuccess('Empleado actualizado exitosamente');
        setActiveSection(''); // Volver a la vista de bienvenida
      }
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      showError(error.response?.data?.message || 'Error al actualizar el empleado');
    } finally {
      setSubmitting(false);
    }
  };

  // Cambiar estado del empleado (Desvincular/Reactivar)
  const handleToggleStatus = async () => {
    setSubmitting(true);
    
    try {
      const nuevoEstado = employee.estado === 'desvinculado' ? 'activo' : 'desvinculado';
      const response = await empleadosService.cambiarEstado(id, nuevoEstado);
      
      if (response.data) {
        const updatedEmployee = response.data.empleado;
        setEmployee(updatedEmployee);
        const mensaje = nuevoEstado === 'activo' 
          ? 'Empleado reactivado exitosamente' 
          : 'Empleado desvinculado exitosamente';
        showSuccess(mensaje);
        setActiveSection(''); // Volver a la vista de bienvenida
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showError(error.response?.data?.message || 'Error al cambiar el estado del empleado');
    } finally {
      setSubmitting(false);
    }
  };

  const sections = [
    {
      id: 'info-personal',
      label: 'Información Personal',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      id: 'formacion',
      label: 'Formación Académica',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      )
    },
    {
      id: 'experiencia',
      label: 'Experiencia Laboral',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
    {
      id: 'documentos',
      label: 'Otros Documentos',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      )
    },
    {
      id: 'evaluaciones',
      label: 'Evaluaciones',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
      )
    },
    {
      id: 'editar',
      label: 'Editar Empleado',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      )
    },
    {
      id: 'desvincular',
      label: employee?.estado === 'desvinculado' ? 'Reactivar' : 'Desvincular',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
          <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
          <path d="M11 12H8a2 2 0 0 0-2 2v1"/>
        </svg>
      )
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'info-personal':
        return (
          <div className="embedded-component">
            <InformacionPersonal 
              empleado={employee} 
              onClose={() => setActiveSection('')}
              embedded={true}
            />
          </div>
        );
      case 'formacion':
        return (
          <div className="embedded-component">
            <Formacion 
              empleado={employee} 
              onClose={() => setActiveSection('')}
              embedded={true}
            />
          </div>
        );
      case 'experiencia':
        return (
          <div className="embedded-component">
            <Experiencia 
              empleado={employee} 
              onClose={() => setActiveSection('')}
              embedded={true}
            />
          </div>
        );
      case 'documentos':
        return (
          <div className="embedded-component">
            <OtrosDocumentos 
              empleado={employee} 
              onClose={() => setActiveSection('')}
              embedded={true}
            />
          </div>
        );
      case 'evaluaciones':
        return (
          <div className="embedded-component">
            <Evaluaciones 
              empleado={employee} 
              onClose={() => setActiveSection('')}
              embedded={true}
            />
          </div>
        );
      case 'editar':
        return (
          <div className="section-content">
            <form className="edit-employee-form" onSubmit={handleEditSubmit}>
                <div className="form-row">
                  <label className="form-field">
                    <span className="field-label">Nombre completo *</span>
                    <input
                      type="text"
                      name="nombre"
                      value={editFormData.nombre}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span className="field-label">Número de identificación *</span>
                    <input
                      type="text"
                      name="numeroIdentificacion"
                      value={editFormData.numeroIdentificacion}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-field">
                    <span className="field-label">Número de contrato *</span>
                    <input
                      type="text"
                      name="contrato"
                      value={editFormData.contrato}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span className="field-label">Cargo *</span>
                    <input
                      type="text"
                      name="cargo"
                      value={editFormData.cargo}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-field">
                    <span className="field-label">Fecha de inicio *</span>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={editFormData.fecha_inicio}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span className="field-label">Fecha de fin *</span>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={editFormData.fecha_fin}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-field">
                    <span className="field-label">Sueldo *</span>
                    <input
                      type="number"
                      name="sueldo"
                      value={editFormData.sueldo}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    />
                  </label>

                  <div className="form-field">
                    <span className="field-label">Tipo de contrato *</span>
                    <select
                      name="tipo_contrato"
                      value={editFormData.tipo_contrato}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      required
                    >
                      <option value="" disabled>Seleccionar tipo de contrato...</option>
                      <option value="Prestación de Servicios">Prestación de Servicios</option>
                      <option value="Laboral">Laboral</option>
                      <option value="De aprendizaje">De aprendizaje</option>
                      <option value="Periodo de prueba">Periodo de prueba</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="action-btn primary" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button type="button" className="action-btn" onClick={() => setActiveSection('')}>
                    Cancelar
                  </button>
                </div>
              </form>
          </div>
        );
      case 'desvincular':
        return (
          <div className="status-change-content">
                <div className="status-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
                    <path d="M11 12H8a2 2 0 0 0-2 2v1"/>
                  </svg>
                </div>
                <h4>{employee?.estado === 'desvinculado' ? 'Reactivar Empleado' : 'Desvincular Empleado'}</h4>
                <p className="status-message">
                  {employee?.estado === 'desvinculado'
                    ? `¿Estás seguro de que deseas reactivar a ${employee?.nombre}?`
                    : `¿Estás seguro de que deseas desvincular a ${employee?.nombre}?`
                  }
                </p>
                <p className="status-warning">
                  {employee?.estado === 'desvinculado'
                    ? 'El empleado será marcado como activo nuevamente.'
                    : 'El empleado será marcado como desvinculado pero sus datos permanecerán en el sistema.'
                  }
                </p>
                <div className="action-buttons">
                  <button
                    type="button"
                    className={`action-btn ${employee?.estado === 'desvinculado' ? 'primary' : 'danger'}`}
                    onClick={handleToggleStatus}
                    disabled={submitting}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    {submitting ? 'Procesando...' : (employee?.estado === 'desvinculado' ? 'Sí, Reactivar' : 'Sí, Desvincular')}
                  </button>
                  <button type="button" className="action-btn" onClick={() => setActiveSection('')}>
                    Cancelar
                  </button>
                </div>
              </div>
        );
      default:
        // Debug: ver qué campos tiene el empleado
        console.log('Renderizando vista de bienvenida con empleado:', employee);
        console.log('numeroIdentificacion:', employee?.numeroIdentificacion);
        console.log('numeroidentificacion:', employee?.numeroidentificacion);
        console.log('Foto del empleado:', employeePhoto);
        
        return (
          <div className="welcome-content">
            <div className="welcome-icon">
              {employeePhoto ? (
                <img
                  src={employeePhoto}
                  alt={employee?.nombre}
                  className="employee-photo"
                  onError={(e) => {
                    console.log('Error al cargar foto, mostrando icono por defecto');
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ display: employeePhoto ? 'none' : 'block' }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Información del Empleado</h2>
            <p>Selecciona una opción del menú lateral para ver o editar la información de <strong>{employee?.nombre}</strong>.</p>
            
            <div className="employee-summary">
              <div className="summary-item">
                <label>Cédula:</label>
                <span>{employee?.numeroIdentificacion || employee?.numeroidentificacion || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <label>Contrato:</label>
                <span>{employee?.contrato || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <label>Cargo:</label>
                <span>{employee?.cargo || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <label>Estado:</label>
                <span className={`status-badge ${employee?.estado || 'activo'}`}>
                  {employee?.estado === 'desvinculado' ? 'Desvinculado' : 'Activo'}
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="employee-details-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando información del empleado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-details-page loading">
        <div className="loading-spinner">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 style={{ color: '#D32F2F', marginBottom: '1rem' }}>Error al cargar el empleado</h3>
          <p style={{ color: '#6c757d', marginBottom: '2rem' }}>{error}</p>
          <button
            className="action-btn primary"
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '1rem' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-details-page loading">
        <div className="loading-spinner">
          <p>No se encontró el empleado</p>
          <button
            className="action-btn primary"
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '1rem' }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-details-page">
      {/* Header con botón de regresar */}
      <header className="employee-details-page-header">
        <div className="header-left">
          <img src={logoOftalmolaser} alt="Oftalmolaser Logo" className="header-logo" />
          <div className="header-employee-info">
            <h1>{employee.nombre}</h1>
            <p>{employee.cargo}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={() => navigate('/dashboard')} title="Volver al Dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="employee-details-page-main">
        <div className="employee-details-container-page">
          {/* Sidebar */}
          <aside className="employee-details-sidebar">
            <nav className="sidebar-nav">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="sidebar-icon">
                    {section.icon}
                  </div>
                  <span className="sidebar-label">{section.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="employee-details-content">
            {renderContent()}
          </div>
        </div>
      </main>
      
      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  );
};

export default EmployeeDetails;
