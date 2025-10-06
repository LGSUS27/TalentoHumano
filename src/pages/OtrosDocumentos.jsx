import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AlertContainer from "../components/AlertContainer";
import ConfirmDialog from "../components/ConfirmDialog";
import useAlert from "../hooks/useAlert";
import "./OtrosDocumentos.css";

const API = "http://localhost:3000/api";
const UPLOADS_URL = "http://localhost:3000/uploads/otros-documentos";

// Nombres EXACTOS de las columnas en la BD:
const CAMPOS = [
  { label: "Contrato", name: "contrato" },
  { label: "Libreta militar", name: "libreta_militar" },
  { label: "Antecedentes disciplinarios", name: "antecedentes_disciplinarios" },
  { label: "RUT", name: "rut" },
  { label: "RETHUS (opcional)", name: "rethus" },
  { label: "Afiliación ARL", name: "arl" },
  { label: "Afiliación EPS", name: "eps" },
  { label: "Afiliación AFP", name: "afp" },
  { label: "Caja de Compensación Familiar", name: "caja_compensacion" },
  { label: "Examen Médico de Ingreso", name: "examen_ingreso" },
  { label: "Examen Médico Periódico", name: "examen_periodico" },
  { label: "Examen Médico de Egreso", name: "examen_egreso" },
  { label: "Documentos del proceso de selección", name: "documentos_seleccion" },
  // Nuevos campos agregados
  { label: "Tarjeta profesional", name: "tarjeta_profesional" },
  { label: "Intereses de conflictos (T-FO-029)", name: "intereses_conflictos_tfo029" },
  { label: "Carnet de vacunación", name: "carnet_vacunacion" },
  { label: "Póliza de responsabilidad civil de médicos a terceros", name: "poliza_responsabilidad_civil" },
  { label: "Certificado de cuenta bancaria", name: "certificado_cuenta_bancaria" },
  { label: "Contrato vigente", name: "contrato_vigente" },
  { label: "Contrato liquidado", name: "contrato_liquidado" },
];

// Campo especial para múltiples contratos Otrosis
const CONTRATOS_OTROSIS_FIELD = "contratos_otrosis";

const MAX_MB = 10;

