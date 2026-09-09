/**
 * upload.js — Multer middleware for file uploads
 * Usage: const upload = require('./upload');
 *        router.post('/route', authMiddleware, upload.single('photo'), handler);
 */
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = process.env.UPLOAD_DIR || './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // e.g. user_5_1693000000000.jpg
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'), false);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }  // 5 MB max
});
