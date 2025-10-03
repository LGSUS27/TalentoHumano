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
];

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
  const [existentes, setExistentes] = useState(null); // fila de otros_documentos o null
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const hayCambios = useMemo(
    () => Object.values(archivos).some(Boolean),
    [archivos]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empleadoId) return showError("Falta empleado_id");
    if (!hayCambios) return showError("No seleccionaste archivos nuevos");

    const data = new FormData();
    data.append("empleado_id", empleadoId);
    for (const campo of CAMPOS) {
      const f = archivos[campo.name];
      if (f) data.append(campo.name, f);
    }

    try {
      setSubmitting(true);
      const resp = await axios.post(`${API}/otros-documentos`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // el backend devuelve { success, data: row }
      setExistentes(resp?.data?.data || null);
      setArchivos(initialArchivos); // limpiar selección
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
                  <input
                    type="file"
                    name={name}
                    accept="application/pdf"
                    onChange={handleChange}
                  />
                  {seleccionado && <small>Seleccionado: {seleccionado.name}</small>}
                </div>
              );
            })}

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