const OtrosDocumentos = ({ empleado, onClose }) => {
  const empleadoId = empleado?.id;
  
  // Hook para manejar alertas
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  const initialArchivos = useMemo(
    () => Object.fromEntries(CAMPOS.map(c => [c.name, null])),
    []
  );

  const [archivos, setArchivos] = useState(initialArchivos);
  const [contratosOtrosis, setContratosOtrosis] = useState([]); // Array de archivos para contratos Otrosis
  const [existentes, setExistentes] = useState(null); // fila de otros_documentos o null
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const hayCambios = useMemo(
    () => Object.values(archivos).some(Boolean) || contratosOtrosis.length > 0,
    [archivos, contratosOtrosis]
  );

  // --- Cargar lo que existe en BD ---
  useEffect(() => {
    if (!empleadoId) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/otros-documentos/empleado/${empleadoId}`);
        if (!cancel) setExistentes(data?.data || null);
      } catch (e) {
        console.error("Error al cargar otros_documentos:", e);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [empleadoId]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    if (file) {
      if (file.type !== "application/pdf") {
        showError("Solo se permiten archivos PDF");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        showError(`El archivo no puede superar ${MAX_MB} MB`);
        return;
      }
    }
    setArchivos(prev => ({ ...prev, [name]: file }));
  };

  const handleContratosOtrosisChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    // Validar límite de contratos Otrosis
    const currentCount = contratosOtrosis.length;
    if (currentCount + files.length > 10) {
      showError(`Máximo 10 contratos Otrosis permitidos. Ya tienes ${currentCount} seleccionados.`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.type !== "application/pdf") {
        showError(`Solo se permiten archivos PDF: ${file.name}`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        showError(`El archivo ${file.name} no puede superar ${MAX_MB} MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setContratosOtrosis(prev => [...prev, ...validFiles]);
    }
  };

  const removeContratoOtrosis = (index) => {
    setContratosOtrosis(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empleadoId) return showError("Falta empleado_id");
    if (!hayCambios) return showError("No seleccionaste archivos nuevos");

    // Validar límite total de archivos
    const archivosNormales = Object.values(archivos).filter(Boolean).length;
    const totalArchivos = archivosNormales + contratosOtrosis.length;
    
    if (totalArchivos > 30) {
      showError(`Máximo 30 archivos permitidos en total. Tienes ${totalArchivos} seleccionados.`);
      return;
    }

    const data = new FormData();
    data.append("empleado_id", empleadoId);
    
    // Agregar archivos normales
    for (const campo of CAMPOS) {
      const f = archivos[campo.name];
      if (f) data.append(campo.name, f);
    }

    // Agregar contratos Otrosis
    contratosOtrosis.forEach(file => {
      data.append(CONTRATOS_OTROSIS_FIELD, file);
    });

    try {
      setSubmitting(true);
      const resp = await axios.post(`${API}/otros-documentos`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // el backend devuelve { success, data: row }
      setExistentes(resp?.data?.data || null);
      setArchivos(initialArchivos); // limpiar selección
      setContratosOtrosis([]); // limpiar contratos Otrosis
      showSuccess("Documentos guardados exitosamente");
    } catch (err) {
      console.error("Error al enviar documentos:", err);
      showError("Ocurrió un error al guardar los documentos");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = (campoName) => {
    if (!empleadoId) return;
    setConfirmAction(() => () => eliminarDocumento(campoName));
    setShowConfirm(true);
  };

  const handleEliminarContratoOtrosis = (filename) => {
    if (!empleadoId) return;
    setConfirmAction(() => () => eliminarContratoOtrosis(filename));
    setShowConfirm(true);
  };

  const eliminarDocumento = async (campoName) => {
    try {
      await axios.delete(`${API}/otros-documentos/empleado/${empleadoId}/campo/${campoName}`);
      setExistentes(prev => (prev ? { ...prev, [campoName]: null } : prev));
      showSuccess("Documento eliminado exitosamente");
    } catch (e) {
      console.error("Error al eliminar documento:", e);
      showError("No se pudo eliminar el documento");
    }
  };

  const eliminarContratoOtrosis = async (filename) => {
    try {
      await axios.delete(`${API}/otros-documentos/empleado/${empleadoId}/contrato-otrosis/${filename}`);
      setExistentes(prev => {
        if (!prev || !prev[CONTRATOS_OTROSIS_FIELD]) return prev;
        const contratosActualizados = prev[CONTRATOS_OTROSIS_FIELD].filter(c => c.filename !== filename);
        return { ...prev, [CONTRATOS_OTROSIS_FIELD]: contratosActualizados };
      });
      showSuccess("Contrato Otrosis eliminado exitosamente");
    } catch (e) {
      console.error("Error al eliminar contrato Otrosis:", e);
      showError("No se pudo eliminar el contrato Otrosis");
    }
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="otros-docs-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Otros Documentos — {empleado?.nombres} {empleado?.apellidos}</h2>

        {loading ? (
          <p>Cargando…</p>
        ) : (
          <form className="otros-docs-form" onSubmit={handleSubmit}>
            {/* Indicador de límites */}
            <div className="limites-info">
              <div className="limite-total">
                Archivos seleccionados: {Object.values(archivos).filter(Boolean).length + contratosOtrosis.length}/30
              </div>
              <div className="limite-contratos">
                Contratos Otrosis: {contratosOtrosis.length}/10
              </div>
            </div>
            {CAMPOS.map(({ label, name }) => {
              const actual = existentes?.[name] || null;
              const seleccionado = archivos[name];
              const tienePdf = !!actual;

              return (
                <div className="campo-file" key={name}>
                  <label>{label}:</label>

                  {/* Zona de estado actual */}
                  <div className="archivo-actual">
                    {tienePdf ? (
                      <>
                        <a
                          className="btn-view"
                          href={`${UPLOADS_URL}/${actual}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver PDF
                        </a>
                        <button
                          type="button"
                          className="btn-link btn-danger"
                          onClick={() => handleEliminar(name)}
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <span className="sin-archivo">Sin archivo</span>
                    )}
                  </div>

                  {/* Nuevos / reemplazos */}
                  <div className={`file-input-wrapper ${seleccionado ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    name={name}
                    accept="application/pdf"
                    onChange={handleChange}
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
                        {seleccionado ? 'Archivo seleccionado' : 'Seleccionar documento PDF'}
                      </p>
                      <p className="file-input-hint">Haz clic para seleccionar o arrastra el archivo aquí</p>
                    </div>
                  </div>
                  {seleccionado && (
                    <div className="file-selected">
                      <svg className="file-selected-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      <span className="file-selected-name">{seleccionado.name}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Sección especial para Contratos Otrosis */}
            <div className="campo-file contratos-otrosis-section">
              <label>Contratos Otrosis:</label>
              
              {/* Mostrar contratos existentes */}
              {existentes?.[CONTRATOS_OTROSIS_FIELD]?.length > 0 && (
                <div className="contratos-existentes">
                  {existentes[CONTRATOS_OTROSIS_FIELD].map((contrato, index) => (
                    <div key={contrato.filename} className="contrato-existente">
                      <a
                        className="btn-view"
                        href={`${UPLOADS_URL}/${contrato.filename}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver: {contrato.originalName}
                      </a>
                      <button
                        type="button"
                        className="btn-link btn-danger"
                        onClick={() => handleEliminarContratoOtrosis(contrato.filename)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mostrar contratos seleccionados para subir */}
              {contratosOtrosis.length > 0 && (
                <div className="contratos-seleccionados">
                  {contratosOtrosis.map((file, index) => (
                    <div key={index} className="contrato-seleccionado">
                      <span className="file-selected-name">{file.name}</span>
                      <button
                        type="button"
                        className="btn-link btn-danger btn-sm"
                        onClick={() => removeContratoOtrosis(index)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input para seleccionar múltiples archivos */}
              <div className="file-input-wrapper contratos-otrosis-input">
                <input
                  type="file"
                  name={CONTRATOS_OTROSIS_FIELD}
                  accept="application/pdf"
                  multiple
                  onChange={handleContratosOtrosisChange}
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
                    {contratosOtrosis.length > 0 
                      ? `${contratosOtrosis.length}/10 archivo(s) seleccionado(s)` 
                      : 'Seleccionar contratos Otrosis (múltiples PDFs)'
                    }
                  </p>
                  <p className="file-input-hint">
                    {contratosOtrosis.length < 10 
                      ? `Puedes seleccionar hasta ${10 - contratosOtrosis.length} archivo(s) más`
                      : 'Límite de archivos alcanzado'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="otros-docs-buttons">
              <button type="button" className="cerrar-btn" onClick={onClose}>
                Cerrar
              </button>
              <button type="submit" className="guardar-btn" disabled={!hayCambios || submitting}>
                {submitting ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Contenedor de alertas */}
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirmar eliminación"
        message="¿Eliminar este documento? Esta acción no se puede deshacer."
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default OtrosDocumentos;
