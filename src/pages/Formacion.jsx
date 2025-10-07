import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertContainer from "../components/AlertContainer";
import useAlert from "../hooks/useAlert";
import "./Formacion.css";

const Formacion = ({ empleado, onClose }) => {
  const [formaciones, setFormaciones] = useState([]);
  const [formData, setFormData] = useState({
    institucion: "",
    programa: "",
    tipo: "Seleccionar tipo...",
    nivel: "Seleccionar nivel...",
    graduado: "Seleccionar si es graduado...",
    fecha: "",
    archivo: null,
  });

  // Opciones de nivel según el tipo de formación
  const opcionesNivel = {
    "Formal": [
      "Bachiller",
      "Técnico profesional",
      "Tecnológico",
      "Profesional",
      "Especialización",
      "Maestría",
      "Doctorado"
    ],
    "No formal": [
      "Seminario",
      "Curso atención a víctimas de violencia sexual",
      "Curso soporte vital básico o avanzado",
      "Curso de humanización",
      "Curso de seguridad del paciente",
      "Otro curso"
    ]
  };
  const [editingForm, setEditingForm] = useState(null);
  const API_URL = "http://localhost:3000";
  
  // Hook para manejar alertas
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  useEffect(() => {
    const fetchFormaciones = async () => {
      if (!empleado?.id) return;
      
      try {
        const res = await axios.get(`${API_URL}/api/formacion/${empleado.id}`);
        const formacionesConArchivos = res.data.map((form) => ({
          ...form,
          archivoURL: `${API_URL}/uploads/${form.archivo}`,
        }));
        setFormaciones(formacionesConArchivos);
      } catch (error) {
        console.error("Error al cargar formaciones:", error);
      }
    };

    fetchFormaciones();
  }, [empleado?.id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "archivo") {
      setFormData({ ...formData, archivo: files[0] });
    } else if (name === "tipo") {
      // Cuando cambia el tipo, resetear el nivel
      setFormData({
        ...formData,
        [name]: value,
        nivel: "Seleccionar nivel..."
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Activar validaciones visuales
    
    if (!empleado?.id) {
      showError("No se ha seleccionado un empleado.");
      return;
    }
    
    // Validaciones específicas
    if (!formData.institucion || formData.institucion.trim() === "") {
      showError("La institución es obligatoria");
      return;
    }

    // Validar institución (solo letras, espacios y algunos caracteres especiales)
    const institucionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.\(\)]+$/;
    if (!institucionRegex.test(formData.institucion)) {
      showError("La institución solo puede contener letras, espacios, guiones, puntos y paréntesis");
      return;
    }

    if (!formData.programa || formData.programa.trim() === "") {
      showError("El programa es obligatorio");
      return;
    }

    // Validar programa (solo letras, espacios y algunos caracteres especiales)
    if (!institucionRegex.test(formData.programa)) {
      showError("El programa solo puede contener letras, espacios, guiones, puntos y paréntesis");
      return;
    }

    if (formData.tipo === "Seleccionar tipo...") {
      showError("Debe seleccionar un tipo de formación");
      return;
    }

    if (formData.nivel === "Seleccionar nivel...") {
      showError("Debe seleccionar un nivel educativo");
      return;
    }

    if (formData.graduado === "Seleccionar si es graduado...") {
      showError("Debe seleccionar si es graduado o no");
      return;
    }

    if (!formData.fecha) {
      showError("La fecha es obligatoria");
      return;
    }

    // Validar fecha - solo si es graduado, la fecha no puede ser futura
    const fechaFormacion = new Date(formData.fecha);
    const hoy = new Date();

    if (formData.graduado === "Sí" && fechaFormacion > hoy) {
      showError("La fecha de terminación no puede ser futura para una persona graduada");
      return;
    }

    // Validar que la fecha no sea muy antigua (más de 100 años)
    const fechaMinima = new Date();
    fechaMinima.setFullYear(fechaMinima.getFullYear() - 100);
    if (fechaFormacion < fechaMinima) {
      showError("La fecha no puede ser anterior a 1924");
      return;
    }

    if (!formData.archivo) {
      showError("Debe adjuntar un documento PDF");
      return;
    }

    const data = new FormData();
    data.append('empleado_id', empleado.id);
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const res = await axios.post(`${API_URL}/api/formacion`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nueva = {
        ...res.data,
        archivoURL: `${API_URL}/uploads/${res.data.archivo}`,
      };

      setFormaciones([nueva, ...formaciones]);
      setFormData({
        institucion: "",
        programa: "",
        tipo: "Seleccionar tipo...",
        nivel: "",
        graduado: "Seleccionar si es graduado...",
        fecha: "",
        archivo: null,
      });
    } catch (err) {
      console.error("Error al enviar datos:", err);
      showError("Error al guardar la formación: " + (err.response?.data?.error || err.message));
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  const handleEdit = (form) => {
    setEditingForm(form);
    
    // Formatear fechas para input type="date"
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      institucion: form.institucion,
      programa: form.programa,
      tipo: form.tipo,
      nivel: form.nivel,
      graduado: form.graduado,
      fecha: formatDateForInput(form.fecha),
      archivo: null, // No pre-cargar archivo existente
    });
  };

  const handleCancelEdit = () => {
    setEditingForm(null);
    setFormData({
      institucion: "",
      programa: "",
      tipo: "Seleccionar tipo...",
      nivel: "Seleccionar nivel...",
      graduado: "Seleccionar si es graduado...",
      fecha: "",
      archivo: null,
    });
  };

  const handleUpdateForm = async (e) => {
    e.preventDefault();
    
    
    if (!empleado?.id) {
      showError("No se ha seleccionado un empleado.");
      return;
    }
    
    // Validar campos obligatorios
    if (!formData.institucion || !formData.programa || 
        formData.tipo === "Seleccionar tipo..." || 
        formData.nivel === "Seleccionar nivel..." || 
        formData.graduado === "Seleccionar si es graduado..." || 
        !formData.fecha) {
      showError("Por favor, complete todos los campos obligatorios");
      return;
    }

    // Validar fecha - solo si es graduado, la fecha no puede ser futura
    const fechaFormacion = new Date(formData.fecha);
    const hoy = new Date();

    if (formData.graduado === "Sí" && fechaFormacion > hoy) {
      showError("La fecha de terminación no puede ser futura para una persona graduada");
      return;
    }

    // Validar que la fecha no sea muy antigua (más de 100 años)
    const fechaMinima = new Date();
    fechaMinima.setFullYear(fechaMinima.getFullYear() - 100);
    if (fechaFormacion < fechaMinima) {
      showError("La fecha no puede ser anterior a 1924");
      return;
    }

    const data = new FormData();
    data.append('empleado_id', empleado.id);
    
    // Solo enviar campos que han sido modificados o que no están vacíos
    if (formData.institucion) data.append('institucion', formData.institucion);
    if (formData.programa) data.append('programa', formData.programa);
    if (formData.tipo && formData.tipo !== "Seleccionar tipo...") data.append('tipo', formData.tipo);
    if (formData.nivel && formData.nivel !== "Seleccionar nivel...") data.append('nivel', formData.nivel);
    if (formData.graduado && formData.graduado !== "Seleccionar si es graduado...") data.append('graduado', formData.graduado);
    if (formData.fecha) data.append('fecha', formData.fecha);
    if (formData.archivo) data.append('archivo', formData.archivo);

    try {
      const res = await axios.put(`${API_URL}/api/formacion/${editingForm.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Actualizar la lista de formaciones
      const updatedFormaciones = formaciones.map(form =>
        form.id === editingForm.id
          ? { ...res.data, archivoURL: res.data.archivo ? `${API_URL}/uploads/${res.data.archivo}` : form.archivoURL }
          : form
      );
      setFormaciones(updatedFormaciones);
      
      handleCancelEdit();
    } catch (err) {
      console.error("Error al actualizar formación:", err);
      showError("Error al actualizar la formación: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="formacion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formacion-container">
          <h2>Formación Académica - {empleado?.nombre || 'Empleado'}</h2>

          <form className="formacion-form" onSubmit={editingForm ? handleUpdateForm : handleSubmit}>
            <div className="form-group">
              <label htmlFor="institucion">Institución *</label>
              <input type="text" name="institucion" placeholder="Institución" value={formData.institucion} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="programa">Programa *</label>
              <input type="text" name="programa" placeholder="Programa" value={formData.programa} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="tipo">Tipo de formación *</label>
              <select name="tipo" id="tipo" value={formData.tipo} onChange={handleChange} required>
                <option value="Seleccionar tipo..." disabled>Seleccionar tipo...</option>
                <option value="Formal">Formal</option>
                <option value="No formal">No formal</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="nivel">Nivel educativo *</label>
              <select name="nivel" id="nivel" value={formData.nivel} onChange={handleChange} required>
                <option value="Seleccionar nivel..." disabled>
                  {formData.tipo === "Seleccionar tipo..." ? "Primero seleccione el tipo" : "Seleccionar nivel..."}
                </option>
                {formData.tipo !== "Seleccionar tipo..." && opcionesNivel[formData.tipo]?.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="graduado">¿Graduado? *</label>
              <select name="graduado" id="graduado" value={formData.graduado} onChange={handleChange} required>
                <option value="Seleccionar si es graduado..." disabled>Seleccionar si es graduado...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="fecha">Fecha de terminación *</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            </div>
            <div className="form-group full">
              <label htmlFor="archivo">Documento PDF *</label>
              <div className={`file-input-wrapper ${formData.archivo ? 'has-file' : ''}`}>
                <input type="file" name="archivo" accept="application/pdf" onChange={handleChange} required />
                <div className="file-input-content">
                  <svg className="file-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <p className="file-input-text">
                    {formData.archivo ? 'Archivo seleccionado' : 'Seleccionar documento PDF'}
                  </p>
                  <p className="file-input-hint">Haz clic para seleccionar o arrastra el archivo aquí</p>
                </div>
              </div>
              {formData.archivo && (
                <div className="file-selected">
                  <svg className="file-selected-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <span className="file-selected-name">{formData.archivo.name}</span>
                </div>
              )}
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingForm ? 'Actualizar formación' : 'Agregar formación'}
              </button>
              {editingForm && (
                <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <table className="formacion-table">
            <thead>
              <tr>
                <th>Institución</th>
                <th>Programa</th>
                <th>Tipo</th>
                <th>Nivel</th>
                <th>Graduado</th>
                <th>Fecha de terminación</th>
                <th>Documento</th>
              </tr>
            </thead>
            <tbody>
              {formaciones.map((form, index) => (
                <tr key={index}>
                  <td>{form.institucion}</td>
                  <td>{form.programa}</td>
                  <td>{form.tipo}</td>
                  <td>{form.nivel}</td>
                  <td>{form.graduado}</td>
                  <td>{form.fecha}</td>
                  <td>
                    <div className="action-buttons">
                      <a href={form.archivoURL} target="_blank" rel="noopener noreferrer" className="view-btn">
                        Ver PDF
                      </a>
                      <button onClick={() => handleEdit(form)} className="edit-btn">
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="cerrar-formacion-btn" onClick={onClose}>Cerrar</button>
        </div>

      </div>

      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  );
};

export default Formacion;