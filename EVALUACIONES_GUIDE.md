# 📊 Guía de Implementación - Módulo de Evaluación de Desempeño

## ✅ Estado Actual

### Backend - COMPLETADO ✓
- ✅ Base de datos: Tablas creadas (`database_evaluaciones.sql`)
- ✅ Middleware de roles: Solo `admin` y `supervisor`
- ✅ Models: Períodos, Evaluaciones y Metas
- ✅ Services: Lógica de negocio completa
- ✅ Controllers: Manejo de peticiones HTTP
- ✅ Routes: Endpoints configurados con permisos por rol
- ✅ Integrado en `app.js`

### Frontend - COMPLETADO ✓
- ✅ Servicio API (`src/services/evaluaciones.service.js`)

### Frontend - PENDIENTE
- ⏳ Páginas de UI (períodos, evaluaciones, metas)
- ⏳ Estilos CSS
- ⏳ Integración con Dashboard

---

## 🗂️ Arquitectura del Módulo

```
backend/src/modules/evaluaciones/
├── controllers/
│   └── evaluaciones.controller.js   ✅
├── services/
│   └── evaluaciones.service.js      ✅
├── models/
│   ├── periodo-evaluacion.model.js  ✅
│   ├── evaluacion.model.js          ✅
│   └── meta.model.js                ✅
└── routes/
    └── evaluaciones.routes.js       ✅

frontend/src/
├── services/
│   └── evaluaciones.service.js      ✅
└── pages/
    ├── Evaluaciones.jsx             ⏳ (por crear)
    ├── Evaluaciones.css             ⏳ (por crear)
    └── HistorialEmpleado.jsx        ⏳ (por crear)
```

---

## 🚀 Pasos Siguientes

### 1. Ejecutar el Script SQL

Primero, aplica los cambios a la base de datos:

```bash
# Conectar a PostgreSQL con pgAdmin4 o terminal
psql -U postgres -d recursos_humanos

# Copiar y pegar el contenido de database_evaluaciones.sql
# O ejecutarlo desde pgAdmin Query Tool
```

**Importante**: El script ya actualiza la tabla `usuarios` con la columna `rol`.

### 2. Verificar la Instalación del Backend

```bash
cd backend
npm start
```

Deberías ver el mensaje:
```
✅ Backend en http://localhost:3000
```

### 3. Probar los Endpoints con Postman/Thunder Client

#### Login para obtener token
```http
POST http://localhost:3000/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Respuesta incluirá `rol: "admin"` en el objeto `user`.

#### Crear un Período de Evaluación
```http
POST http://localhost:3000/api/periodos-evaluacion
Authorization: Bearer {tu_token}
Content-Type: application/json

{
  "nombre": "Q4 2025",
  "tipo": "trimestral",
  "fecha_inicio": "2025-10-01",
  "fecha_fin": "2025-12-31",
  "descripcion": "Evaluación Q4 2025",
  "activo": true
}
```

#### Listar Períodos
```http
GET http://localhost:3000/api/periodos-evaluacion
Authorization: Bearer {tu_token}
```

#### Crear una Evaluación
```http
POST http://localhost:3000/api/evaluaciones-desempeno
Authorization: Bearer {tu_token}
Content-Type: application/json

{
  "empleado_id": 1,
  "periodo_id": 1,
  "tipo_evaluacion": "jefe",
  "calidad_trabajo": 4.5,
  "productividad": 4.0,
  "conocimiento_tecnico": 4.5,
  "trabajo_equipo": 5.0,
  "comunicacion": 4.0,
  "liderazgo": 3.5,
  "responsabilidad": 4.5,
  "iniciativa": 4.0,
  "fortalezas": "Excelente trabajo en equipo",
  "oportunidades_mejora": "Mejorar comunicación escrita",
  "estado": "completada"
}
```

La puntuación total se calcula automáticamente.

#### Crear una Meta
```http
POST http://localhost:3000/api/metas-empleado
Authorization: Bearer {tu_token}
Content-Type: application/json

