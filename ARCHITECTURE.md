# 🏗️ Arquitectura del Proyecto - Recursos Humanos 2025

## 📋 Índice
- [Visión General](#visión-general)
- [Arquitectura del Backend](#arquitectura-del-backend)
- [Arquitectura del Frontend](#arquitectura-del-frontend)
- [Flujo de Datos](#flujo-de-datos)
- [Patrones y Principios](#patrones-y-principios)
- [Escalabilidad](#escalabilidad)

---

## 🎯 Visión General

Este proyecto utiliza una **Arquitectura Modular (Vertical Slices)** que organiza el código por características de negocio en lugar de por capas técnicas.

### Ventajas de esta Arquitectura

✅ **Alta Cohesión**: Todo lo relacionado con una característica está junto  
✅ **Bajo Acoplamiento**: Los módulos son independientes entre sí  
✅ **Fácil Mantenimiento**: Cambios localizados en un módulo  
✅ **Escalabilidad**: Fácil agregar nuevos módulos  
✅ **Trabajo en Equipo**: Equipos pueden trabajar en módulos diferentes  
✅ **Preparado para Microservicios**: Módulos pueden extraerse fácilmente  

---

## 🔧 Arquitectura del Backend

### Estructura de Carpetas

```
backend/
├── src/
│   ├── modules/                    # Módulos por dominio (Vertical Slices)
│   │   ├── auth/
│   │   │   ├── controllers/        # Lógica de HTTP requests/responses
│   │   │   ├── services/           # Lógica de negocio
│   │   │   ├── middlewares/        # Middlewares específicos del módulo
│   │   │   └── routes/             # Definición de rutas
│   │   │
│   │   ├── empleados/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── validators/         # Validaciones específicas
│   │   │   ├── models/             # Modelos de datos
│   │   │   └── routes/
│   │   │
│   │   ├── informacion-personal/
│   │   ├── formacion/
│   │   ├── experiencia/
│   │   └── otros-documentos/
│   │
│   ├── shared/                     # Recursos compartidos
│   │   ├── config/                 # Configuraciones (BD, env)
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── middlewares/            # Middlewares globales
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── cors.js
│   │   ├── utils/                  # Utilidades compartidas
│   │   │   ├── response.js
│   │   │   ├── logger.js
│   │   │   └── multer.js
│   │   └── constants/              # Constantes globales
│   │       └── httpCodes.js
│   │
│   ├── app.js                      # Configuración de Express
│   └── server.js                   # Punto de entrada
│
├── uploads/                        # Archivos subidos
├── index.js                        # Entry point principal
└── package.json
```

### Flujo de una Request

```
┌─────────────────────────────────────────────────────────────┐
│  Cliente (Frontend)                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  app.js (Express)                                           │
│  - CORS Middleware                                          │
│  - Body Parser                                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Módulo (ej: empleados/)                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. Routes (empleados.routes.js)                       │  │
│  │    - Define endpoints y middlewares                   │  │
│  │    - Aplica verificarToken si es necesario            │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 2. Controller (empleados.controller.js)               │  │
│  │    - Maneja request/response HTTP                     │  │
│  │    - Valida entrada inicial                           │  │
│  │    - Llama al service                                 │  │
│  │    - Formatea respuesta con ApiResponse               │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 3. Service (empleados.service.js)                     │  │
│  │    - Lógica de negocio                                │  │
│  │    - Validaciones con Validator                       │  │
│  │    - Llama al Model                                   │  │
│  │    - Maneja errores de negocio                        │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 4. Model (empleado.model.js)                          │  │
│  │    - Interacción con BD (queries SQL)                 │  │
│  │    - CRUD operations                                  │  │
│  └─────────────────┬─────────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ Result
                      ▼
        (Response goes back up the chain)
```

### Responsabilidades por Capa

#### Routes
- Define endpoints y métodos HTTP
- Aplica middlewares (autenticación, validación)
- Configuración de Multer para uploads
- **NO contiene lógica de negocio**

#### Controllers
- Maneja HTTP request/response
- Extrae datos del request (body, params, query)
- Valida datos de entrada básicos
- Llama a services
- Formatea respuestas usando `ApiResponse`
- Maneja errores HTTP

#### Services
- **Lógica de negocio central**
- Validaciones complejas
- Coordinación entre múltiples models
- Transformación de datos
- Manejo de errores de negocio

#### Models
- Interacción directa con la BD
- Queries SQL
- CRUD básico
- **Sin lógica de negocio**

#### Validators
- Reglas de validación específicas del dominio
- Validaciones de formato
- Validaciones de rango de datos

---

## 🎨 Arquitectura del Frontend

### Estructura de Carpetas

```
frontend/src/
├── components/              # Componentes específicos de páginas
│   ├── Login.jsx
│   └── Login.css
│
├── pages/                   # Páginas principales
│   ├── Dashboard.jsx
│   ├── InformacionPersonal.jsx
│   ├── Formacion.jsx
│   ├── Experiencia.jsx
│   └── OtrosDocumentos.jsx
│
├── services/                # Servicios API (comunicación con backend)
│   ├── api.js               # Cliente Axios configurado
│   ├── auth.service.js      # Servicio de autenticación
│   └── empleados.service.js # Servicio de empleados
│
├── shared/                  # Recursos compartidos
│   ├── components/          # Componentes reutilizables
│   │   ├── Alert.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── ProtectedRoute.jsx
│   ├── hooks/              # Custom hooks
│   │   └── useAlert.js
│   ├── utils/              # Utilidades
│   │   ├── validators.js
│   │   └── formatters.js
│   └── constants/          # Constantes
│       └── routes.js
│
├── assets/                 # Recursos estáticos
├── App.jsx                 # Componente principal
└── main.jsx               # Punto de entrada
```

### Flujo de Datos en Frontend

```
┌─────────────────────────────────────────────────────────────┐
│  Componente UI (ej: Dashboard.jsx)                          │
│  - Renderiza interfaz                                       │
│  - Maneja eventos del usuario                               │
│  - Usa hooks (useState, useEffect, custom hooks)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Service (ej: empleados.service.js)                         │
│  - Abstrae llamadas a API                                   │
│  - Maneja endpoints específicos                             │
│  - Usa cliente Axios configurado                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  API Client (api.js)                                        │
│  - Cliente Axios configurado                                │
│  - Interceptors para tokens                                 │
│  - Manejo global de errores                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      ▼
                  Backend API
```

### Ventajas de los Services

✅ **Separación de Preocupaciones**: UI no conoce detalles de API
✅ **Reutilización**: Múltiples componentes usan el mismo service
✅ **Testing**: Fácil mockear services en tests
✅ **Mantenimiento**: Cambios de API centralizados

---

## 🔄 Flujo de Datos Completo

### Ejemplo: Crear un Empleado

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario llena formulario en Dashboard.jsx                │
│    - Valida datos con validators.js                         │
│    - Muestra errores en tiempo real                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ Submit
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Llama a empleadosService.create(data)                    │
│    - Servicio abstrae la llamada HTTP                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ POST /empleados
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API Client (api.js)                                      │
│    - Agrega token JWT automáticamente                       │
│    - Envía request al backend                               │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend - empleados.routes.js                            │
│    - verificarToken middleware                              │
│    - Ruta POST /empleados                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. empleados.controller.create()                            │
│    - Extrae data del body                                   │
│    - Llama al service                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. empleadosService.createEmpleado(data)                    │
│    - Valida con empleadosValidator                          │
│    - Verifica duplicados                                    │
│    - Llama al model                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. empleadoModel.create(data)                               │
│    - Ejecuta INSERT en PostgreSQL                           │
│    - Retorna empleado creado                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ Response
                      ▼
        (Response sube por la cadena)
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Frontend recibe respuesta                                │
│    - Actualiza estado                                       │
│    - Muestra mensaje de éxito                               │
│    - Refresca lista de empleados                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Patrones y Principios

### SOLID

- **S** - Single Responsibility: Cada clase tiene una responsabilidad
- **O** - Open/Closed: Abierto para extensión, cerrado para modificación
- **L** - Liskov Substitution: Módulos intercambiables
- **I** - Interface Segregation: Interfaces específicas
- **D** - Dependency Inversion: Depende de abstracciones

### DRY (Don't Repeat Yourself)

- Código compartido en `/shared`
- Utilidades reutilizables
- Services abstraen lógica común

### Separation of Concerns

- **Routes**: Configuración de endpoints
- **Controllers**: Manejo HTTP
- **Services**: Lógica de negocio
- **Models**: Acceso a datos

---

## 📈 Escalabilidad

### Agregar un Nuevo Módulo

```bash
# Backend
mkdir -p backend/src/modules/nuevo-modulo/{controllers,services,routes,models}

# Crear archivos siguiendo el patrón existente
touch backend/src/modules/nuevo-modulo/routes/nuevo-modulo.routes.js
touch backend/src/modules/nuevo-modulo/controllers/nuevo-modulo.controller.js
touch backend/src/modules/nuevo-modulo/services/nuevo-modulo.service.js
touch backend/src/modules/nuevo-modulo/models/nuevo-modulo.model.js

# Importar en app.js
```

### Migrar a Microservicios

Cada módulo puede convertirse en un microservicio independiente:

```
empleados-service/        ← Extraer módulo empleados
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── routes/
├── Dockerfile
└── package.json
```

### Horizontal Scaling

- Backend: Múltiples instancias con Load Balancer
- Frontend: CDN para archivos estáticos
- Base de Datos: Read replicas, Connection pooling

---

## 🔒 Seguridad

### Autenticación y Autorización

- **JWT**: Tokens con expiración
- **Middleware**: Protección de rutas
- **Interceptors**: Manejo automático de tokens

### Validación

- **Backend**: Validaciones de negocio y formato
- **Frontend**: Validaciones de UX y formato
- **Database**: Constraints y validaciones SQL

### Upload de Archivos

- **Validación de tipo**: Solo PDFs e imágenes
- **Límite de tamaño**: 10MB por archivo
- **UUID**: Nombres únicos para evitar conflictos

---

## 📚 Documentación Adicional

- `README.md`: Guía de instalación y uso
- `database_setup.sql`: Estructura de base de datos
- Comentarios en código: Documentación inline

---

**Versión**: 2.0.0
**Arquitectura**: Modular (Vertical Slices)
**Última actualización**: Octubre 2025
