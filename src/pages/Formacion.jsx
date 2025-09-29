import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Formacion.css";

const Formacion = ({ onClose }) => {
  const [formaciones, setFormaciones] = useState([]);
  const [formData, setFormData] = useState({
    institucion: "",
    programa: "",
    tipo: "",
    nivel: "",
    graduado: "Sí",
    fecha: "",
    archivo: null,
  });
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchFormaciones = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/formacion`);
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
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "archivo") {
      setFormData({ ...formData, archivo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.archivo) {
      alert("Debes adjuntar un documento PDF.");
      return;
    }

    const data = new FormData();
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
        tipo: "",
        nivel: "",
        graduado: "Sí",
        fecha: "",
        archivo: null,
      });
    } catch (err) {
      console.error("Error al enviar datos:", err);
      alert("Error al guardar la formación");
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="formacion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formacion-container">
          <h2>Formación Académica</h2>

          <form className="formacion-form" onSubmit={handleSubmit}>
            <input type="text" name="institucion" placeholder="Institución" value={formData.institucion} onChange={handleChange} required />
            <input type="text" name="programa" placeholder="Programa" value={formData.programa} onChange={handleChange} required />
            <input type="text" name="tipo" placeholder="Tipo de formación" value={formData.tipo} onChange={handleChange} required />
            <input type="text" name="nivel" placeholder="Nivel de formación" value={formData.nivel} onChange={handleChange} required />
            <select name="graduado" value={formData.graduado} onChange={handleChange} required>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            <input type="file" name="archivo" accept="application/pdf" onChange={handleChange} required />
            <button type="submit">Agregar formación</button>
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
                    <a href={form.archivoURL} target="_blank" rel="noopener noreferrer">Ver PDF</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="cerrar-formacion-btn" onClick={onClose}>Cerrar</button>
        </div>

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

export default Formacion;