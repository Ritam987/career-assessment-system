const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { submitSupportRequest, getAllSupportRequests } = require('../controllers/supportController');

// Submit request can be called by logged in user or guest
router.post('/request', (req, res, next) => {
    // Optional auth middleware
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return authMiddleware(req, res, next);
    }
    next();
}, submitSupportRequest);

// Admin view all requests
router.get('/all', adminMiddleware, getAllSupportRequests);

module.exports = router;
