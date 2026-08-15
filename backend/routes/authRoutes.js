const express = require('express');
const router = express.Router();
// 🔹 INJECTED: logoutUser added
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

// 1. Register Route: POST http://localhost:5000/api/auth/register
router.post('/register', registerUser);

// 2. Login Route: POST http://localhost:5000/api/auth/login
router.post('/login', loginUser);

// 3. Logout Route: POST http://localhost:5000/api/auth/logout
// 🔹 INJECTED: New logout route
router.post('/logout', logoutUser);

module.exports = router;