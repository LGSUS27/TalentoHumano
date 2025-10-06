# Sistema de Recursos Humanos 2025

Sistema web completo para la gestión de empleados desarrollado con React, Node.js y PostgreSQL. Incluye autenticación JWT, subida de archivos PDF y gestión completa de información de empleados.

## Características

- **Frontend**: React 18 con Vite (puerto 5173)
- **Backend**: Express.js con Node.js (puerto 3000)
- **Base de datos**: PostgreSQL con pgAdmin4
- **Autenticación**: JWT con middleware de protección
- **Subida de archivos**: Multer para PDFs (límite 10MB)
- **CORS**: Configurado para desarrollo local
- **Rutas modulares**: API REST bien estructurada
- **Sistema de alertas**: Notificaciones personalizadas con iconos SVG
- **Validación en tiempo real**: Feedback inmediato en formularios
- **UI/UX mejorada**: Modales responsivos y componentes modernos
- **Gestión de sesiones**: Opción "Recordarme" con localStorage/sessionStorage
- **Validaciones robustas**: Validación de datos tanto en frontend como backend
- **Manejo de errores**: Sistema completo de manejo de errores con mensajes específicos
- **Arquitectura modular**: Separación clara entre frontend y backend
- **Configuración flexible**: Variables de entorno para diferentes entornos

## Módulos del Sistema

1. **Dashboard Principal**: Gestión general de empleados con tabla fija y búsqueda
2. **Información Personal**: Datos personales, documentos e imagen personal
3. **Formación Académica**: Historial educativo con validaciones
4. **Experiencia Laboral**: Antecedentes profesionales con soporte PDF
5. **Otros Documentos**: Documentos adicionales (RUT, EPS, ARL, etc.)

### Características de UI/UX

- **Sistema de Alertas Unificado**: Notificaciones personalizadas con iconos SVG
- **Validación en Tiempo Real**: Feedback inmediato en todos los formularios
- **Modales Responsivos**: Adaptables a diferentes tamaños de pantalla
- **Tabla Fija**: Header y acciones siempre visibles durante el scroll
- **Búsqueda en Tiempo Real**: Filtrado instantáneo de empleados
- **Confirmaciones Personalizadas**: Diálogos de confirmación modernos
- **Gestión de Sesiones**: Opción "Recordarme" para persistencia de login

## Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- PostgreSQL (versión 16 o superior) con pgAdmin4
- npm o yarn
- Git (para clonar el repositorio)


### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd recursosHumanos2025-main
```

### 2. Crear Base de Datos y Tablas

#### Paso 1: Crear la base de datos
En pgAdmin4:
- Click derecho en "Databases" → "Create" → "Database"
- **Name**: `recursos_humanos`
- Click "Save"

#### Paso 2: Ejecutar script SQL
1. Click en la base de datos `recursos_humanos`
2. Click en "Query Tool" (🔍 con lápiz)
3. **Copiar y pegar** el contenido completo de `database_setup.sql`
4. **IMPORTANTE**: Eliminar las líneas 4-8 (CREATE DATABASE y \c) porque ya creaste la BD
5. Click en "Execute" (▶️)

#### Paso 3: Verificar creación de tablas
```sql
-- Verificar que las tablas se crearon
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verificar que el usuario admin existe
SELECT * FROM usuarios;
```

### 3. Configurar Variables de Entorno

#### Archivo 1: `.env` (en la raíz del proyecto)
Crear archivo `.env` en la raíz del proyecto (mismo nivel que `package.json`):

```env
# URL del backend para el frontend
VITE_API_URL=http://localhost:3000
```

#### Archivo 2: `backend/.env`
Crear archivo `.env` dentro de la carpeta `backend`:

```env
# Configuración de Base de Datos PostgreSQL
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/recursos_humanos

# JWT Secret
JWT_SECRET=mi_secreto_super_seguro_para_jwt_2025

# Puerto del servidor
PORT=3000

