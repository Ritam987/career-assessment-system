const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const {
    startAssessment,
    getAllQuestions,
    submitAnswer,
    completeAssessment,
    getResults,
    getProgress,
    getAssessmentHistory
} = require('../controllers/assessmentController');

// All routes protected — user must be logged in
router.post('/start',          authMiddleware, startAssessment);
router.get('/questions',       authMiddleware, getAllQuestions);
router.post('/submit-answer',  authMiddleware, submitAnswer);
router.post('/complete',       authMiddleware, completeAssessment);
router.get('/results',         authMiddleware, getResults);
router.get('/progress',        authMiddleware, getProgress);
router.get('/history',         authMiddleware, getAssessmentHistory);

module.exports = router;