import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import evaluacionesService from '../services/evaluaciones.service';
import empleadosService from '../services/empleados.service';
import AlertContainer from '../shared/components/AlertContainer';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import useAlert from '../shared/hooks/useAlert';
import './Evaluaciones.css';

const Evaluaciones = ({ empleado, onClose, embedded = false }) => {
  const navigate = useNavigate();
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  // Estados principales
  const [activeTab, setActiveTab] = useState(embedded ? 'evaluaciones' : 'periodos');
  const [periodos, setPeriodos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [metas, setMetas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEvaluacion, setEditingEvaluacion] = useState(null);
  const [editingMeta, setEditingMeta] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Formularios
  const [periodoForm, setPeriodoForm] = useState({
    nombre: '',
    tipo: 'trimestral',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
    activo: true
  });

  const [evaluacionForm, setEvaluacionForm] = useState({
    empleado_id: embedded && empleado ? empleado.id : '',
    periodo_id: '',
    tipo_evaluacion: 'seleccionar tipo de evaluación',
    calidad_trabajo: 3,
    productividad: 3,
    conocimiento_tecnico: 3,
    trabajo_equipo: 3,
    comunicacion: 3,
    liderazgo: 3,
    responsabilidad: 3,
    iniciativa: 3,
    porcentaje_logro: '',
    fortalezas: '',
    oportunidades_mejora: '',
    comentarios_generales: '',
    requiere_plan_mejora: false,
    plan_mejora: '',
    estado: 'seleccionar estado'
  });

  const [metaForm, setMetaForm] = useState({
    empleado_id: embedded && empleado ? empleado.id : '',
    periodo_id: 'seleccionar período',
    descripcion: '',
    peso_porcentaje: '',
    fecha_limite: '',
    estado: 'seleccionar estado',
    porcentaje_cumplimiento: '',
    observaciones: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, [activeTab, empleado?.id]);

  // Si está embebido, preseleccionar el empleado en los formularios
  useEffect(() => {
    if (embedded && empleado) {
      setEvaluacionForm(prev => ({...prev, empleado_id: empleado.id}));
      setMetaForm(prev => ({...prev, empleado_id: empleado.id}));
    }
  }, [embedded, empleado]);

  // Sincronizar formularios cuando cambien los períodos disponibles
  useEffect(() => {
    const periodosDisponibles = periodos.map(p => p.id);
    
    // Limpiar período en formulario de evaluación si no está disponible
    if (evaluacionForm.periodo_id && !periodosDisponibles.includes(parseInt(evaluacionForm.periodo_id))) {
      setEvaluacionForm(prev => ({ ...prev, periodo_id: '' }));
    }
    
    // Limpiar período en formulario de meta si no está disponible
    if (metaForm.periodo_id && !periodosDisponibles.includes(parseInt(metaForm.periodo_id))) {
      setMetaForm(prev => ({ ...prev, periodo_id: '' }));
    }
  }, [periodos]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'periodos' && !embedded) {
        const response = await evaluacionesService.obtenerPeriodos();
        setPeriodos(response.data?.periodos || []);
      } else if (activeTab === 'evaluaciones') {
        const filtros = embedded && empleado ? { empleado_id: empleado.id } : {};
        const response = await evaluacionesService.obtenerEvaluaciones(filtros);
        setEvaluaciones(response.data?.evaluaciones || []);
      } else if (activeTab === 'metas') {
        const filtros = embedded && empleado ? { empleado_id: empleado.id } : {};
        const response = await evaluacionesService.obtenerMetas(filtros);
        setMetas(response.data?.metas || []);
      }
      
      // Cargar empleados si no está en modo embebido
      if (!embedded && empleados.length === 0) {
        const empResponse = await empleadosService.getAll();
        setEmpleados(empResponse.data?.empleados || []);
      }
      
      // Cargar períodos siempre (para los dropdowns)
      if (periodos.length === 0) {
        const perResponse = await evaluacionesService.obtenerPeriodos();
        setPeriodos(perResponse.data?.periodos || []);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de confirmación usando el sistema existente
  const showConfirm = (title, message, action) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: action
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  // Calcular puntuación total en tiempo real
  const calcularPuntuacionTotal = () => {
    const suma = parseFloat(evaluacionForm.calidad_trabajo) +
                parseFloat(evaluacionForm.productividad) +
                parseFloat(evaluacionForm.conocimiento_tecnico) +
                parseFloat(evaluacionForm.trabajo_equipo) +
                parseFloat(evaluacionForm.comunicacion) +
                parseFloat(evaluacionForm.liderazgo) +
                parseFloat(evaluacionForm.responsabilidad) +
                parseFloat(evaluacionForm.iniciativa);
    return (suma / 8).toFixed(2);
  };

  // Handlers de Períodos
  const handleSubmitPeriodo = async (e) => {
    e.preventDefault();
    try {
      const response = await evaluacionesService.crearPeriodo(periodoForm);
      // Actualizar estado local inmediatamente (optimización)
      const nuevoPeriodo = response.data?.periodo;
      if (nuevoPeriodo) {
        setPeriodos(prev => [...prev, nuevoPeriodo]);
      }
      showSuccess('Período creado exitosamente');
      resetPeriodoForm();
    } catch (error) {
      showError(error.response?.data?.message || 'Error al crear período');
    }
  };

  const handleEliminarPeriodo = async (id) => {
    showConfirm(
      'Confirmar Eliminación',
      '¿Está seguro de eliminar este período?',
      async () => {
        try {
          await evaluacionesService.eliminarPeriodo(id);
          // Actualizar estado local inmediatamente (optimización)
          setPeriodos(prev => prev.filter(periodo => periodo.id !== id));
          
          // Limpiar formularios si estaban usando el período eliminado
          if (evaluacionForm.periodo_id == id) {
            setEvaluacionForm(prev => ({ ...prev, periodo_id: '' }));
          }
          if (metaForm.periodo_id == id) {
            setMetaForm(prev => ({ ...prev, periodo_id: '' }));
          }
          
          showSuccess('Período eliminado exitosamente');
        } catch (error) {
          showError(error.response?.data?.message || 'Error al eliminar período');
        }
      }
    );
  };

  // Handlers de Evaluaciones
  const handleSubmitEvaluacion = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!evaluacionForm.periodo_id) {
      showError('Debe seleccionar un período');
      return;
    }
    if (!evaluacionForm.empleado_id) {
      showError('Debe seleccionar un empleado');
      return;
    }
    
    try {
      if (editingEvaluacion) {
        const response = await evaluacionesService.actualizarEvaluacion(editingEvaluacion.id, evaluacionForm);
        // Actualizar estado local inmediatamente (optimización)
        const evaluacionActualizada = response.data?.evaluacion;
        if (evaluacionActualizada) {
          setEvaluaciones(prev => prev.map(evaluacion =>
            evaluacion.id === editingEvaluacion.id ? evaluacionActualizada : evaluacion
          ));
        }
        showSuccess('Evaluación actualizada exitosamente');
      } else {
        const response = await evaluacionesService.crearEvaluacion(evaluacionForm);
        // Actualizar estado local inmediatamente (optimización)
        const nuevaEvaluacion = response.data?.evaluacion;
        if (nuevaEvaluacion) {
          setEvaluaciones(prev => [...prev, nuevaEvaluacion]);
        }
        showSuccess('Evaluación creada exitosamente');
      }
      resetEvaluacionForm();
      setEditingEvaluacion(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Error al guardar evaluación');
    }
  };

  const handleEditEvaluacion = (evaluacion) => {
    setEditingEvaluacion(evaluacion);
    setEvaluacionForm({
      empleado_id: evaluacion.empleado_id,
      periodo_id: evaluacion.periodo_id,
      tipo_evaluacion: evaluacion.tipo_evaluacion,
      calidad_trabajo: evaluacion.calidad_trabajo || 3,
      productividad: evaluacion.productividad || 3,
      conocimiento_tecnico: evaluacion.conocimiento_tecnico || 3,
      trabajo_equipo: evaluacion.trabajo_equipo || 3,
      comunicacion: evaluacion.comunicacion || 3,
      liderazgo: evaluacion.liderazgo || 3,
      responsabilidad: evaluacion.responsabilidad || 3,
      iniciativa: evaluacion.iniciativa || 3,
      porcentaje_logro: evaluacion.porcentaje_logro || 0,
      fortalezas: evaluacion.fortalezas || '',
      oportunidades_mejora: evaluacion.oportunidades_mejora || '',
      comentarios_generales: evaluacion.comentarios_generales || '',
      requiere_plan_mejora: evaluacion.requiere_plan_mejora || false,
      plan_mejora: evaluacion.plan_mejora || '',
      estado: evaluacion.estado
    });
  };

  const handleCancelEditEvaluacion = () => {
    setEditingEvaluacion(null);
    resetEvaluacionForm();
  };

  const handleAprobarEvaluacion = async (id) => {
    showConfirm(
      'Confirmar Aprobación',
      '¿Aprobar esta evaluación?',
      async () => {
        try {
          await evaluacionesService.aprobarEvaluacion(id);
          // Actualizar estado local inmediatamente (optimización)
          setEvaluaciones(prev => prev.map(evaluacion =>
            evaluacion.id === id ? { ...evaluacion, estado: 'aprobada' } : evaluacion
          ));
          showSuccess('Evaluación aprobada exitosamente');
        } catch (error) {
          showError(error.response?.data?.message || 'Error al aprobar evaluación');
        }
      }
    );
  };

  const handleCalcularPorcentajeLogro = async () => {
    // Determinar el empleado: usar el del formulario o el del contexto embebido
    const empleadoId = evaluacionForm.empleado_id || (embedded && empleado ? empleado.id : null);
    const periodoId = evaluacionForm.periodo_id;

    // Validar que tengamos los datos necesarios
    if (!empleadoId) {
      showError('Debe seleccionar un empleado primero');
      return;
    }

    if (!periodoId) {
      showError('Debe seleccionar un período primero');
      return;
    }

    try {
      const response = await evaluacionesService.obtenerMetasEmpleadoPeriodo(
        empleadoId,
        periodoId
      );
      
      const resumen = response.data?.resumen || {};
      const porcentajeLogro = resumen.porcentaje_logro || '';
      const totalMetas = resumen.total_metas || 0;
      
      if (totalMetas === 0) {
        showError('El empleado no tiene metas registradas en este período');
        setEvaluacionForm({...evaluacionForm, porcentaje_logro: ''});
        return;
      }

      setEvaluacionForm({...evaluacionForm, porcentaje_logro: porcentajeLogro});
      showSuccess(`% Logro calculado: ${porcentajeLogro.toFixed(1)}% (basado en ${totalMetas} meta${totalMetas > 1 ? 's' : ''})`);
    } catch (error) {
      showError(error.response?.data?.message || 'Error al calcular % de logro');
    }
  };

  // Handlers de Metas
  const handleSubmitMeta = async (e) => {
    e.preventDefault();
    try {
      if (editingMeta) {
        const response = await evaluacionesService.actualizarMeta(editingMeta.id, metaForm);
        // Actualizar estado local inmediatamente (optimización)
        const metaActualizada = response.data?.meta;
        if (metaActualizada) {
          setMetas(prev => prev.map(meta =>
            meta.id === editingMeta.id ? metaActualizada : meta
          ));
        }
        showSuccess('Meta actualizada exitosamente');
      } else {
        const response = await evaluacionesService.crearMeta(metaForm);
        // Actualizar estado local inmediatamente (optimización)
        const nuevaMeta = response.data?.meta;
        if (nuevaMeta) {
          setMetas(prev => [...prev, nuevaMeta]);
        }
        showSuccess('Meta creada exitosamente');
      }
      resetMetaForm();
      setEditingMeta(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Error al guardar meta');
    }
  };

  const handleEditMeta = (meta) => {
    setEditingMeta(meta);
    setMetaForm({
      empleado_id: meta.empleado_id,
      periodo_id: meta.periodo_id,
      descripcion: meta.descripcion,
      peso_porcentaje: meta.peso_porcentaje || '',
      fecha_limite: meta.fecha_limite || '',
      estado: meta.estado,
      porcentaje_cumplimiento: meta.porcentaje_cumplimiento || '',
      observaciones: meta.observaciones || ''
    });
  };

  const handleCancelEditMeta = () => {
    setEditingMeta(null);
    resetMetaForm();
  };

  // Resets
  const resetPeriodoForm = () => {
    setPeriodoForm({
      nombre: '',
      tipo: 'trimestral',
      fecha_inicio: '',
      fecha_fin: '',
      descripcion: '',
      activo: true
    });
  };

  const resetEvaluacionForm = () => {
    setEvaluacionForm({
      empleado_id: embedded && empleado ? empleado.id : '',
      periodo_id: '',
      tipo_evaluacion: 'seleccionar tipo de evaluación',
      calidad_trabajo: 3,
      productividad: 3,
      conocimiento_tecnico: 3,
      trabajo_equipo: 3,
      comunicacion: 3,
      liderazgo: 3,
      responsabilidad: 3,
      iniciativa: 3,
      porcentaje_logro: '',
      fortalezas: '',
      oportunidades_mejora: '',
      comentarios_generales: '',
      requiere_plan_mejora: false,
      plan_mejora: '',
      estado: 'completada'
    });
  };

  const resetMetaForm = () => {
    setMetaForm({
      empleado_id: embedded && empleado ? empleado.id : '',
      periodo_id: '',
      descripcion: '',
      peso_porcentaje: '',
      fecha_limite: '',
      estado: 'seleccionar estado',
      porcentaje_cumplimiento: '',
      observaciones: ''
    });
  };

  // Renderizar badge de estado
  const renderEstado = (estado) => {
    const colores = {
      completada: 'badge-info',
      aprobada: 'badge-success',
      pendiente: 'badge-warning',
      en_progreso: 'badge-info',
      no_cumplida: 'badge-danger',
      cancelada: 'badge-secondary'
    };
    return <span className={`badge ${colores[estado] || 'badge-secondary'}`}>{estado}</span>;
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay") && !embedded) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={`modal-overlay ${embedded ? 'embedded-mode' : ''}`} onClick={handleOutsideClick}>
      <div className={`evaluaciones-modal ${embedded ? 'embedded-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="evaluaciones-container">
          <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
          
          <h3>
            <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Evaluación de Desempeño - {empleado?.nombre || 'Empleado'}
          </h3>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'periodos' ? 'active' : ''}`}
              onClick={() => setActiveTab('periodos')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Períodos
            </button>
            <button
              className={`tab ${activeTab === 'evaluaciones' ? 'active' : ''}`}
              onClick={() => setActiveTab('evaluaciones')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              Evaluaciones
            </button>
            <button 
              className={`tab ${activeTab === 'metas' ? 'active' : ''}`}
              onClick={() => setActiveTab('metas')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              Metas
            </button>
          </div>

          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <>
              {/* TAB PERÍODOS */}
              {activeTab === 'periodos' && (
                <div className="tab-content">
                  <form className="evaluaciones-form" onSubmit={handleSubmitPeriodo}>
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre del período *</label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ej: Q4 2025"
                        value={periodoForm.nombre}
                        onChange={(e) => setPeriodoForm({...periodoForm, nombre: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="tipo">Tipo *</label>
                      <select
                        name="tipo"
                        value={periodoForm.tipo}
                        onChange={(e) => setPeriodoForm({...periodoForm, tipo: e.target.value})}
                        required
                      >
                        <option value="prueba 18 días">Prueba 18 días</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="fecha_inicio">Fecha inicio *</label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={periodoForm.fecha_inicio}
                        onChange={(e) => setPeriodoForm({...periodoForm, fecha_inicio: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fecha_fin">Fecha fin *</label>
                      <input
                        type="date"
                        name="fecha_fin"
                        value={periodoForm.fecha_fin}
                        onChange={(e) => setPeriodoForm({...periodoForm, fecha_fin: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group full">
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        name="descripcion"
                        placeholder="Descripción del período"
                        value={periodoForm.descripcion}
                        onChange={(e) => setPeriodoForm({...periodoForm, descripcion: e.target.value})}
                        rows="2"
                      />
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="submit-btn">Agregar Período</button>
                    </div>
                  </form>

                  <table className="evaluaciones-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodos.map((periodo) => (
                        <tr key={periodo.id}>
                          <td>{periodo.nombre}</td>
                          <td><span className="badge badge-info">{periodo.tipo}</span></td>
                          <td>{new Date(periodo.fecha_inicio).toLocaleDateString()}</td>
                          <td>{new Date(periodo.fecha_fin).toLocaleDateString()}</td>
                          <td>
                            {periodo.activo ?
                              <span className="badge badge-success">Activo</span> :
                              <span className="badge badge-secondary">Inactivo</span>
                            }
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-btn"
                                onClick={() => handleEliminarPeriodo(periodo.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB EVALUACIONES */}
              {activeTab === 'evaluaciones' && (
                <div className="tab-content">
                  <form className="evaluaciones-form" onSubmit={handleSubmitEvaluacion}>
                    <div className="form-group">
                      <label htmlFor="empleado_id">Empleado *</label>
                      <select
                        name="empleado_id"
                        value={evaluacionForm.empleado_id}
                        onChange={(e) => setEvaluacionForm({...evaluacionForm, empleado_id: e.target.value})}
                        disabled={embedded}
                        required
                      >
                        <option value="" disabled>Seleccionar empleado...</option>
                        {embedded && empleado ? (
                          <option value={empleado.id}>{empleado.nombre}</option>
                        ) : (
                          empleados.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="periodo_id">Período *</label>
                      <select
                        name="periodo_id"
                        value={evaluacionForm.periodo_id}
                        onChange={(e) => setEvaluacionForm({...evaluacionForm, periodo_id: e.target.value})}
                        required
                      >
                        <option value="" disabled>Seleccionar período...</option>
                        {periodos.map(per => (
                          <option key={per.id} value={per.id}>{per.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="tipo_evaluacion">Tipo de evaluación</label>
                      <select
                        name="tipo_evaluacion"
                        value={evaluacionForm.tipo_evaluacion}
                        onChange={(e) => setEvaluacionForm({...evaluacionForm, tipo_evaluacion: e.target.value})}
                      >
                        <option value="seleccionar tipo de evaluación" disabled>Seleccionar tipo de evaluación...</option>
                        <option value="por competencias y habilidades funcionarios">Por competencias y habilidades funcionarios</option>
                        <option value="prorroga de contrato">Prorroga de contrato</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="estado">Estado</label>
                      <select
                        name="estado"
                        value={evaluacionForm.estado}
                        onChange={(e) => setEvaluacionForm({...evaluacionForm, estado: e.target.value})}
                      >
                        <option value="completada">Completada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En progreso</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="porcentaje_logro">% Logro de metas</label>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
                        <div style={{flex: 1}}>
                          <input
                            type="number"
                            name="porcentaje_logro"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0-100"
                            value={evaluacionForm.porcentaje_logro || ''}
                            onChange={(e) => setEvaluacionForm({...evaluacionForm, porcentaje_logro: parseFloat(e.target.value) || ''})}
                          />
                          <small style={{color: '#6b7280', fontSize: '11px', display: 'block', marginTop: '4px'}}>
                            Manual o automático
                          </small>
                        </div>
                        <button
                          type="button"
                          className="calc-btn"
                          onClick={handleCalcularPorcentajeLogro}
                          title="Calcular automáticamente basado en metas"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '16px', height: '16px'}}>
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                          Calcular
                        </button>
                      </div>
                    </div>

                    <div className="form-group full puntuacion-section">
                      <div className="puntuacion-header">
                        <label>Puntuaciones (1 - 5)</label>
                        <div className="puntuacion-total">
                          Total: <strong>{calcularPuntuacionTotal()}</strong> / 5.0
                        </div>
                      </div>
                      
                      <div className="puntuaciones-grid">
                        {[
                          { key: 'calidad_trabajo', label: 'Calidad de trabajo' },
                          { key: 'productividad', label: 'Productividad' },
                          { key: 'conocimiento_tecnico', label: 'Conocimiento técnico' },
                          { key: 'trabajo_equipo', label: 'Trabajo en equipo' },
                          { key: 'comunicacion', label: 'Comunicación' },
                          { key: 'liderazgo', label: 'Liderazgo' },
                          { key: 'responsabilidad', label: 'Responsabilidad' },
                          { key: 'iniciativa', label: 'Iniciativa' }
                        ].map(({ key, label }) => (
                          <div key={key} className="slider-item">
                            <label>{label}</label>
                            <div className="slider-controls">
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.5"
                                value={evaluacionForm[key]}
                                onChange={(e) => setEvaluacionForm({...evaluacionForm, [key]: parseFloat(e.target.value)})}
                              />
                              <span className="slider-value">{evaluacionForm[key]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group full">
                      <label htmlFor="fortalezas">Fortalezas</label>
                      <textarea
                        name="fortalezas"
                        placeholder="Describa las fortalezas del empleado"
                        value={evaluacionForm.fortalezas}
                        onChange={(e) => setEvaluacionForm({...evaluacionForm, fortalezas: e.target.value})}
                        rows="2"
                      />
                    </div>

                    <div className="form-group full">
                      <label htmlFor="oportunidades_mejora">Oportunidades de mejora</label>
                      <textarea
                        name="oportunidades_mejora"
                        placeholder="Describa las áreas de mejora"
                        value={evaluacionForm.oportunidades_mejora}
                        onChange={(e) => setEvaluacionForm({...evaluacionForm, oportunidades_mejora: e.target.value})}
                        rows="2"
                      />
                    </div>

                    <div className="form-buttons">
                      <button type="submit" className="submit-btn">
                        {editingEvaluacion ? 'Actualizar evaluación' : 'Agregar evaluación'}
                      </button>
                      {editingEvaluacion && (
                        <button type="button" className="cancel-btn" onClick={handleCancelEditEvaluacion}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  <table className="evaluaciones-table">
                    <thead>
                      <tr>
                        {!embedded && <th>Empleado</th>}
                        <th>Período</th>
                        <th>Puntuación</th>
                        <th>% Logro</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluaciones.length === 0 ? (
                        <tr>
                          <td colSpan={embedded ? "6" : "7"} style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>
                            No hay evaluaciones registradas
                          </td>
                        </tr>
                      ) : (
                        evaluaciones.map((ev) => (
                          <tr key={ev.id}>
                            {!embedded && <td>{ev.empleado_nombre}</td>}
                            <td>{ev.periodo_nombre || '-'}</td>
                            <td>
                              <strong>{ev.puntuacion_total ? parseFloat(ev.puntuacion_total).toFixed(2) : '-'}</strong> / 5.0
                            </td>
                            <td>{ev.porcentaje_logro ? `${parseFloat(ev.porcentaje_logro).toFixed(1)}%` : '-'}</td>
                            <td>{renderEstado(ev.estado)}</td>
                            <td>{new Date(ev.fecha_evaluacion).toLocaleDateString()}</td>
                            <td>
                              <div className="action-buttons">
                                <button className="view-btn" onClick={() => handleEditEvaluacion(ev)}>
                                  Editar
                                </button>
                                {ev.estado === 'completada' && (
                                  <button className="edit-btn" onClick={() => handleAprobarEvaluacion(ev.id)}>
                                    Aprobar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB METAS */}
              {activeTab === 'metas' && (
                <div className="tab-content">
                  <form className="evaluaciones-form" onSubmit={handleSubmitMeta}>
                    <div className="form-group">
                      <label htmlFor="empleado_id">Empleado *</label>
                      <select
                        name="empleado_id"
                        value={metaForm.empleado_id}
                        onChange={(e) => setMetaForm({...metaForm, empleado_id: e.target.value})}
                        disabled={embedded}
                        required
                      >
                        <option value="" disabled>Seleccionar empleado...</option>
                        {embedded && empleado ? (
                          <option value={empleado.id}>{empleado.nombre}</option>
                        ) : (
                          empleados.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="periodo_id">Período *</label>
                      <select
                        name="periodo_id"
                        value={metaForm.periodo_id}
                        onChange={(e) => setMetaForm({...metaForm, periodo_id: e.target.value})}
                        required
                      >
                        <option value="" disabled>Seleccionar período...</option>
                        {periodos.map(per => (
                          <option key={per.id} value={per.id}>{per.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="peso_porcentaje">Peso (%) *</label>
                      <input
                        type="number"
                        name="peso_porcentaje"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={metaForm.peso_porcentaje}
                        onChange={(e) => setMetaForm({...metaForm, peso_porcentaje: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fecha_limite">Fecha límite</label>
                      <input
                        type="date"
                        name="fecha_limite"
                        value={metaForm.fecha_limite}
                        onChange={(e) => setMetaForm({...metaForm, fecha_limite: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="estado">Estado</label>
                      <select
                        name="estado"
                        value={metaForm.estado}
                        onChange={(e) => setMetaForm({...metaForm, estado: e.target.value})}
                      >
                        <option value="seleccionar estado" disabled>Seleccionar estado...</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En progreso</option>
                        <option value="completada">Completada</option>
                        <option value="no_cumplida">No cumplida</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="porcentaje_cumplimiento">% Cumplimiento</label>
                      <input
                        type="number"
                        name="porcentaje_cumplimiento"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={metaForm.porcentaje_cumplimiento}
                        onChange={(e) => setMetaForm({...metaForm, porcentaje_cumplimiento: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="form-group full">
                      <label htmlFor="descripcion">Descripción de la meta *</label>
                      <textarea
                        name="descripcion"
                        placeholder="Describa el objetivo o meta"
                        value={metaForm.descripcion}
                        onChange={(e) => setMetaForm({...metaForm, descripcion: e.target.value})}
                        rows="2"
                        required
                      />
                    </div>
                    <div className="form-group full">
                      <label htmlFor="observaciones">Observaciones</label>
                      <textarea
                        name="observaciones"
                        placeholder="Observaciones adicionales"
                        value={metaForm.observaciones}
                        onChange={(e) => setMetaForm({...metaForm, observaciones: e.target.value})}
                        rows="2"
                      />
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="submit-btn">
                        {editingMeta ? 'Actualizar meta' : 'Agregar meta'}
                      </button>
                      {editingMeta && (
                        <button type="button" className="cancel-btn" onClick={handleCancelEditMeta}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  <table className="evaluaciones-table">
                    <thead>
                      <tr>
                        {!embedded && <th>Empleado</th>}
                        <th>Descripción</th>
                        <th>Peso %</th>
                        <th>% Cumplimiento</th>
                        <th>Estado</th>
                        <th>Fecha Límite</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metas.length === 0 ? (
                        <tr>
                          <td colSpan={embedded ? "6" : "7"} style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>
                            No hay metas registradas
                          </td>
                        </tr>
                      ) : (
                        metas.map((meta) => (
                          <tr key={meta.id}>
                            {!embedded && <td>{meta.empleado_nombre}</td>}
                            <td>{meta.descripcion}</td>
                            <td>{meta.peso_porcentaje}%</td>
                            <td>
                              <div className="progress-container">
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{width: `${meta.porcentaje_cumplimiento}%`}}
                                  />
                                </div>
                                <span className="progress-text">{meta.porcentaje_cumplimiento}%</span>
                              </div>
                            </td>
                            <td>{renderEstado(meta.estado)}</td>
                            <td>{meta.fecha_limite ? new Date(meta.fecha_limite).toLocaleDateString() : '-'}</td>
                            <td>
                              <div className="action-buttons">
                                <button className="view-btn" onClick={() => handleEditMeta(meta)}>
                                  Editar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <button className="cerrar-evaluaciones-btn" onClick={onClose || (() => navigate('/dashboard'))}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Usar el sistema de confirmación existente */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
        confirmText="Aceptar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Evaluaciones;
