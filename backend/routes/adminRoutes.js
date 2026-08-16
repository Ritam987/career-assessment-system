const express = require('express'); 
const router = express.Router(); 
const adminMiddleware = require('../middlewares/adminMiddleware');

// Importing all functions from adminController.js
const { 
    setupFirstAdmin, 
    adminLogin, 
    addQuestion, 
    getAllQuestions, 
    addCareer,       
    getAllCareers    
} = require('../controllers/adminController'); 

// 1. Setup & Login
router.post('/setup', setupFirstAdmin);
router.post('/login', adminLogin);

// 2. Question Management Routes
router.post('/questions', adminMiddleware, addQuestion);
router.get('/questions', adminMiddleware, getAllQuestions);

// 3. Career Management Routes (Protected by Admin Middleware)
// Routes for adding and retrieving career entries, accessible only to authenticated admins
router.post('/careers', adminMiddleware, addCareer);
router.get('/careers', adminMiddleware, getAllCareers);

module.exports = router;