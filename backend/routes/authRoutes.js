const express = require('express'); // Import Express to create a router for authentication-related routes
const router = express.Router(); // Create a new router instance for handling authentication routes
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authentication middleware to protect certain routes

// logoutUser added
const { registerUser, loginUser, logoutUser, getUserProfile } = require('../controllers/authController');

// 1. Register Route: POST http://localhost:5000/api/auth/register
router.post('/register', registerUser);

// 2. Login Route: POST http://localhost:5000/api/auth/login
router.post('/login', loginUser);

// 3. Logout Route: POST http://localhost:5000/api/auth/logout
// New logout route
router.post('/logout', logoutUser);

// 4. Route to get user profile (protected route)
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router; // Export the router to be used in the main application file (app.js or server.js)