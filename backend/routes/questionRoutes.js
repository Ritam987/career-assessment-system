const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware'); // Import the roleMiddleware for admin access control

const { addQuestion, getAllQuestions, updateQuestion, deleteQuestion } = require('../controllers/questionController');

// Admin CRUD Routes for Questions 
router.post('/add', authMiddleware, roleMiddleware, addQuestion);
router.get('/all', authMiddleware, roleMiddleware, getAllQuestions);
router.put('/update/:id', authMiddleware, roleMiddleware, updateQuestion);
router.delete('/delete/:id', authMiddleware, roleMiddleware, deleteQuestion);

module.exports = router;