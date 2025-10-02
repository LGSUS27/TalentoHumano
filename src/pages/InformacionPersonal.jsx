import { useState, useEffect } from "react";
import axios from "axios";
import "./InformacionPersonal.css";

const InformacionPersonal = ({ empleado, onClose }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    numeroIdentificacion: "",
    fechaExpedicion: "",
    documentoPdf: null,
    nombres: "",
    apellidos: "",
    genero: "Seleccionar género...",
    fechaNacimiento: "",
    departamentoNacimiento: "",
    ciudadNacimiento: "",
    email: "",
    direccion: "",
    telefono: "",
    rh: "Seleccionar RH...",
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingPdf, setExistingPdf] = useState(null);
  const [showReplacePdf, setShowReplacePdf] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Cargar datos existentes del empleado
  useEffect(() => {
    if (empleado?.id) {
      loadExistingData();
    }
  }, [empleado?.id]);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/informacion-personal/empleado/${empleado.id}`);
      
      if (response.data?.success && response.data?.data) {
        const existingData = response.data.data;
        
        // Formatear fechas para input type="date"
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          tipoDocumento: existingData.tipo_documento || "",
          numeroIdentificacion: existingData.numero_identificacion || "",
          fechaExpedicion: formatDateForInput(existingData.fecha_expedicion),
          documentoPdf: null, // No cargamos el archivo existente
          nombres: existingData.nombres || "",
          apellidos: existingData.apellidos || "",
          genero: existingData.genero || "Seleccionar género...",
          fechaNacimiento: formatDateForInput(existingData.fecha_nacimiento),
          departamentoNacimiento: existingData.departamento_nacimiento || "",
          ciudadNacimiento: existingData.ciudad_nacimiento || "",
          email: existingData.email || "",
          direccion: existingData.direccion || "",
          telefono: existingData.telefono || "",
          rh: existingData.rh || "Seleccionar RH...",
        });
        
        // Guardar información del PDF existente
        if (existingData.documento_pdf) {
          setExistingPdf(existingData.documento_pdf);
        }
        
        // Marcar que ya se cargaron los datos iniciales
        setHasInitialData(true);
      } else {
        // No hay datos existentes, marcar como cargado
        setHasInitialData(true);
      }
    } catch (error) {
      console.log("No hay datos existentes o error al cargar:", error);
      // Si no hay datos existentes, no es un error grave
      setHasInitialData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file" && name === "documentoPdf") {
      // Solo actualizar el archivo si realmente se seleccionó uno
      const selectedFile = files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        documentoPdf: selectedFile,
      }));
    } else if (type !== "file") {
      // Para todos los otros campos que no sean archivos
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!empleado?.id) {
      alert("Error: No se ha seleccionado un empleado");
      return;
    }

    // Validaciones específicas de campos
    if (!formData.tipoDocumento || formData.tipoDocumento.trim() === "") {
      alert("Error: El tipo de documento es obligatorio");
      return;
    }

    if (!formData.numeroIdentificacion || formData.numeroIdentificacion.trim() === "") {
      alert("Error: El número de identificación es obligatorio");
      return;
    }

    // Validar formato de cédula (solo números, entre 6 y 12 dígitos)
    const cedulaRegex = /^\d{6,12}$/;
    if (!cedulaRegex.test(formData.numeroIdentificacion)) {
      alert("Error: El número de identificación debe contener solo números (6-12 dígitos)");
      return;
    }

    if (!formData.fechaExpedicion) {
      alert("Error: La fecha de expedición es obligatoria");
      return;
    }

    if (!formData.nombres || formData.nombres.trim() === "") {
      alert("Error: Los nombres son obligatorios");
      return;
    }

    // Validar nombres (solo letras y espacios)
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombresRegex.test(formData.nombres)) {
      alert("Error: Los nombres solo pueden contener letras y espacios");
      return;
    }

    if (!formData.apellidos || formData.apellidos.trim() === "") {
      alert("Error: Los apellidos son obligatorios");
      return;
    }

    // Validar apellidos (solo letras y espacios)
    if (!nombresRegex.test(formData.apellidos)) {
      alert("Error: Los apellidos solo pueden contener letras y espacios");
      return;
    }

    if (!formData.genero || formData.genero === "Seleccionar género...") {
      alert("Error: Debe seleccionar un género");
      return;
    }

    if (!formData.fechaNacimiento) {
      alert("Error: La fecha de nacimiento es obligatoria");
      return;
    }

    // Validar que la fecha de nacimiento no sea futura
    const fechaNacimiento = new Date(formData.fechaNacimiento);
    const hoy = new Date();
    if (fechaNacimiento > hoy) {
      alert("Error: La fecha de nacimiento no puede ser futura");
      return;
    }

    if (!formData.departamentoNacimiento || formData.departamentoNacimiento.trim() === "") {
      alert("Error: El departamento de nacimiento es obligatorio");
      return;
    }

    if (!formData.ciudadNacimiento || formData.ciudadNacimiento.trim() === "") {
      alert("Error: La ciudad de nacimiento es obligatoria");
      return;
    }

    // Validar email si se proporciona
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        alert("Error: El formato del email no es válido. Debe contener @ y un dominio válido (.com, .co, .org, etc.)");
        return;
      }
    }

    // Validar teléfono si se proporciona
    if (formData.telefono && formData.telefono.trim() !== "") {
      const telefonoRegex = /^\d{7,15}$/;
      if (!telefonoRegex.test(formData.telefono)) {
        alert("Error: El teléfono debe contener solo números (7-15 dígitos)");
        return;
      }
    }

    // Validar RH si se proporciona
    if (formData.rh && formData.rh === "Seleccionar RH...") {
      alert("Error: Si proporciona RH, debe seleccionar una opción válida");
      return;
    }

    // Validar que se tenga al menos un PDF (existente o nuevo)
    if (!existingPdf && !formData.documentoPdf) {
      alert("Error: Debe adjuntar un documento PDF");
      return;
    }

    const data = new FormData();
    
    // Agregar empleado_id
    data.append('empleado_id', empleado.id);
    
    // Agregar todos los campos del formulario
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") {
        data.append(k, v);
      }
    });

    try {
      setSubmitting(true);
      await axios.post("http://localhost:3000/api/informacion-personal", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Datos guardados con éxito ✅");
      onClose();
    } catch (error) {
      console.error("Error al guardar la información:", error);
      const msg = error?.response?.data?.message || "Ocurrió un error al enviar los datos";
      alert(`${msg} ❌`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplacePdf = (e) => {
    e.preventDefault(); // Prevenir el submit del formulario
    e.stopPropagation(); // Prevenir la propagación del evento
    console.log("Iniciando reemplazo de PDF");
    setShowReplacePdf(true);
    // Limpiar cualquier archivo previo del estado
    setFormData((prev) => ({
      ...prev,
      documentoPdf: null,
    }));
  };

  const handleCancelReplace = (e) => {
    e.preventDefault(); // Prevenir el submit del formulario
    e.stopPropagation(); // Prevenir la propagación del evento
    console.log("Cancelando reemplazo de PDF");
    setShowReplacePdf(false);
    
    // Limpiar el input de archivo del DOM
    setTimeout(() => {
      const fileInput = document.querySelector('input[name="documentoPdf"]');
      if (fileInput) {
        fileInput.value = '';
      }
    }, 0);
    
    // Limpiar el archivo del estado del formulario
    setFormData((prev) => ({
      ...prev,
      documentoPdf: null,
    }));
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Información Personal</h3>
          <p>Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Información Personal - {empleado?.nombre}</h3>

        <form className="info-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <label>
            Tipo de documento:
            <input
              type="text"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Número de identificación:
            <input
              type="text"
              name="numeroIdentificacion"
              value={formData.numeroIdentificacion}
              onChange={handleChange}
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

          <label>
            Fecha de expedición:
            <input
              type="date"
              name="fechaExpedicion"
              value={formData.fechaExpedicion}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Nombres:
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
              title="Solo letras y espacios"
              required
            />
          </label>

          <label>
            Apellidos:
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
              title="Solo letras y espacios"
              required
            />
          </label>

          <label>
            Género:
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
            >
              <option value="Seleccionar género..." disabled>Seleccionar género...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label>
            Fecha de nacimiento:
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Departamento de nacimiento:
            <input
              type="text"
              name="departamentoNacimiento"
              value={formData.departamentoNacimiento}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Ciudad de nacimiento:
            <input
              type="text"
              name="ciudadNacimiento"
              value={formData.ciudadNacimiento}
              onChange={handleChange}
              required
            />
          </label>

          {/* Nuevos campos */}
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@dominio.com"
              title="Formato de email válido"
            />
          </label>

          <label>
            Dirección:
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Calle 12 #34-56, Barrio"
            />
          </label>

          <label>
            Teléfono:
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="3001234567"
              pattern="[0-9]{7,15}"
              title="Solo números, entre 7 y 15 dígitos"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                  e.preventDefault();
                }
              }}
            />
          </label>

          <label>
            RH:
            <select name="rh" value={formData.rh} onChange={handleChange}>
              <option value="Seleccionar RH..." disabled>Seleccionar RH...</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </label>
        </form>

        {/* Sección de PDF separada del formulario */}
        <div className="pdf-section">
          <label>
            Documento de identificación (PDF):
            
            {/* Mostrar PDF existente solo si hay datos iniciales cargados */}
            {hasInitialData && existingPdf && !showReplacePdf && (
              <div className="existing-pdf-section">
                <div className="pdf-info">
                  <span className="pdf-name">📄 {existingPdf}</span>
                  <div className="pdf-actions">
                    <a
                      href={`http://localhost:3000/uploads/${existingPdf}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-pdf-btn"
                    >
                      Ver PDF
                    </a>
                    <button
                      type="button"
                      onClick={handleReplacePdf}
                      className="replace-pdf-btn"
                    >
                      Reemplazar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mostrar input de archivo cuando no hay PDF existente o se está reemplazando */}
            {hasInitialData && (!existingPdf || showReplacePdf) && (
              <div className="pdf-upload-section">
                <input
                  type="file"
                  name="documentoPdf"
                  accept="application/pdf"
                  onChange={handleChange}
                  required={!existingPdf}
                />
                {showReplacePdf && (
                  <div className="replace-actions">
                    <button 
                      type="button" 
                      onClick={handleCancelReplace}
                      className="cancel-replace-btn"
                    >
                      Cancelar reemplazo
                    </button>
                  </div>
                )}
              </div>
            )}
          </label>
        </div>

        {/* Botones del formulario */}
        <div className="form-buttons">
          <button type="submit" className="guardar-btn" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Guardando…" : "Guardar"}
          </button>
          <button type="button" className="cancelar-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InformacionPersonal;