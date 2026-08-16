const express = require('express'); // Import Express to create a router for assessment-related routes
const router = express.Router(); // Create a new router instance for handling assessment routes
const authMiddleware = require('../middlewares/authMiddleware'); // Importing authentication middleware to protect assessment routes

// Importing controller functions for assessment routes
const { startAssessment, getNextQuestion, submitAnswer, completeAssessment } = require('../controllers/assessmentController');

// 1. Start or Resume Assessment Route
router.post('/start', authMiddleware, startAssessment);

// 2. Fetch Next Question Route
router.get('/next-question', authMiddleware, getNextQuestion);

// 3. Submit Answer Route
router.post('/submit-answer', authMiddleware, submitAnswer);

// 4. Complete Assessment Route
// This route is for completing the assessment and finalizing the results. It requires authentication to ensure that only logged-in users can complete their assessments.
router.post('/complete', authMiddleware, completeAssessment);

module.exports = router; // Export the router to be used in the main application file (app.js or server.js)