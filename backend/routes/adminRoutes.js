const express = require('express'); 
const router = express.Router(); 
const adminMiddleware = require('../middlewares/adminMiddleware');

// Importing all functions from adminController.js
const { 
    setupFirstAdmin, 
    adminLogin, 
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
    getAllCategories
} = require('../controllers/adminController'); 

// 1. Setup & Login
router.post('/setup', setupFirstAdmin);
router.post('/login', adminLogin);

// 2. Dashboard Analytics Route
// Fetch overall statistics for the admin dashboard
router.get('/analytics', adminMiddleware, getAdminAnalytics);

// 3. Question Management Routes
router.post('/questions', adminMiddleware, addQuestion);
router.get('/questions', adminMiddleware, getAllQuestions);
router.put('/questions/:id', adminMiddleware, updateQuestion); // Update specific question
router.delete('/questions/:id', adminMiddleware, deleteQuestion); // Delete specific question

// 4. Career Management Routes (Protected by Admin Middleware)
// Routes for adding, retrieving, updating, and deleting career entries
router.post('/careers', adminMiddleware, addCareer);
router.get('/careers', adminMiddleware, getAllCareers);
router.put('/careers/:id', adminMiddleware, updateCareer); // Update specific career
router.delete('/careers/:id', adminMiddleware, deleteCareer); // Delete specific career

// 5. User Management Route (Protected by Admin Middleware)
router.get('/users', adminMiddleware, getAllUsers);

// 6. Category Management Route (Protected by Admin Middleware)
router.get('/categories', adminMiddleware, getAllCategories);

module.exports = router;