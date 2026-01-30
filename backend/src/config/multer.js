const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH || './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
};

// File filter for 3D models
const modelFilter = (req, file, cb) => {
    const allowedTypes = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
    const allowedExtensions = ['.glb', '.gltf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only GLB and GLTF models are allowed.'), false);
    }
};

// Create upload instances
const uploadImages = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: 60 // Max 60 images for photogrammetry
    }
});

const uploadModel = multer({
    storage,
    fileFilter: modelFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB for 3D models
    }
});

const uploadThumbnail = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB for thumbnails
    }
});

module.exports = {
    uploadImages,
    uploadModel,
    uploadThumbnail
};