{
  "empleado_id": 1,
  "periodo_id": 1,
  "descripcion": "Completar 3 proyectos críticos",
  "peso_porcentaje": 30,
  "fecha_limite": "2025-12-31",
  "estado": "en_progreso",
  "porcentaje_cumplimiento": 60
}
```

---

## 📋 Control de Acceso por Roles

| Endpoint | Admin | Supervisor |
|----------|-------|------------|
| **Períodos** | | |
| Ver períodos | ✅ | ✅ |
| Crear período | ✅ | ❌ |
| Editar período | ✅ | ❌ |
| Eliminar período | ✅ | ❌ |
| **Evaluaciones** | | |
| Ver evaluaciones | ✅ | ✅ |
| Crear evaluación | ✅ | ✅ |
| Editar evaluación | ✅ | ✅ |
| Aprobar evaluación | ✅ | ❌ |
| Eliminar evaluación | ✅ | ❌ |
| **Metas** | | |
| Ver metas | ✅ | ✅ |
| Crear meta | ✅ | ✅ |
| Editar meta | ✅ | ✅ |
| Cambiar estado | ✅ | ✅ |
| Eliminar meta | ✅ | ❌ |

---

## 🎨 Estructura Recomendada para el Frontend

### Componente Principal: `Evaluaciones.jsx`

```jsx
import { useState, useEffect } from 'react';
import evaluacionesService from '../services/evaluaciones.service';
import './Evaluaciones.css';

