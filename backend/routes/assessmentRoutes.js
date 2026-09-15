const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const {
    startAssessment,
    startNewAttempt,
    getAllQuestions,
    submitAnswer,
    completeAssessment,
    getResults,
    getProgress,
    getAssessmentHistory,
    createRedoRequest,
    getRedoRequestStatus
} = require('../controllers/assessmentController');

const {
    getUserNotifications,
    markUserRead,
    markUserAllRead
} = require('../controllers/notificationController');

// ─── Assessment ─────────────────────────────────────────
router.post('/start',          authMiddleware, startAssessment);
router.post('/start-new',      authMiddleware, startNewAttempt);
router.get('/questions',       authMiddleware, getAllQuestions);
router.post('/submit-answer',  authMiddleware, submitAnswer);
router.post('/complete',       authMiddleware, completeAssessment);
router.get('/results',         authMiddleware, getResults);
router.get('/progress',        authMiddleware, getProgress);
router.get('/history',         authMiddleware, getAssessmentHistory);

// ─── Redo requests ──────────────────────────────────────
router.post('/redo-request',        authMiddleware, createRedoRequest);
router.get('/redo-request/status',  authMiddleware, getRedoRequestStatus);

// ─── Notifications (user) ───────────────────────────────
router.get('/notifications',               authMiddleware, getUserNotifications);
router.patch('/notifications/read-all',    authMiddleware, markUserAllRead);
router.patch('/notifications/:id/read',    authMiddleware, markUserRead);

module.exports = router;
