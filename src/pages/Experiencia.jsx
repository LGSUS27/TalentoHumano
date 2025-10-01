import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const API_URL = "http://localhost:3000";

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
    
    if (!empleado?.id) {
      alert("Error: No se ha seleccionado un empleado.");
      return;
    }
    
    if (!formData.archivo) {
      alert("Debes adjuntar un documento PDF.");
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
      alert("Error al guardar experiencia: " + (err.response?.data?.error || err.message));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="experiencia-container" onClick={(e) => e.stopPropagation()}>
        <h2>Experiencia Laboral - {empleado?.nombre || 'Empleado'}</h2>

        <form className="experiencia-form" onSubmit={handleSubmit}>
          <input name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Empresa" required />
          <input name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Cargo" required />
          <input name="tipoVinculacion" value={formData.tipoVinculacion} onChange={handleChange} placeholder="Tipo de vinculación" required />
          <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} required />
          <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} required />
          <textarea className="full" name="funciones" value={formData.funciones} onChange={handleChange} placeholder="Funciones" required />
          <input className="full" type="file" name="archivo" accept="application/pdf" onChange={handleChange} required />
          <button className="btn-primary full" type="submit">Agregar Experiencia</button>
        </form>

        {experiencias.length > 0 && (
          <table className="experiencia-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Cargo</th>
                <th>Tipo Vinculación</th>
                <th>Fecha Ingreso</th>
                <th>Fecha Salida</th>
                <th>Funciones</th>
                <th>Documento</th>
              </tr>
            </thead>
            <tbody>
              {experiencias.map((exp, idx) => (
                <tr key={idx}>
                  <td>{exp.empresa}</td>
                  <td>{exp.cargo}</td>
                  <td>{exp.tipo_vinculacion}</td>
                  <td>{fmt(exp.fecha_inicio)}</td>
                  <td>{fmt(exp.fecha_salida)}</td>
                  <td>{exp.funciones}</td>
                  <td>
                    <button className="ver-btn" onClick={() => setVistaPrevia(exp.archivoURL)}>Ver PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button className="cerrar-formacion-btn" onClick={onClose}>Cerrar</button>

        {vistaPrevia && (
          <div className="pdf-modal">
            <div className="pdf-modal-content">
              <button className="cerrar-pdf" onClick={() => setVistaPrevia(null)}>X</button>
              <iframe src={vistaPrevia} title="PDF" width="100%" height="500px" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Experiencia;