# Configuración para desarrollo
NODE_ENV=development
```

**IMPORTANTE**: Cambiar `admin123` por la contraseña real que pusiste durante la instalación de PostgreSQL.

### 4. Instalar Dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

**Dependencias principales del backend:**
- `express`: Framework web para Node.js
- `cors`: Middleware para habilitar CORS
- `jsonwebtoken`: Para autenticación JWT
- `pg`: Cliente PostgreSQL para Node.js
- `multer`: Middleware para subida de archivos
- `dotenv`: Para manejo de variables de entorno
- `uuid`: Para generación de identificadores únicos en archivos
- `axios`: Cliente HTTP para peticiones

**Dependencias principales del frontend:**
- `react`: Biblioteca de interfaz de usuario
- `react-dom`: Renderizado de React en el DOM
- `react-router-dom`: Enrutamiento para aplicaciones React
- `axios`: Cliente HTTP para peticiones
- `@vitejs/plugin-react`: Plugin de React para Vite
- `vite`: Herramienta de construcción y desarrollo

### 5. Ejecutar la Aplicación

#### Opción 1: Ejecutar por separado (Recomendado)

```bash
# Terminal 1: Backend (puerto 3000)
cd backend
npm start

# Terminal 2: Frontend (puerto 5173)
npm run dev
```

#### Opción 2: Scripts de desarrollo

```bash
# Backend en modo desarrollo (con nodemon)
cd backend
npm run dev

# Frontend
npm run dev
```

#### Verificación de funcionamiento:
- **Backend**: Debe mostrar `✅ Backend en http://localhost:3000`
- **Frontend**: Se abrirá automáticamente en http://localhost:5173
- **Login**: Usuario `admin`, Contraseña `admin123`

## Scripts Disponibles

### Frontend (raíz del proyecto)
```bash
npm run dev      # Iniciar servidor de desarrollo (puerto 5173)
npm run build    # Construir aplicación para producción
npm run preview  # Vista previa de la construcción de producción
```

### Backend (carpeta backend/)
```bash
npm start        # Iniciar servidor en modo producción
npm run dev      # Iniciar servidor con nodemon (modo desarrollo)
```

## Comandos Útiles

### Desarrollo
```bash
# Instalar todas las dependencias
npm install && cd backend && npm install && cd ..

# Ejecutar en modo desarrollo (dos terminales)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
npm run dev

# Construir para producción
npm run build
```

### Base de Datos
```bash
# Conectar a PostgreSQL desde terminal
psql -U postgres -d recursos_humanos

# Verificar conexión
SELECT version();
```

## Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

## Arquitectura del Sistema

### Frontend (React + Vite)
- **Framework**: React 18 con hooks modernos
- **Build Tool**: Vite para desarrollo rápido
- **Routing**: React Router DOM para navegación SPA
- **HTTP Client**: Axios para comunicación con API
- **Estado**: Estado local con useState y useEffect
- **UI Components**: Componentes personalizados con CSS modules

### Backend (Node.js + Express)
- **Framework**: Express.js con ES6 modules
- **Base de Datos**: PostgreSQL con cliente pg
- **Autenticación**: JWT con jsonwebtoken
- **File Upload**: Multer para manejo de archivos PDF
- **CORS**: Configuración específica para desarrollo
- **Middleware**: Validación y autenticación personalizada

### Base de Datos (PostgreSQL)
- **Motor**: PostgreSQL 16+
- **Relaciones**: Foreign keys con CASCADE para integridad
- **Índices**: Optimización de consultas frecuentes
- **Tipos de Datos**: Tipos específicos (SERIAL, DECIMAL, BOOLEAN, etc.)

## 📁 Estructura del Proyecto

