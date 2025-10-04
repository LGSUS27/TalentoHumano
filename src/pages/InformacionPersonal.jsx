import { useState, useEffect } from "react";
import axios from "axios";
import AlertContainer from "../components/AlertContainer";
import useAlert from "../hooks/useAlert";
import "./InformacionPersonal.css";

const InformacionPersonal = ({ empleado, onClose }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: "Seleccionar tipo de documento...",
    numeroIdentificacion: "",
    fechaExpedicion: "",
    documentoPdf: null,
    imagenPersonal: null,
    nombres: "",
    apellidos: "",
    genero: "Seleccionar género...",
    fechaNacimiento: "",
    departamentoNacimiento: "Seleccionar departamento...",
    ciudadNacimiento: "Seleccionar ciudad...",
    email: "",
    direccion: "",
    telefono: "",
    rh: "Seleccionar RH...",
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingPdf, setExistingPdf] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [showReplacePdf, setShowReplacePdf] = useState(false);
  const [showReplaceImage, setShowReplaceImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  
  // Hook para manejar alertas
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  // Lista de departamentos de Colombia
  const departamentos = [
    "Seleccionar departamento...",
    "Huila",
    "Pitalito",
    "Garzón",
    "La Plata",
    "Campoalegre",
    "Gigante",
    "Aipe",
    "Palermo",
    "San Agustín",
    "Santa María",
    "Tierra del Socorro",
    "Uramita",
    "Villavicencio",
    "Yaguará",
    "Yaguaral",
    "Yopal",
    "Zapata",
    "Zona Bananera",
    "Caquetá",
    "San Vicente del Caguán",
    "Puerto Rico",
    "El Doncello",
    "Belén de Los Andaquies",
    "Morelia",
    "Cartagena del Chairá",
    "El Paujil",
    "El Piñon",
    "El Pital",
    "El Retorno",
    "El Rosario",
    "El Tabaco",
    "Guachené",
    "Tumaco",
    "San Andrés de Tierra Amarilla",
    "San Carlos",
    "San José de Guaviare",
    "San Juan de Pasto",
    "Amazonas",
    "Antioquia",
    "Arauca",
    "Atlántico",
    "Bolívar",
    "Boyacá",
    "Caldas",
    "Casanare",
    "Cauca",
    "Cesar",
    "Chocó",
    "Córdoba",
    "Cundinamarca",
    "Guainía",
    "Guaviare",
    "La Guajira",
    "Magdalena",
    "Meta",
    "Nariño",
    "Norte de Santander",
    "Putumayo",
    "Quindío",
    "Risaralda",
    "San Andrés y Providencia",
    "Santander",
    "Sucre",
    "Tolima",
    "Valle del Cauca",
    "Vaupés",
    "Vichada"
  ];

  // Lista de ciudades principales de Colombia
  const ciudades = [
    "Seleccionar ciudad...",
    "Neiva",
    "Bogotá",
    "Florencia",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Cúcuta",
    "Bucaramanga",
    "Pereira",
    "Santa Marta",
    "Ibagué",
    "Pasto",
    "Manizales",
    "Villavicencio",
    "Armenia",
    "Valledupar",
    "Montería",
    "Sincelejo",
    "Popayán",
    "Tunja",
    "Yopal",
    "Quibdó",
    "Riohacha",
    "San José del Guaviare",
    "Mocoa",
    "Arauca",
    "Leticia",
    "Inírida",
    "Mitú",
    "Puerto Carreño",
    "San Andrés"
  ];

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
          tipoDocumento: existingData.tipo_documento || "Seleccionar tipo de documento...",
          numeroIdentificacion: existingData.numero_identificacion || "",
          fechaExpedicion: formatDateForInput(existingData.fecha_expedicion),
          documentoPdf: null, // No cargamos el archivo existente
          imagenPersonal: null, // No cargamos el archivo existente
          nombres: existingData.nombres || "",
          apellidos: existingData.apellidos || "",
          genero: existingData.genero || "Seleccionar género...",
          fechaNacimiento: formatDateForInput(existingData.fecha_nacimiento),
          departamentoNacimiento: existingData.departamento_nacimiento || "Seleccionar departamento...",
          ciudadNacimiento: existingData.ciudad_nacimiento || "Seleccionar ciudad...",
          email: existingData.email || "",
          direccion: existingData.direccion || "",
          telefono: existingData.telefono || "",
          rh: existingData.rh || "Seleccionar RH...",
        });
        
        // Guardar información del PDF existente
        if (existingData.documento_pdf) {
          setExistingPdf(existingData.documento_pdf);
        }
        
        // Guardar información de la imagen existente
        if (existingData.imagen_personal) {
          setExistingImage(existingData.imagen_personal);
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
    } else if (type === "file" && name === "imagenPersonal") {
      // Manejar imagen personal
      const selectedFile = files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        imagenPersonal: selectedFile,
      }));
      
      // Crear preview de la imagen
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setImagePreview(null);
      }
    } else if (type !== "file") {
      // Capitalizar automáticamente las iniciales para campos de nombres
      if (name === 'nombres' || name === 'apellidos') {
        const palabras = value.split(' ');
        const palabrasCapitalizadas = palabras.map(palabra => {
          if (palabra.length > 0) {
            return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
          }
          return palabra;
        });
        setFormData((prev) => ({
          ...prev,
          [name]: palabrasCapitalizadas.join(' '),
        }));
      } else {
        // Para todos los otros campos que no sean archivos
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleKeyDown = (e) => {
    const { name } = e.target;
    
    // Para campos de nombres y apellidos, solo permitir letras y espacios
    if (name === 'nombres' || name === 'apellidos') {
      const allowedChars = /[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/;
      if (!allowedChars.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!empleado?.id) {
      showError("No se ha seleccionado un empleado");
      return;
    }

    // Validaciones específicas de campos
    if (!formData.tipoDocumento || formData.tipoDocumento === "Seleccionar tipo de documento...") {
      showError("Debe seleccionar un tipo de documento");
      return;
    }

    if (!formData.numeroIdentificacion || formData.numeroIdentificacion.trim() === "") {
      showError("El número de identificación es obligatorio");
      return;
    }

    // Validar formato de cédula (solo números, entre 6 y 12 dígitos)
    const cedulaRegex = /^\d{6,12}$/;
    if (!cedulaRegex.test(formData.numeroIdentificacion)) {
      showError("El número de identificación debe contener solo números (6-12 dígitos)");
      return;
    }

    if (!formData.fechaExpedicion) {
      showError("La fecha de expedición es obligatoria");
      return;
    }

    if (!formData.nombres || formData.nombres.trim() === "") {
      showError("Los nombres son obligatorios");
      return;
    }

    // Validar nombres (solo letras y espacios)
    const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombresRegex.test(formData.nombres)) {
      showError("Los nombres solo pueden contener letras y espacios");
      return;
    }

    if (!formData.apellidos || formData.apellidos.trim() === "") {
      showError("Los apellidos son obligatorios");
      return;
    }

    // Validar apellidos (solo letras y espacios)
    if (!nombresRegex.test(formData.apellidos)) {
      showError("Los apellidos solo pueden contener letras y espacios");
      return;
    }

    if (!formData.genero || formData.genero === "Seleccionar género...") {
      showError("Debe seleccionar un género");
      return;
    }

    if (!formData.fechaNacimiento) {
      showError("La fecha de nacimiento es obligatoria");
      return;
    }

    // Validar que la fecha de nacimiento no sea futura
    const fechaNacimiento = new Date(formData.fechaNacimiento);
    const hoy = new Date();
    if (fechaNacimiento > hoy) {
      showError("La fecha de nacimiento no puede ser futura");
      return;
    }

    if (!formData.departamentoNacimiento || formData.departamentoNacimiento === "Seleccionar departamento...") {
      showError("Debe seleccionar un departamento de nacimiento");
      return;
    }

    if (!formData.ciudadNacimiento || formData.ciudadNacimiento === "Seleccionar ciudad...") {
      showError("Debe seleccionar una ciudad de nacimiento");
      return;
    }

    // Validar email si se proporciona
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        showError("El formato del email no es válido. Debe contener @ y un dominio válido (.com, .co, .org, etc.)");
        return;
      }
    }

    // Validar teléfono si se proporciona
    if (formData.telefono && formData.telefono.trim() !== "") {
      const telefonoRegex = /^\d{7,15}$/;
      if (!telefonoRegex.test(formData.telefono)) {
        showError("El teléfono debe contener solo números (7-15 dígitos)");
        return;
      }
    }

    // Validar RH si se proporciona
    if (formData.rh && formData.rh === "Seleccionar RH...") {
      showError("Si proporciona RH, debe seleccionar una opción válida");
      return;
    }

    // Validar que se tenga al menos un PDF (existente o nuevo)
    if (!existingPdf && !formData.documentoPdf) {
      showError("Debe adjuntar un documento PDF");
      return;
    }

    const data = new FormData();
    
    // Agregar empleado_id
    data.append('empleado_id', empleado.id);
    
    // Agregar todos los campos del formulario excepto archivos
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "" && k !== 'documentoPdf' && k !== 'imagenPersonal') {
        data.append(k, v);
      }
    });
    
    // Agregar archivos solo si existen
    if (formData.documentoPdf) {
      data.append('documentoPdf', formData.documentoPdf);
    }
    
    if (formData.imagenPersonal) {
      data.append('imagenPersonal', formData.imagenPersonal);
    }

    try {
      setSubmitting(true);
      await axios.post("http://localhost:3000/api/informacion-personal", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Datos guardados con éxito");
      onClose();
    } catch (error) {
      console.error("Error al guardar la información:", error);
      const msg = error?.response?.data?.message || "Ocurrió un error al enviar los datos";
      showError(msg);
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

  const handleReplaceImage = (e) => {
    e.preventDefault(); // Prevenir el submit del formulario
    e.stopPropagation(); // Prevenir la propagación del evento
    console.log("Iniciando reemplazo de imagen");
    setShowReplaceImage(true);
    // Limpiar cualquier archivo previo del estado
    setFormData((prev) => ({
      ...prev,
      imagenPersonal: null,
    }));
    setImagePreview(null);
  };

  const handleCancelReplaceImage = (e) => {
    e.preventDefault(); // Prevenir el submit del formulario
    e.stopPropagation(); // Prevenir la propagación del evento
    console.log("Cancelando reemplazo de imagen");
    setShowReplaceImage(false);
    
    // Limpiar el input de archivo del DOM
    setTimeout(() => {
      const fileInput = document.querySelector('input[name="imagenPersonal"]');
      if (fileInput) {
        fileInput.value = '';
      }
    }, 0);
    
    // Limpiar el archivo del estado del formulario
    setFormData((prev) => ({
      ...prev,
      imagenPersonal: null,
    }));
    setImagePreview(null);
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
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              required
            >
              <option value="Seleccionar tipo de documento..." disabled>Seleccionar tipo de documento...</option>
              <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
              <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
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
              onKeyDown={(e) => {
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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
            Departamento de nacimiento *
            <select
              name="departamentoNacimiento"
              value={formData.departamentoNacimiento}
              onChange={handleChange}
              required
            >
              {departamentos.map((departamento, index) => (
                <option key={index} value={departamento} disabled={index === 0}>
                  {departamento}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ciudad de nacimiento *
            <select
              name="ciudadNacimiento"
              value={formData.ciudadNacimiento}
              onChange={handleChange}
              required
            >
              {ciudades.map((ciudad, index) => (
                <option key={index} value={ciudad} disabled={index === 0}>
                  {ciudad}
                </option>
              ))}
            </select>
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
              onKeyDown={(e) => {
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
                  <span className="pdf-name">
                    <svg className="pdf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    {existingPdf}
                  </span>
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
                <div className={`file-input-wrapper ${formData.documentoPdf ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    name="documentoPdf"
                    accept="application/pdf"
                    onChange={handleChange}
                    required={!existingPdf}
                  />
                  <div className="file-input-content">
                    <svg className="file-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    <p className="file-input-text">
                      {formData.documentoPdf ? 'Archivo seleccionado' : 'Seleccionar documento PDF'}
                    </p>
                    <p className="file-input-hint">Haz clic para seleccionar o arrastra el archivo aquí</p>
                  </div>
                </div>
                {formData.documentoPdf && (
                  <div className="file-selected">
                    <svg className="file-selected-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    <span className="file-selected-name">{formData.documentoPdf.name}</span>
                  </div>
                )}
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

        {/* Sección de Imagen Personal */}
        <div className="image-section">
          <label>
            Imagen Personal:
            
            {/* Mostrar imagen existente solo si hay datos iniciales cargados */}
            {hasInitialData && existingImage && !showReplaceImage && (
              <div className="existing-image-section">
                <div className="image-preview-container">
                  <img
                    src={`http://localhost:3000/uploads/${existingImage}`}
                    alt="Imagen personal existente"
                    className="existing-image"
                  />
                  <div className="image-actions">
                    <button
                      type="button"
                      onClick={handleReplaceImage}
                      className="replace-image-btn"
                    >
                      Reemplazar imagen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mostrar input de archivo cuando no hay imagen existente o se está reemplazando */}
            {hasInitialData && (!existingImage || showReplaceImage) && (
              <div className="image-upload-section">
                <div className="image-preview-container">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview de imagen"
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <svg className="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <p>Selecciona una imagen</p>
                    </div>
                  )}
                </div>
                <div className={`file-input-wrapper ${formData.imagenPersonal ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    name="imagenPersonal"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <div className="file-input-content">
                    <svg className="file-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p className="file-input-text">
                      {formData.imagenPersonal ? 'Imagen seleccionada' : 'Seleccionar imagen personal'}
                    </p>
                    <p className="file-input-hint">Haz clic para seleccionar o arrastra la imagen aquí</p>
                  </div>
                </div>
                {formData.imagenPersonal && (
                  <div className="file-selected">
                    <svg className="file-selected-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="file-selected-name">{formData.imagenPersonal.name}</span>
                  </div>
                )}
                {showReplaceImage && (
                  <div className="replace-actions">
                    <button
                      type="button"
                      onClick={handleCancelReplaceImage}
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

      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  );
};

export default InformacionPersonal;