-- ============================================
-- MÓDULO: EVALUACIÓN DE DESEMPEÑO
-- Sistema de Recursos Humanos 2025
-- ============================================

-- ============================================
-- PASO 1: AGREGAR SISTEMA DE ROLES
-- ============================================

-- Agregar columna de rol a la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'supervisor'
CHECK (rol IN ('admin', 'supervisor'));

-- Agregar columna de empleado_id para vincular usuarios con empleados
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS empleado_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL;

-- Actualizar el usuario admin existente
UPDATE usuarios SET rol = 'admin' WHERE username = 'admin';

-- Crear índice para rol
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_empleado ON usuarios(empleado_id);

-- ============================================
-- PASO 2: TABLAS DE EVALUACIÓN DE DESEMPEÑO
-- ============================================

-- Tabla de períodos de evaluación
CREATE TABLE IF NOT EXISTS periodos_evaluacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('18 dias', 'trimestral', 'semestral', 'anual')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fecha_valida CHECK (fecha_fin >= fecha_inicio)
);

-- Tabla de evaluaciones de desempeño
CREATE TABLE IF NOT EXISTS evaluaciones_desempeno (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    periodo_id INTEGER REFERENCES periodos_evaluacion(id) ON DELETE SET NULL,
    evaluador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo_evaluacion VARCHAR(50) DEFAULT 'jefe' CHECK (tipo_evaluacion IN ('por competencias y habilidades funcionales', 'prorroga de contrato')),
    fecha_evaluacion DATE DEFAULT CURRENT_DATE,
    
    -- Puntuaciones por categoría (escala 1-5)
    calidad_trabajo DECIMAL(3,2) CHECK (calidad_trabajo >= 1 AND calidad_trabajo <= 5),
    productividad DECIMAL(3,2) CHECK (productividad >= 1 AND productividad <= 5),
    conocimiento_tecnico DECIMAL(3,2) CHECK (conocimiento_tecnico >= 1 AND conocimiento_tecnico <= 5),
    trabajo_equipo DECIMAL(3,2) CHECK (trabajo_equipo >= 1 AND trabajo_equipo <= 5),
    comunicacion DECIMAL(3,2) CHECK (comunicacion >= 1 AND comunicacion <= 5),
    liderazgo DECIMAL(3,2) CHECK (liderazgo >= 1 AND liderazgo <= 5),
    responsabilidad DECIMAL(3,2) CHECK (responsabilidad >= 1 AND responsabilidad <= 5),
    iniciativa DECIMAL(3,2) CHECK (iniciativa >= 1 AND iniciativa <= 5),
    
    -- Puntuación total (calculada como promedio)
    puntuacion_total DECIMAL(5,2),
    porcentaje_logro DECIMAL(5,2) DEFAULT 0, -- % de objetivos cumplidos
    
    -- Comentarios cualitativos
    fortalezas TEXT,
    oportunidades_mejora TEXT,
    comentarios_generales TEXT,
    
    -- Plan de mejora individual (PIP)
    requiere_plan_mejora BOOLEAN DEFAULT false,
    plan_mejora TEXT,
    fecha_seguimiento DATE,
    
    -- Estado de la evaluación
    estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('completada', 'aprobada', 'pendiente', 'en_progreso', 'cancelada')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Un empleado solo puede tener una evaluación por período del mismo tipo
    UNIQUE(empleado_id, periodo_id, tipo_evaluacion)
);

-- Tabla de metas/objetivos individuales
CREATE TABLE IF NOT EXISTS metas_empleado (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    periodo_id INTEGER REFERENCES periodos_evaluacion(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    peso_porcentaje DECIMAL(5,2) DEFAULT 0 CHECK (peso_porcentaje >= 0 AND peso_porcentaje <= 100),
    fecha_limite DATE,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'no_cumplida', 'cancelada')),
    porcentaje_cumplimiento DECIMAL(5,2) DEFAULT 0 CHECK (porcentaje_cumplimiento >= 0 AND porcentaje_cumplimiento <= 100),
    observaciones TEXT,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_periodos_activo ON periodos_evaluacion(activo);
