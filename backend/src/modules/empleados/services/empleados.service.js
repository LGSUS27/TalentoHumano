// src/modules/empleados/services/empleados.service.js
import empleadoModel from '../models/empleado.model.js';
import empleadosValidator from '../validators/empleados.validator.js';
import Logger from '../../../shared/utils/logger.js';
import { deleteFile } from '../../../shared/utils/multer.js';

/**
 * Servicio de empleados
 * Lógica de negocio para gestión de empleados
 */
class EmpleadosService {
/**
   * Obtener todos los empleados
   */
async getAllEmpleados() {
    try {
    const empleados = await empleadoModel.findAll();
    Logger.debug(`Se obtuvieron ${empleados.length} empleados`);
    return empleados;
    } catch (error) {
    Logger.error('Error en EmpleadosService.getAllEmpleados:', error);
    throw error;
    }
}

/**
   * Obtener empleado por ID
   */
async getEmpleadoById(id) {
    try {
    const empleado = await empleadoModel.findById(id);
    
    if (!empleado) {
        return { found: false };
    }

    return { found: true, empleado };
    } catch (error) {
    Logger.error('Error en EmpleadosService.getEmpleadoById:', error);
    throw error;
    }
}

/**
   * Crear nuevo empleado
   */
async createEmpleado(empleadoData) {
    try {
      // Validar datos
    const validation = empleadosValidator.validate(empleadoData);
    if (!validation.isValid) {
        return { success: false, errors: validation.errors };
    }

      // Verificar si ya existe un empleado con ese número de identificación
    const existingEmpleado = await empleadoModel.findByNumeroIdentificacion(
        empleadoData.numeroIdentificacion
    );

    if (existingEmpleado) {
        return {
        success: false,
        message: 'Ya existe un empleado con este número de identificación',
        };
    }

      // Crear empleado
    const empleado = await empleadoModel.create(empleadoData);

      // Crear registro básico en información personal
    await empleadoModel.createInformacionPersonalBasica(
        empleado.id,
        empleadoData.numeroIdentificacion
    );

    Logger.success(`Empleado creado: ${empleado.nombre} (ID: ${empleado.id})`);
    
    return { success: true, empleado };
    } catch (error) {
      // Manejo de error de duplicado (por si acaso)
    if (error.code === '23505' && error.constraint === 'empleados_numeroidentificacion_key') {
        return {
        success: false,
        message: 'Ya existe un empleado con este número de identificación',
        };
    }

    Logger.error('Error en EmpleadosService.createEmpleado:', error);
    throw error;
    }
}

/**
   * Actualizar empleado
   */
async updateEmpleado(id, empleadoData) {
    try {
      // Validar datos
    const validation = empleadosValidator.validate(empleadoData);
    if (!validation.isValid) {
        return { success: false, errors: validation.errors };
    }

      // Verificar que existe
    const existingEmpleado = await empleadoModel.findById(id);
    if (!existingEmpleado) {
        return { success: false, notFound: true };
    }

      // Actualizar
    const empleado = await empleadoModel.update(id, empleadoData);

    Logger.success(`Empleado actualizado: ${empleado.nombre} (ID: ${empleado.id})`);
    
    return { success: true, empleado };
    } catch (error) {
    Logger.error('Error en EmpleadosService.updateEmpleado:', error);
    throw error;
    }
}

/**
   * Eliminar empleado
   * IMPORTANTE: También elimina todos los archivos físicos asociados
   */
async deleteEmpleado(id) {
    try {
      // Verificar que existe
    const existingEmpleado = await empleadoModel.findById(id);
    if (!existingEmpleado) {
        return { success: false, notFound: true };
    }

      // Obtener todos los archivos asociados al empleado ANTES de eliminarlo
    Logger.info(`Obteniendo archivos del empleado ${existingEmpleado.nombre} (ID: ${id})`);
    const allFiles = await empleadoModel.getAllFilesForEmpleado(id);

      // Contar archivos totales
    const totalFiles =
        allFiles.informacionPersonal.length +
        allFiles.formacion.length +
        allFiles.experiencia.length +
        allFiles.otrosDocumentos.length;

    Logger.info(`Se encontraron ${totalFiles} archivo(s) para eliminar`);

      // Eliminar archivos físicos
    let deletedCount = 0;
    let failedCount = 0;

      // Eliminar archivos de información personal
    for (const fileInfo of allFiles.informacionPersonal) {
        try {
        if (deleteFile(fileInfo.file, fileInfo.subFolder)) {
            deletedCount++;
            Logger.debug(`Archivo eliminado: ${fileInfo.file}`);
        } else {
            failedCount++;
            Logger.warn(`No se pudo eliminar el archivo: ${fileInfo.file}`);
        }
        } catch (error) {
        failedCount++;
        Logger.warn(`Error al eliminar archivo ${fileInfo.file}:`, error.message);
        }
    }

      // Eliminar archivos de formación
    for (const fileInfo of allFiles.formacion) {
        try {
        if (deleteFile(fileInfo.file, fileInfo.subFolder)) {
            deletedCount++;
            Logger.debug(`Archivo eliminado: ${fileInfo.file}`);
        } else {
            failedCount++;
            Logger.warn(`No se pudo eliminar el archivo: ${fileInfo.file}`);
        }
        } catch (error) {
        failedCount++;
        Logger.warn(`Error al eliminar archivo ${fileInfo.file}:`, error.message);
        }
    }

      // Eliminar archivos de experiencia
    for (const fileInfo of allFiles.experiencia) {
        try {
        if (deleteFile(fileInfo.file, fileInfo.subFolder)) {
            deletedCount++;
            Logger.debug(`Archivo eliminado: ${fileInfo.file}`);
        } else {
            failedCount++;
            Logger.warn(`No se pudo eliminar el archivo: ${fileInfo.file}`);
        }
        } catch (error) {
        failedCount++;
        Logger.warn(`Error al eliminar archivo ${fileInfo.file}:`, error.message);
        }
    }

      // Eliminar archivos de otros documentos
    for (const fileInfo of allFiles.otrosDocumentos) {
        try {
        if (deleteFile(fileInfo.file, fileInfo.subFolder)) {
            deletedCount++;
            Logger.debug(`Archivo eliminado: ${fileInfo.file}`);
        } else {
            failedCount++;
            Logger.warn(`No se pudo eliminar el archivo: ${fileInfo.file}`);
        }
        } catch (error) {
        failedCount++;
        Logger.warn(`Error al eliminar archivo ${fileInfo.file}:`, error.message);
        }
    }

    Logger.info(`Archivos eliminados: ${deletedCount}/${totalFiles} (${failedCount} fallidos)`);

      // Ahora eliminar el empleado de la base de datos (CASCADE eliminará registros relacionados)
    const empleado = await empleadoModel.delete(id);

    Logger.success(
        `Empleado eliminado: ${empleado.nombre} (ID: ${empleado.id}) - ` +
        `${deletedCount} archivo(s) físico(s) eliminado(s)`
    );
    
    return {
        success: true,
        empleado,
        filesDeleted: deletedCount,
        filesFailed: failedCount
    };
    } catch (error) {
    Logger.error('Error en EmpleadosService.deleteEmpleado:', error);
    throw error;
    }
}

/**
   * Cambiar estado del empleado
   */
async cambiarEstado(id, estado) {
    try {
      // Validar estado
    const validation = empleadosValidator.validateEstado(estado);
    if (!validation.isValid) {
        return { success: false, message: validation.error };
    }

      // Verificar que existe
    const existingEmpleado = await empleadoModel.findById(id);
    if (!existingEmpleado) {
        return { success: false, notFound: true };
    }

      // Si ya tiene el mismo estado, no hacer nada
    if (existingEmpleado.estado === estado) {
        return {
        success: true,
        message: `El empleado ya tiene el estado "${estado}"`,
        empleado: existingEmpleado,
        };
    }

      // Actualizar estado
    const empleado = await empleadoModel.updateEstado(id, estado);

    const mensaje = estado === 'activo'
        ? 'Empleado reactivado exitosamente'
        : 'Empleado desvinculado exitosamente';

    Logger.success(`${mensaje}: ${empleado.nombre} (ID: ${empleado.id})`);
    
    return { success: true, message: mensaje, empleado };
    } catch (error) {
    Logger.error('Error en EmpleadosService.cambiarEstado:', error);
    throw error;
    }
}
}

export default new EmpleadosService();
