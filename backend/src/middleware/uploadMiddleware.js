const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../../uploads/incidencias');
        // Crear carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar nombre único: timestamp_random.jpg
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `incidencia_${uniqueSuffix}${ext}`);
    }
});

// Filtrar archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no permitido. Solo imágenes (JPEG, PNG, JPG, GIF, WEBP)'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: fileFilter
});

// Middleware para subida única
const uploadSingle = upload.single('imagen');

// Middleware para subida múltiple (si se necesita)
const uploadMultiple = upload.array('imagenes', 5);

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple
};