# Sistema de Recursos Humanos 2025

Sistema web completo para la gestión de empleados desarrollado con React, Node.js y PostgreSQL. Incluye autenticación JWT, subida de archivos PDF y gestión completa de información de empleados.

## 🚀 Características

- **Frontend**: React 18 con Vite (puerto 5173)
- **Backend**: Express.js con Node.js (puerto 3000)
- **Base de datos**: PostgreSQL con pgAdmin4
- **Autenticación**: JWT con middleware de protección
- **Subida de archivos**: Multer para PDFs (límite 10MB)
- **CORS**: Configurado para desarrollo local
- **Rutas modulares**: API REST bien estructurada

## 📋 Módulos del Sistema

1. **Dashboard Principal**: Gestión general de empleados
2. **Información Personal**: Datos personales y documentos
3. **Formación Académica**: Historial educativo
4. **Experiencia Laboral**: Antecedentes profesionales
5. **Otros Documentos**: Documentos adicionales (RUT, EPS, ARL, etc.)

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- PostgreSQL (versión 16 o superior) con pgAdmin4
- npm o yarn


### 1. Crear Base de Datos y Tablas

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

### 4. Configurar Variables de Entorno

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

**⚠️ IMPORTANTE**: Cambiar `admin123` por la contraseña real que pusiste durante la instalación de PostgreSQL.

### 5. Instalar Dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

**Dependencias agregadas al backend:**
- `dotenv`: Para manejo de variables de entorno
- `uuid`: Para generación de identificadores únicos en archivos

### 6. Ejecutar la Aplicación

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

## 🔐 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

## 📁 Estructura del Proyecto

```
├── backend/                 # Servidor Express.js
│   ├── routes/             # Rutas de la API
│   │   ├── empleados.js    # ✅ CRUD de empleados
│   │   ├── informacionPersonal.js  # Información personal
│   │   ├── experiencia.js  # Experiencia laboral
│   │   ├── formacion.js    # Formación académica
│   │   └── otrosDocumentos.js # Otros documentos
│   ├── uploads/            # Archivos PDF subidos
│   │   └── otros-documentos/ # Subcarpeta para otros docs
│   ├── db.js              # Configuración de PostgreSQL
│   ├── index.js           # Servidor principal con CORS
│   ├── package.json       # ✅ Dependencias actualizadas
│   └── .env              # Variables de entorno (crear)
├── src/                   # Frontend React
│   ├── components/        # Componentes reutilizables
│   │   ├── Login.jsx      # Componente de autenticación
│   │   ├── ProtectedRoute.jsx # Protección de rutas
│   │   └── Protected.jsx  # Componente protegido
│   ├── pages/            # Páginas principales
│   │   ├── Dashboard.jsx  # Dashboard principal
│   │   ├── InformacionPersonal.jsx
│   │   ├── Formacion.jsx
│   │   ├── Experiencia.jsx
│   │   └── OtrosDocumentos.jsx
│   ├── App.jsx           # Componente principal con Router
│   └── main.jsx          # Punto de entrada
├── database_setup.sql    # ✅ Script completo de BD
├── .env                  # Variables de entorno frontend (crear)
├── package.json          # Dependencias frontend
├── vite.config.js        # Configuración de Vite
└── README.md            # Documentación creada y actualizada
```

## 🔧 Archivos Creados/Modificados

### ✅ Archivos Nuevos Creados:
- `backend/routes/empleados.js` - API completa para gestión de empleados
- `backend/.env` - Variables de entorno del backend
- `.env` - Variables de entorno del frontend
- `database_setup.sql` - Script completo de configuración de BD

### ✅ Archivos Modificados:
- `backend/package.json` - Agregadas dependencias `dotenv` y `uuid`
- `backend/index.js` - Agregada ruta de empleados y configuración CORS
- `README.md` - Documentación completa actualizada

## 🔧 API Endpoints

### Autenticación
- `POST /login` - Iniciar sesión
- `GET /protected` - Ruta protegida de prueba

### Empleados
- `GET /empleados` - Listar empleados
- `POST /empleados` - Crear empleado
- `GET /empleados/:id` - Obtener empleado
- `PUT /empleados/:id` - Actualizar empleado
- `DELETE /empleados/:id` - Eliminar empleado

### Módulos
- `POST /api/informacion-personal` - Guardar información personal
- `POST /api/formacion` - Guardar formación académica
- `POST /api/experiencia` - Guardar experiencia laboral
- `POST /api/otros-documentos` - Guardar otros documentos

## 🐛 Solución de Problemas

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

## 📝 Notas de Desarrollo

### Configuración Técnica:
- Los archivos PDF se almacenan en `backend/uploads/` y `backend/uploads/otros-documentos/`
- El sistema usa JWT para autenticación con expiración de 1 hora
- Las fechas se manejan en formato ISO y se muestran localizadas
- Los archivos tienen un límite de 10MB por archivo
- CORS configurado para desarrollo local (localhost y 127.0.0.1)
- Middleware de verificación JWT para rutas protegidas

### Mejoras Implementadas:
- ✅ API completa de empleados con CRUD
- ✅ Manejo de errores mejorado con códigos de estado HTTP
- ✅ Validación de campos requeridos
- ✅ Subida de archivos con nombres únicos
- ✅ Estructura de base de datos optimizada con índices
- ✅ Variables de entorno para configuración segura
- ✅ Documentación completa de instalación y configuración

### Estructura de Base de Datos:
- **usuarios**: Autenticación del sistema
- **empleados**: Información básica de empleados
- **informacion_personal**: Datos personales detallados
- **formacion**: Historial educativo
- **experiencia**: Experiencia laboral previa
- **otros_documentos**: Documentos adicionales (RUT, EPS, ARL, etc.)

## 📄 Licencia

Este proyecto está bajo la Licencia MPL.