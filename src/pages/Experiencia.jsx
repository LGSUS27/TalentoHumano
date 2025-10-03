import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertContainer from "../components/AlertContainer";
import useAlert from "../hooks/useAlert";
import "./Experiencia.css";

const Experiencia = ({ empleado, onClose }) => {
  const [experiencias, setExperiencias] = useState([]);
  const [formData, setFormData] = useState({
    empresa: "",
    cargo: "",
    tipoVinculacion: "",
    fechaInicio: "",
    fechaFin: "",
    funciones: "",
    archivo: null,
  });
  const [editingExp, setEditingExp] = useState(null);
  const API_URL = "http://localhost:3000";
  
  // Hook para manejar alertas
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("es-CO") : "");

  useEffect(() => {
    const fetchData = async () => {
      if (!empleado?.id) return;
      
      try {
        const res = await axios.get(`${API_URL}/api/experiencia/${empleado.id}`);
        const dataConArchivos = res.data.map((exp) => ({
          ...exp,
          archivoURL: `${API_URL}/uploads/${exp.soporte}`,
        }));
        setExperiencias(dataConArchivos);
      } catch (err) {
        console.error("Error al cargar experiencias:", err);
      }
    };
    fetchData();
  }, [empleado?.id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((p) => ({ ...p, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Activar validaciones visuales
    
    if (!empleado?.id) {
      showError("No se ha seleccionado un empleado.");
      return;
    }
    
    // Validaciones específicas
    if (!formData.empresa || formData.empresa.trim() === "") {
      showError("La empresa es obligatoria");
      return;
    }

    // Validar empresa (solo letras, espacios y algunos caracteres especiales)
    const empresaRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\(\)&]+$/;
    if (!empresaRegex.test(formData.empresa)) {
      showError("La empresa solo puede contener letras, espacios, guiones, puntos, paréntesis y &");
      return;
    }

    if (!formData.cargo || formData.cargo.trim() === "") {
      showError("El cargo es obligatorio");
      return;
    }

    // Validar cargo (solo letras, espacios y algunos caracteres especiales)
    const cargoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\(\)&]+$/;
    if (!cargoRegex.test(formData.cargo)) {
      showError("El cargo solo puede contener letras, espacios, guiones, puntos, paréntesis y &");
      return;
    }

    if (!formData.tipoVinculacion || formData.tipoVinculacion.trim() === "") {
      showError("El tipo de vinculación es obligatorio");
      return;
    }

    if (!formData.fechaInicio) {
      showError("La fecha de inicio es obligatoria");
      return;
    }

    if (!formData.fechaFin) {
      showError("La fecha de fin es obligatoria");
      return;
    }

    // Validar fechas
    const fechaInicio = new Date(formData.fechaInicio);
    const fechaFin = new Date(formData.fechaFin);
    const hoy = new Date();

    if (fechaInicio > hoy) {
      showError("La fecha de inicio no puede ser futura");
      return;
    }

    if (fechaFin > hoy) {
      showError("La fecha de fin no puede ser futura");
      return;
    }

    if (fechaInicio > fechaFin) {
      showError("La fecha de inicio no puede ser posterior a la fecha de fin");
      return;
    }

    // Validar que la experiencia no sea muy antigua (más de 100 años)
    const fechaMinima = new Date();
    fechaMinima.setFullYear(fechaMinima.getFullYear() - 100);
    if (fechaInicio < fechaMinima) {
      showError("La fecha de inicio no puede ser anterior a 1924");
      return;
    }

    if (!formData.funciones || formData.funciones.trim() === "") {
      showError("Las funciones son obligatorias");
      return;
    }

    // Validar funciones (texto más libre, pero sin caracteres peligrosos)
    const funcionesRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\(\)&,;:!?]+$/;
    if (!funcionesRegex.test(formData.funciones)) {
      showError("Las funciones contienen caracteres no válidos");
      return;
    }

    if (!formData.archivo) {
      showError("Debe adjuntar un documento PDF");
      return;
    }

    const data = new FormData();
    data.append('empleado_id', empleado.id);
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    try {
      const res = await axios.post(`${API_URL}/api/experiencia`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const nueva = { ...res.data, archivoURL: `${API_URL}/uploads/${res.data.soporte}` };
      setExperiencias((prev) => [nueva, ...prev]);
      setFormData({
        empresa: "", cargo: "", tipoVinculacion: "",
        fechaInicio: "", fechaFin: "", funciones: "", archivo: null,
      });
    } catch (err) {
      console.error("Error al guardar experiencia:", err);
      showError("Error al guardar experiencia: " + (err.response?.data?.error || err.message));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  const handleEdit = (exp) => {
    setEditingExp(exp);
    setFormData({
      empresa: exp.empresa,
      cargo: exp.cargo,
      tipoVinculacion: exp.tipo_vinculacion,
      fechaInicio: exp.fecha_inicio,
      fechaFin: exp.fecha_salida,
      funciones: exp.funciones,
      archivo: null, // No pre-cargar archivo existente
    });
  };

  const handleCancelEdit = () => {
    setEditingExp(null);
    setFormData({
      empresa: "",
      cargo: "",
      tipoVinculacion: "",
      fechaInicio: "",
      fechaFin: "",
      funciones: "",
      archivo: null,
    });
  };

  const handleUpdateExp = async (e) => {
    e.preventDefault();
    
    
    if (!empleado?.id) {
      showError("No se ha seleccionado un empleado.");
      return;
    }
    
    // Validar campos obligatorios
    if (!formData.empresa || !formData.cargo || !formData.tipoVinculacion || 
        !formData.fechaInicio || !formData.fechaFin || !formData.funciones) {
      showError("Por favor, complete todos los campos obligatorios");
      return;
    }

    const data = new FormData();
    data.append('empleado_id', empleado.id);
    
    // Solo enviar campos que han sido modificados o que no están vacíos
    if (formData.empresa) data.append('empresa', formData.empresa);
    if (formData.cargo) data.append('cargo', formData.cargo);
    if (formData.tipoVinculacion) data.append('tipoVinculacion', formData.tipoVinculacion);
    if (formData.fechaInicio) data.append('fechaInicio', formData.fechaInicio);
    if (formData.fechaFin) data.append('fechaFin', formData.fechaFin);
    if (formData.funciones) data.append('funciones', formData.funciones);
    if (formData.archivo) data.append('archivo', formData.archivo);

    try {
      const res = await axios.put(`${API_URL}/api/experiencia/${editingExp.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Actualizar la lista de experiencias
      const updatedExperiencias = experiencias.map(exp => 
        exp.id === editingExp.id 
          ? { ...res.data, archivoURL: res.data.soporte ? `${API_URL}/uploads/${res.data.soporte}` : exp.archivoURL }
          : exp
      );
      setExperiencias(updatedExperiencias);
      
      handleCancelEdit();
    } catch (err) {
      console.error("Error al actualizar experiencia:", err);
      showError("Error al actualizar la experiencia: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="experiencia-title"
    >
      <div className="experiencia-container" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2 id="experiencia-title">Experiencia Laboral - {empleado?.nombre || 'Empleado'}</h2>
        </header>

        <form className="experiencia-form" onSubmit={editingExp ? handleUpdateExp : handleSubmit} noValidate>
          <div className="form-group">
              <label htmlFor="empresa">Empresa *</label>
              <input
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
                required
                aria-describedby="empresa-error"
                aria-invalid={!formData.empresa && formData.empresa !== ''}
              />
              <div id="empresa-error" className="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div className="form-group">
              <label htmlFor="cargo">Cargo *</label>
              <input
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Cargo desempeñado"
                required
                aria-describedby="cargo-error"
                aria-invalid={!formData.cargo && formData.cargo !== ''}
              />
              <div id="cargo-error" className="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div className="form-group">
              <label htmlFor="tipoVinculacion">Tipo de vinculación *</label>
              <input
                id="tipoVinculacion"
                name="tipoVinculacion"
                value={formData.tipoVinculacion}
                onChange={handleChange}
                placeholder="Tipo de vinculación laboral"
                required
                aria-describedby="tipoVinculacion-error"
                aria-invalid={!formData.tipoVinculacion && formData.tipoVinculacion !== ''}
              />
              <div id="tipoVinculacion-error" className="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div className="form-group">
              <label htmlFor="fechaInicio">Fecha de ingreso *</label>
              <input
                id="fechaInicio"
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                required
                aria-describedby="fechaInicio-error"
                aria-invalid={!formData.fechaInicio && formData.fechaInicio !== ''}
              />
              <div id="fechaInicio-error" className="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div className="form-group">
              <label htmlFor="fechaFin">Fecha de salida *</label>
              <input
                id="fechaFin"
                type="date"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                required
                aria-describedby="fechaFin-error"
                aria-invalid={!formData.fechaFin && formData.fechaFin !== ''}
              />
              <div id="fechaFin-error" className="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div className="form-group full">
              <label htmlFor="funciones">Funciones desempeñadas *</label>
              <textarea
                id="funciones"
                className="full"
                name="funciones"
                value={formData.funciones}
                onChange={handleChange}
                placeholder="Describe las funciones principales desempeñadas"
                required
                rows="4"
                aria-describedby="funciones-error"
                aria-invalid={!formData.funciones && formData.funciones !== ''}
              />
              <div id="funciones-error" className="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div className="form-group full">
              <label htmlFor="archivo">Documento de soporte (PDF) *</label>
              <input
                id="archivo"
                className="full"
                type="file"
                name="archivo"
                accept="application/pdf"
                onChange={handleChange}
                required
                aria-describedby="archivo-error archivo-help"
                aria-invalid={!formData.archivo && formData.archivo !== null}
              />
              <div id="archivo-help" className="help-text">Solo se permiten archivos PDF</div>
              <div id="archivo-error" className="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div className="form-buttons">
              <button className="btn-primary full" type="submit" aria-describedby="submit-help">
                {editingExp ? 'Actualizar Experiencia' : 'Agregar Experiencia'}
              </button>
              {editingExp && (
                <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
            <div id="submit-help" className="help-text">Los campos marcados con * son obligatorios</div>
        </form>

        {experiencias.length > 0 && (
          <section aria-labelledby="tabla-experiencias-title">
            <h3 id="tabla-experiencias-title" className="sr-only">Lista de experiencias laborales registradas</h3>
            <div className="table-container">
              <table className="experiencia-table" role="table" aria-label="Experiencias laborales">
                <caption className="sr-only">
                  Tabla con {experiencias.length} experiencia{experiencias.length !== 1 ? 's' : ''} laboral{experiencias.length !== 1 ? 'es' : ''} registrada{experiencias.length !== 1 ? 's' : ''}
                </caption>
            <thead>
                  <tr role="row">
                    <th scope="col" role="columnheader">Empresa</th>
                    <th scope="col" role="columnheader">Cargo</th>
                    <th scope="col" role="columnheader">Tipo Vinculación</th>
                    <th scope="col" role="columnheader">Fecha Ingreso</th>
                    <th scope="col" role="columnheader">Fecha Salida</th>
                    <th scope="col" role="columnheader">Funciones</th>
                    <th scope="col" role="columnheader">Documento</th>
              </tr>
            </thead>
            <tbody>
              {experiencias.map((exp, idx) => (
                    <tr key={exp.id || idx} role="row">
                      <td role="cell">{exp.empresa}</td>
                      <td role="cell">{exp.cargo}</td>
                      <td role="cell">{exp.tipo_vinculacion}</td>
                      <td role="cell">{fmt(exp.fecha_inicio)}</td>
                      <td role="cell">{fmt(exp.fecha_salida)}</td>
                      <td role="cell">{exp.funciones}</td>
                      <td role="cell">
                        <div className="action-buttons">
                          <a
                            href={exp.archivoURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ver-btn"
                            aria-label={`Ver documento PDF de experiencia en ${exp.empresa}`}
                            title="Ver documento PDF"
                          >
                            Ver PDF
                          </a>
                          <button onClick={() => handleEdit(exp)} className="edit-btn">
                            Editar
                          </button>
                        </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </section>
        )}

        <footer>
          <button
            className="cerrar-formacion-btn"
            onClick={onClose}
            aria-label="Cerrar modal de experiencia laboral"
            title="Cerrar ventana"
          >
            Cerrar
          </button>
        </footer>

      </div>

      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  );
};

export default Experiencia;
