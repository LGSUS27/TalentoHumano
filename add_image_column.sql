-- Script para agregar columna de imagen a la tabla existente
-- Ejecutar este script si la base de datos ya existe

-- Agregar columna imagen_personal a la tabla informacion_personal
ALTER TABLE informacion_personal 
ADD COLUMN imagen_personal VARCHAR(255);

-- Comentario para la nueva columna
COMMENT ON COLUMN informacion_personal.imagen_personal IS 'Ruta del archivo de imagen personal del empleado';
