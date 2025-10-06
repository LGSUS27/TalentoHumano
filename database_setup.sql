-- Script de configuración de base de datos PostgreSQL
-- Recursos Humanos 2025

-- Crear base de datos
CREATE DATABASE recursos_humanos;

-- Conectar a la base de datos
\c recursos_humanos;

-- Tabla de usuarios para autenticación
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal de empleados
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    numeroIdentificacion VARCHAR(20) UNIQUE NOT NULL,
    contrato VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE,
    sueldo DECIMAL(12,2),
    tipo_contrato VARCHAR(100),
    cargo VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'desvinculado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de información personal
CREATE TABLE informacion_personal (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50),
    numero_identificacion VARCHAR(20),
    fecha_expedicion DATE,
    documento_pdf VARCHAR(255),
    imagen_personal VARCHAR(255),
    nombres VARCHAR(255),
    apellidos VARCHAR(255),
    genero VARCHAR(10),
    fecha_nacimiento DATE,
    departamento_nacimiento VARCHAR(100),
    ciudad_nacimiento VARCHAR(100),
    email VARCHAR(255),
    direccion TEXT,
    telefono VARCHAR(20),
    rh VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de formación académica
CREATE TABLE formacion (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
    institucion VARCHAR(255),
    programa VARCHAR(255),
    tipo VARCHAR(100),
    nivel VARCHAR(100),
    graduado BOOLEAN,
    fecha DATE,
    archivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de experiencia laboral
CREATE TABLE experiencia (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
    empresa VARCHAR(255),
    cargo VARCHAR(255),
    tipo_vinculacion VARCHAR(100),
    fecha_inicio DATE,
    fecha_salida DATE,
    funciones TEXT,
    soporte VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de otros documentos
CREATE TABLE otros_documentos (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER UNIQUE REFERENCES empleados(id) ON DELETE CASCADE,
    contrato VARCHAR(255),
    libreta_militar VARCHAR(255),
    antecedentes_disciplinarios VARCHAR(255),
    rut VARCHAR(255),
    rethus VARCHAR(255),
    arl VARCHAR(255),
    eps VARCHAR(255),
    afp VARCHAR(255),
    caja_compensacion VARCHAR(255),
    examen_ingreso VARCHAR(255),
    examen_periodico VARCHAR(255),
    examen_egreso VARCHAR(255),
    documentos_seleccion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario por defecto para pruebas
INSERT INTO usuarios (username, password) VALUES ('admin', 'admin123');

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_empleados_numero_identificacion ON empleados(numeroIdentificacion);
CREATE INDEX idx_informacion_personal_empleado ON informacion_personal(empleado_id);
CREATE INDEX idx_formacion_empleado ON formacion(empleado_id);
CREATE INDEX idx_experiencia_empleado ON experiencia(empleado_id);
CREATE INDEX idx_otros_documentos_empleado ON otros_documentos(empleado_id);

-- Comentarios sobre la estructura
COMMENT ON TABLE empleados IS 'Tabla principal con información básica de empleados';
COMMENT ON TABLE informacion_personal IS 'Información personal detallada de cada empleado';
COMMENT ON TABLE formacion IS 'Formación académica de los empleados';
COMMENT ON TABLE experiencia IS 'Experiencia laboral previa de los empleados';
COMMENT ON TABLE otros_documentos IS 'Documentos adicionales requeridos por la empresa';
