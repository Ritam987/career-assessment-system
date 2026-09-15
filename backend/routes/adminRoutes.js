const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middlewares/adminMiddleware');

const {
    registerAdmin,
    adminLogin,
    adminLogout,
    adminGoogleLogin,
    addQuestion,
    getAllQuestions,
    updateQuestion,
    deleteQuestion,
    addCareer,
    getAllCareers,
    updateCareer,
    deleteCareer,
    getAllUsers,
    getAdminAnalytics,
    getAllCategories,
    getAllRedoRequests,
    approveRedoRequest,
    rejectRedoRequest,
    getAdminProfile
} = require('../controllers/adminController');

const {
    getAdminNotifications,
    markAdminRead,
    markAdminAllRead
} = require('../controllers/notificationController');

// ─── Public ────────────────────────────────────────────
router.post('/register',      registerAdmin);
router.post('/login',         adminLogin);
router.post('/logout',        adminLogout);
router.post('/google',        adminGoogleLogin);
router.get('/google-client-id', (req, res) =>
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID })
);

// ─── Protected (admin_token cookie required) ───────────
router.get('/profile',        adminMiddleware, getAdminProfile);
router.get('/analytics',      adminMiddleware, getAdminAnalytics);

// Questions
router.post('/questions',         adminMiddleware, addQuestion);
router.get('/questions',          adminMiddleware, getAllQuestions);
router.put('/questions/:id',      adminMiddleware, updateQuestion);
router.delete('/questions/:id',   adminMiddleware, deleteQuestion);

// Careers
router.post('/careers',           adminMiddleware, addCareer);
router.get('/careers',            adminMiddleware, getAllCareers);
router.put('/careers/:id',        adminMiddleware, updateCareer);
router.delete('/careers/:id',     adminMiddleware, deleteCareer);

// Users
router.get('/users',              adminMiddleware, getAllUsers);

// Categories
router.get('/categories',         adminMiddleware, getAllCategories);

// Redo requests
router.get('/redo-requests',                    adminMiddleware, getAllRedoRequests);
router.post('/redo-requests/:id/approve',       adminMiddleware, approveRedoRequest);
router.post('/redo-requests/:id/reject',        adminMiddleware, rejectRedoRequest);

// Notifications
router.get('/notifications',                    adminMiddleware, getAdminNotifications);
router.patch('/notifications/read-all',         adminMiddleware, markAdminAllRead);
router.patch('/notifications/:id/read',         adminMiddleware, markAdminRead);

module.exports = router;
