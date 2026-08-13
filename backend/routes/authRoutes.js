const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// 1. Register Route: POST http://localhost:5000/api/auth/register
router.post('/register', registerUser);

// 2. Login Route: POST http://localhost:5000/api/auth/login
router.post('/login', loginUser);

module.exports = router;