const Evaluaciones = () => {
  const [activeTab, setActiveTab] = useState('periodos'); // periodos, evaluaciones, metas
  const [periodos, setPeriodos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [metas, setMetas] = useState([]);

  // Tabs: Períodos | Evaluaciones | Metas

  return (
    <div className="evaluaciones-container">
      <header className="evaluaciones-header">
        <h1>📊 Evaluación de Desempeño</h1>
        <div className="tabs">
          <button onClick={() => setActiveTab('periodos')}>Períodos</button>
          <button onClick={() => setActiveTab('evaluaciones')}>Evaluaciones</button>
          <button onClick={() => setActiveTab('metas')}>Metas</button>
        </div>
      </header>

      <main className="evaluaciones-content">
        {activeTab === 'periodos' && <PeriodosTab />}
        {activeTab === 'evaluaciones' && <EvaluacionesTab />}
        {activeTab === 'metas' && <MetasTab />}
      </main>
    </div>
  );
};
```

### Formulario de Evaluación

Campos necesarios:
- Selección de empleado (dropdown)
- Selección de período (dropdown)
- 8 sliders de 1 a 5 para cada categoría:
  - Calidad de trabajo
  - Productividad
  - Conocimiento técnico
  - Trabajo en equipo
  - Comunicación
  - Liderazgo
  - Responsabilidad
  - Iniciativa
- Visualización en tiempo real de la puntuación total
- Áreas de texto para:
  - Fortalezas
  - Oportunidades de mejora
  - Comentarios generales
- Checkbox: "Requiere plan de mejora"
- Si sí, mostrar:
  - Área de texto para el plan
  - Fecha de seguimiento

### Estilos CSS

Seguir el mismo estilo de `Dashboard.css`:
- Cards modernos
- Tabs con hover effects
- Formularios responsivos
- Botones con estados (hover, active, disabled)
- Tablas con header fijo
- Badges de colores para estados

---

## 📊 Visualizaciones Recomendadas

### Dashboard de Evaluaciones

- Total de evaluaciones completadas
- Promedio general de la empresa
- Empleados pendientes de evaluación
- Gráfica de evolución (Chart.js o Recharts)

### Vista de Empleado

- Historial de evaluaciones en timeline
- Gráfica de radar con las 8 categorías
- Progress bars de metas
- Comparación entre períodos

---

## 🔧 Integración con Dashboard Principal

Agregar en `Dashboard.jsx`:

```jsx
// Botón en el menú
<button onClick={() => navigate('/evaluaciones')}>
  📊 Evaluaciones de Desempeño
</button>
```

Agregar ruta en `App.jsx`:

```jsx
import Evaluaciones from './pages/Evaluaciones';

// Dentro de Routes
<Route path="/evaluaciones" element={<Evaluaciones />} />
```

---

## 🧪 Testing Checklist

### Backend
- [ ] Login retorna rol en el token
- [ ] Admin puede crear períodos
- [ ] Supervisor NO puede crear períodos
- [ ] Se pueden crear evaluaciones
- [ ] Puntuación total se calcula automáticamente
- [ ] Metas se crean correctamente
- [ ] Porcentaje de logro se calcula con metas

### Frontend
- [ ] Servicio API se conecta correctamente
- [ ] Se listan períodos
- [ ] Se crean evaluaciones
- [ ] Formulario valida campos requeridos
- [ ] Se visualiza historial de empleado
- [ ] Estados visuales (badges) funcionan

---

## 📝 Datos de Ejemplo

### Usuarios con Roles

Actualizar usuarios existentes:

```sql
-- Dar rol admin al usuario admin
UPDATE usuarios SET rol = 'admin' WHERE username = 'admin';

-- Crear un supervisor de ejemplo
INSERT INTO usuarios (username, password, rol) 
VALUES ('supervisor1', 'super123', 'supervisor');
```

### Períodos de Ejemplo

Ya incluidos en `database_evaluaciones.sql`:
- Evaluación Anual 2025
- Q1 2025
- Q2 2025

---

## 🎯 Próximos Pasos

1. ✅ **Ejecutar script SQL** → `database_evaluaciones.sql`
2. ✅ **Reiniciar backend** → Verificar que carga el nuevo módulo
3. ⏳ **Probar endpoints con Postman** → Verificar funcionalidad
4. ⏳ **Crear página `Evaluaciones.jsx`** → Interfaz básica con tabs
5. ⏳ **Crear estilos `Evaluaciones.css`** → Seguir diseño de Dashboard
6. ⏳ **Integrar en App.jsx** → Agregar ruta
7. ⏳ **Testing completo** → Verificar flujo completo

---

## 📚 Recursos Adicionales

### Librerías Recomendadas para el Frontend

```bash
# Para gráficas
npm install recharts
# O
npm install chart.js react-chartjs-2

# Para iconos (opcional)
npm install react-icons
```

### Ejemplo de Gráfica con Recharts

```jsx
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const data = [
  { categoria: 'Calidad', valor: 4.5 },
  { categoria: 'Productividad', valor: 4.0 },
  { categoria: 'Conocimiento', valor: 4.5 },
  // ...
];

<RadarChart width={400} height={400} data={data}>
  <PolarGrid />
  <PolarAngleAxis dataKey="categoria" />
  <Radar dataKey="valor" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
</RadarChart>
```

---

## 🐛 Solución de Problemas

### Error: "Column 'rol' does not exist"
- Ejecutar el script SQL `database_evaluaciones.sql`
- Verificar que la columna se agregó: `\d usuarios` en psql

### Error 403: "No tiene permisos suficientes"
- Verificar que el usuario tenga rol 'admin' o 'supervisor'
- Verificar que el token incluya el campo `rol`

### Error: "Cannot find module evaluaciones.routes.js"
- Verificar que se creó la carpeta `backend/src/modules/evaluaciones/`
- Verificar que todos los archivos fueron creados

---

## ✨ Características Implementadas

- ✅ Sistema de roles (admin, supervisor)
- ✅ CRUD completo de períodos de evaluación
- ✅ CRUD completo de evaluaciones de desempeño
- ✅ Cálculo automático de puntuación total
- ✅ CRUD completo de metas
- ✅ Cálculo automático de porcentaje de logro
- ✅ Historial de evaluaciones por empleado
- ✅ Estadísticas de desempeño
- ✅ Control de acceso por endpoints
- ✅ Validaciones de datos
- ✅ Logs de todas las operaciones

---

**Desarrollado con Arquitectura Modular (Vertical Slices)**  
**Sistema de Recursos Humanos 2025** 🚀

