const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload         = require('../middlewares/upload');

const {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateProfile,
    changePassword,
    uploadProfilePhoto
} = require('../controllers/authController');

// Public routes
router.post('/register', registerUser);
router.post('/login',    loginUser);
router.post('/logout',   logoutUser);

// Protected routes (require JWT cookie)
router.get('/profile',               authMiddleware, getUserProfile);
router.put('/profile',               authMiddleware, updateProfile);
router.put('/change-password',       authMiddleware, changePassword);
router.post('/profile/photo',        authMiddleware, upload.single('photo'), uploadProfilePhoto);

module.exports = router;