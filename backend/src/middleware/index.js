const autenticacion = require('./autenticacionMiddleware');
const upload = require('./uploadMiddleware');
const validacion = require('./validacionMiddleware');

module.exports = {
    autenticacion,
    upload,
    validacion
};