/**
 * ============================================================================
 * AUTHENTICATION ROUTES ROUTER (authRoutes.js)
 * ============================================================================
 * Purpose: Defines HTTP route endpoints for user registration, user login,
 * user logout, profile fetching, and profile updating under `/api/auth`.
 * Uses `authMiddleware` to guard protected profile endpoints.
 * ============================================================================
 */

// 1. Express Framework & Router Setup
const express = require('express');
const router = express.Router();

// 2. Middleware & Controller Imports
const authMiddleware = require('../middlewares/authMiddleware');
const { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile } = require('../controllers/authController');

// ============================================================================
// ROUTE ENDPOINTS
// ============================================================================

// A. Register New User: POST /api/auth/register
router.post('/register', registerUser);

// B. User Login: POST /api/auth/login
router.post('/login', loginUser);

// C. User Logout: POST /api/auth/logout
router.post('/logout', logoutUser);

// D. Fetch Current User Profile (Protected): GET /api/auth/profile
router.get('/profile', authMiddleware, getUserProfile);

// E. Update Current User Profile (Protected): PUT /api/auth/profile
router.put('/profile', authMiddleware, updateUserProfile);

// Export router instance for mounting in server.js
module.exports = router;