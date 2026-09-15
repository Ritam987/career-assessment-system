const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getUserNotifications,
    markUserRead,
    markUserAllRead
} = require('../controllers/notificationController');

router.get('/', authMiddleware, getUserNotifications);
router.patch('/read-all', authMiddleware, markUserAllRead);
router.patch('/:id/read', authMiddleware, markUserRead);

module.exports = router;
