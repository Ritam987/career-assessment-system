const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getUserNotifications, markAllAsRead } = require('../controllers/notificationController');

router.get('/', authMiddleware, getUserNotifications);
router.put('/read-all', authMiddleware, markAllAsRead);

module.exports = router;
