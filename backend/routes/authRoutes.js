const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload         = require('../middlewares/upload');

const authController = require('../controllers/authController');
const {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateProfile,
    changePassword,
    uploadProfilePhoto,
    googleLogin
} = authController;

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/google-register', authController.googleRegister);
router.get('/google-client-id', (req, res) => res.json({ clientId: process.env.GOOGLE_CLIENT_ID }));
router.post('/logout', logoutUser);

// Protected routes (require JWT cookie)
router.get('/profile',               authMiddleware, getUserProfile);
router.put('/profile',               authMiddleware, updateProfile);
router.put('/change-password',       authMiddleware, changePassword);
router.post('/profile/photo',        authMiddleware, upload.single('photo'), uploadProfilePhoto);

module.exports = router;