```
recursosHumanos2025-main/
├── backend/                          # Servidor Express.js
│   ├── routes/                       # Rutas modulares de la API
│   │   ├── empleados.js              # CRUD completo de empleados con validaciones
│   │   ├── empleados_backup.js       # Backup del archivo de empleados
│   │   ├── informacionPersonal.js    # Gestión de información personal
│   │   ├── experiencia.js            # Gestión de experiencia laboral
│   │   ├── formacion.js              # Gestión de formación académica
│   │   └── otrosDocumentos.js        # Gestión de otros documentos
│   ├── uploads/                      # Directorio de archivos subidos
│   │   ├── .gitkeep                  # Archivo para mantener directorio en Git
│   │   └── otros-documentos/         # Subcarpeta para documentos adicionales
│   ├── node_modules/                 # Dependencias del backend
│   ├── db.js                         # Configuración de conexión PostgreSQL
│   ├── index.js                      # Servidor principal con CORS y middleware
│   ├── package.json                  # Dependencias y scripts del backend
│   ├── package-lock.json             # Lock file de dependencias
│   └── .env                          # Variables de entorno (crear manualmente)
├── src/                              # Frontend React
│   ├── components/                   # Componentes reutilizables
│   │   ├── Login.jsx                 # Componente de autenticación con validaciones
│   │   ├── Login.css                 # Estilos del componente Login
│   │   ├── ProtectedRoute.jsx        # Componente de protección de rutas
│   │   ├── Protected.jsx             # Componente wrapper protegido
│   │   ├── Alert.jsx                 # Sistema de alertas con iconos SVG
│   │   ├── Alert.css                 # Estilos del sistema de alertas
│   │   ├── AlertContainer.jsx        # Contenedor de alertas
│   │   ├── ConfirmDialog.jsx         # Diálogos de confirmación personalizados
│   │   └── ConfirmDialog.css         # Estilos de diálogos de confirmación
│   ├── pages/                        # Páginas principales de la aplicación
│   │   ├── Dashboard.jsx             # Dashboard principal con tabla fija y búsqueda
│   │   ├── Dashboard.css             # Estilos del dashboard
│   │   ├── InformacionPersonal.jsx   # Gestión de información personal
│   │   ├── InformacionPersonal.css   # Estilos de información personal
│   │   ├── Formacion.jsx             # Gestión de formación académica
│   │   ├── Formacion.css             # Estilos de formación
│   │   ├── Experiencia.jsx           # Gestión de experiencia laboral
│   │   ├── Experiencia.css           # Estilos de experiencia
│   │   ├── OtrosDocumentos.jsx       # Gestión de otros documentos
│   │   └── OtrosDocumentos.css       # Estilos de otros documentos
│   ├── hooks/                        # Hooks personalizados
│   │   └── useAlert.js               # Hook para manejo de alertas
│   ├── assets/                       # Recursos estáticos
│   │   ├── favicon.png               # Favicon de la aplicación
│   │   ├── logoblanco.png            # Logo blanco
│   │   └── oftalmolaser.png          # Logo principal de Oftalmoláser
│   ├── App.jsx                       # Componente principal con Router
│   └── main.jsx                      # Punto de entrada de la aplicación
├── node_modules/                     # Dependencias del frontend
├── database_setup.sql                # Script completo de configuración de BD
├── index.html                        # Archivo HTML principal
├── .env                              # Variables de entorno del frontend (crear)
├── package.json                      # Dependencias y scripts del frontend
├── package-lock.json                 # Lock file de dependencias del frontend
├── vite.config.js                    # Configuración de Vite
├── LICENSE                           # Licencia del proyecto
└── README.md                         # Documentación completa del proyecto
```

### Descripción Detallada de Archivos Clave:

#### Backend
- **`backend/index.js`**: Servidor principal con configuración CORS, middleware JWT, rutas modulares
- **`backend/db.js`**: Configuración de conexión a PostgreSQL con pool de conexiones
- **`backend/routes/empleados.js`**: CRUD completo con validaciones robustas y manejo de errores
- **`backend/routes/*.js`**: Rutas especializadas para cada módulo del sistema
- **`backend/uploads/.gitkeep`**: Archivo para mantener el directorio de uploads en el control de versiones

#### Frontend
- **`src/App.jsx`**: Configuración de rutas con React Router
- **`src/main.jsx`**: Punto de entrada con React StrictMode
- **`src/components/Login.jsx`**: Autenticación con validación en tiempo real y opción "Recordarme"
- **`src/pages/Dashboard.jsx`**: Dashboard principal con tabla fija, búsqueda y gestión de empleados
- **`src/hooks/useAlert.js`**: Hook personalizado para sistema de alertas

#### Configuración
- **`database_setup.sql`**: Script completo con tablas, índices, relaciones y datos iniciales
- **`vite.config.js`**: Configuración de Vite con plugin de React
- **`.env`**: Variables de entorno para configuración flexible

## API Endpoints

### Autenticación
- `POST /login` - Iniciar sesión (también disponible en `/api/login`)
- `GET /protected` - Ruta protegida de prueba
- `GET /` - Verificación de salud del backend

### Empleados
- `GET /empleados` - Listar todos los empleados (requiere autenticación)
- `POST /empleados` - Crear nuevo empleado (requiere autenticación)
- `GET /empleados/:id` - Obtener empleado por ID (requiere autenticación)
- `PUT /empleados/:id` - Actualizar empleado (requiere autenticación)
- `DELETE /empleados/:id` - Eliminar empleado (requiere autenticación)

### Módulos Especializados
- `POST /api/informacion-personal` - Guardar información personal
- `POST /api/formacion` - Guardar formación académica
- `POST /api/experiencia` - Guardar experiencia laboral
- `POST /api/otros-documentos` - Guardar otros documentos

### Archivos Estáticos
- `GET /uploads/*` - Servir archivos PDF subidos