CREATE INDEX IF NOT EXISTS idx_periodos_fecha ON periodos_evaluacion(fecha_inicio, fecha_fin);

CREATE INDEX IF NOT EXISTS idx_evaluaciones_empleado ON evaluaciones_desempeno(empleado_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_periodo ON evaluaciones_desempeno(periodo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_evaluador ON evaluaciones_desempeno(evaluador_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_estado ON evaluaciones_desempeno(estado);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON evaluaciones_desempeno(fecha_evaluacion);

CREATE INDEX IF NOT EXISTS idx_metas_empleado ON metas_empleado(empleado_id);
CREATE INDEX IF NOT EXISTS idx_metas_periodo ON metas_empleado(periodo_id);
CREATE INDEX IF NOT EXISTS idx_metas_estado ON metas_empleado(estado);

-- ============================================
-- FUNCIÓN PARA CALCULAR PUNTUACIÓN TOTAL
-- ============================================

CREATE OR REPLACE FUNCTION calcular_puntuacion_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular el promedio de todas las categorías
    NEW.puntuacion_total := (
        COALESCE(NEW.calidad_trabajo, 0) +
        COALESCE(NEW.productividad, 0) +
        COALESCE(NEW.conocimiento_tecnico, 0) +
        COALESCE(NEW.trabajo_equipo, 0) +
        COALESCE(NEW.comunicacion, 0) +
        COALESCE(NEW.liderazgo, 0) +
        COALESCE(NEW.responsabilidad, 0) +
        COALESCE(NEW.iniciativa, 0)
    ) / 8.0;
    
    -- Actualizar updated_at
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automáticamente la puntuación total
DROP TRIGGER IF EXISTS trigger_calcular_puntuacion ON evaluaciones_desempeno;
CREATE TRIGGER trigger_calcular_puntuacion
    BEFORE INSERT OR UPDATE ON evaluaciones_desempeno
    FOR EACH ROW
    EXECUTE FUNCTION calcular_puntuacion_total();

-- ============================================
-- FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_periodos_updated_at ON periodos_evaluacion;
CREATE TRIGGER trigger_periodos_updated_at
    BEFORE UPDATE ON periodos_evaluacion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_metas_updated_at ON metas_empleado;
CREATE TRIGGER trigger_metas_updated_at
    BEFORE UPDATE ON metas_empleado
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- ============================================
-- COMENTARIOS SOBRE LAS TABLAS
-- ============================================

COMMENT ON TABLE periodos_evaluacion IS 'Períodos de evaluación configurables (mensual, trimestral, anual)';
COMMENT ON TABLE evaluaciones_desempeno IS 'Evaluaciones de desempeño de empleados con puntuaciones por categoría';
COMMENT ON TABLE metas_empleado IS 'Objetivos y metas individuales por período';

COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: admin (acceso total y gestión), supervisor (puede evaluar y gestionar su equipo)';
COMMENT ON COLUMN evaluaciones_desempeno.puntuacion_total IS 'Promedio calculado automáticamente de todas las categorías';
COMMENT ON COLUMN evaluaciones_desempeno.porcentaje_logro IS 'Porcentaje de metas cumplidas en el período';
COMMENT ON COLUMN metas_empleado.peso_porcentaje IS 'Peso de esta meta en la evaluación total (la suma de todas las metas debería ser 100%)';

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Insertar un período de evaluación de prueba
INSERT INTO periodos_evaluacion (nombre, tipo, fecha_inicio, fecha_fin, descripcion, activo)
VALUES
    ('Evaluación Anual 2025', 'anual', '2025-01-01', '2025-12-31', 'Período de evaluación anual 2025', true),
    ('Q1 2025', 'trimestral', '2025-01-01', '2025-03-31', 'Primer trimestre 2025', false),
    ('Q2 2025', 'trimestral', '2025-04-01', '2025-06-30', 'Segundo trimestre 2025', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las tablas se crearon correctamente
SELECT
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_name IN ('periodos_evaluacion', 'evaluaciones_desempeno', 'metas_empleado')
ORDER BY table_name;

-- Verificar que la columna rol se agregó a usuarios
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'usuarios' AND column_name IN ('rol', 'empleado_id');

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

