const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

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

module.exports = router;