## Solución de Problemas

### Error 500: "la autentificación password falló para el usuario 'usuario'"
**Causa**: El archivo `backend/.env` no existe o tiene credenciales incorrectas.
**Solución**:
1. Crear archivo `backend/.env` con las credenciales correctas de PostgreSQL
2. Verificar que la contraseña coincida con la de la instalación
3. Reiniciar el backend

### Error 401: "Unauthorized"
**Causa**: Las credenciales de login no existen en la base de datos.
**Solución**:
1. Ejecutar en pgAdmin4:
```sql
-- Crear usuario admin si no existe
INSERT INTO usuarios (username, password) VALUES ('admin', 'admin123')
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;
```

### Error de conexión a base de datos
1. Verificar que PostgreSQL esté ejecutándose
2. Comprobar las credenciales en `backend/.env`
3. Asegurar que la base de datos `recursos_humanos` existe
4. Verificar que las tablas fueron creadas correctamente

### Error CORS
- El backend está configurado para permitir CORS desde localhost
- Verificar que el frontend use la URL correcta del backend (`VITE_API_URL`)

### Archivos no se suben
1. Verificar permisos de la carpeta `backend/uploads`
2. Comprobar que el servidor tenga permisos de escritura
3. Verificar que la carpeta `uploads/otros-documentos` existe

### El frontend no se conecta al backend
1. Verificar que ambos servicios estén ejecutándose
2. Comprobar que el archivo `.env` del frontend tenga `VITE_API_URL=http://localhost:3000`
3. Verificar que no haya errores en la consola del navegador

## Notas de Desarrollo

### Configuración Técnica:
- Los archivos PDF se almacenan en `backend/uploads/` y `backend/uploads/otros-documentos/`
- El sistema usa JWT para autenticación con expiración de 1 hora
- Las fechas se manejan en formato ISO y se muestran localizadas
- Los archivos tienen un límite de 10MB por archivo
- CORS configurado para desarrollo local (localhost y 127.0.0.1)
- Middleware de verificación JWT para rutas protegidas
- Sistema de validación robusto tanto en frontend como backend
- Manejo de errores con mensajes específicos y códigos de estado HTTP
- Arquitectura modular con separación clara de responsabilidades

### Validaciones Implementadas:
- **Números de identificación**: Solo números, 6-12 dígitos
- **Nombres**: Solo letras, espacios y caracteres especiales en español
- **Cargos**: Deben comenzar con letra mayúscula
- **Fechas**: Validación de rangos y coherencia temporal
- **Sueldos**: Deben ser mayores a 0
- **Archivos**: Solo PDFs, máximo 10MB

### Estructura de Base de Datos:
- **usuarios**: Autenticación del sistema (id, username, password, created_at)
- **empleados**: Información básica de empleados (id, nombre, numeroIdentificacion, contrato, fechas, sueldo, tipo_contrato, cargo)
- **informacion_personal**: Datos personales detallados (documentos, imagen, datos demográficos, contacto)
- **formacion**: Historial educativo (institución, programa, tipo, nivel, graduado, fecha, archivo)
- **experiencia**: Experiencia laboral previa (empresa, cargo, vinculación, fechas, funciones, soporte)
- **otros_documentos**: Documentos adicionales (RUT, EPS, ARL, AFP, exámenes médicos, etc.)

### Características de Seguridad:
- Autenticación JWT con tokens de 1 hora de duración
- Middleware de verificación en todas las rutas protegidas
- Validación de entrada en todos los endpoints
- Manejo seguro de archivos con validación de tipo y tamaño
- CORS configurado específicamente para desarrollo local

### Características Avanzadas:
- **Sistema de Alertas Personalizado**: Notificaciones con iconos SVG y animaciones
- **Validación en Tiempo Real**: Feedback inmediato en formularios
- **Gestión de Sesiones**: Opción "Recordarme" con localStorage/sessionStorage
- **Manejo de Errores Robusto**: Mensajes específicos y códigos de estado HTTP
- **Arquitectura Modular**: Separación clara entre frontend y backend
- **Configuración Flexible**: Variables de entorno para diferentes entornos
- **Optimización de Base de Datos**: Índices para consultas frecuentes
- **Integridad Referencial**: Foreign keys con CASCADE para consistencia de datos
- **Subida de Archivos Segura**: Validación de tipo, tamaño y almacenamiento organizado
- **UI/UX Moderna**: Componentes responsivos con CSS moderno

## Licencia

Este proyecto está bajo la Licencia MPL.