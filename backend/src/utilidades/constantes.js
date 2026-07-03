// Estados de incidencias
const ESTADOS = {
    PENDIENTE: 1,
    EN_REVISION: 2,
    EN_CURSO: 3,
    CERRADA: 4
};

// Prioridades
const PRIORIDADES = {
    BAJA: 'baja',
    MEDIA: 'media',
    ALTA: 'alta',
    CRITICA: 'critica'
};

// Tipos de usuario
const TIPOS_USUARIO = {
    CIUDADANO: 'ciudadano',
    OPERADOR: 'operador'
};

// Tipos de acciones municipales
const TIPOS_ACCION = {
    VACUNACION: 'vacunacion',
    ESTERILIZACION: 'esterilizacion',
    RESCATE: 'rescate',
    ATENCION_VETERINARIA: 'atencion_veterinaria',
    REUBICACION: 'reubicacion',
    ALIMENTACION: 'alimentacion',
    SEGUIMIENTO: 'seguimiento',
    DERIVACION: 'derivacion',
    OTRO: 'otro'
};

// Mensajes de respuesta comunes
const MENSAJES = {
    REGISTRO_EXITOSO: 'Usuario registrado exitosamente',
    LOGIN_EXITOSO: 'Inicio de sesión exitoso',
    LOGIN_FALLIDO: 'Email o contraseña incorrectos',
    INCIDENCIA_CREADA: 'Incidencia registrada exitosamente',
    INCIDENCIA_ACTUALIZADA: 'Incidencia actualizada exitosamente',
    ACCION_REGISTRADA: 'Acción municipal registrada exitosamente',
    SIN_PERMISO: 'No tienes permiso para realizar esta acción',
    USUARIO_INACTIVO: 'Usuario inactivo. Contacte al administrador.'
};

module.exports = {
    ESTADOS,
    PRIORIDADES,
    TIPOS_USUARIO,
    TIPOS_ACCION,
    MENSAJES
};