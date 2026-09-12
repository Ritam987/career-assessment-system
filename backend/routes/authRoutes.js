/**
 * ============================================================================
 * AUTHENTICATION ROUTES ROUTER (authRoutes.js)
 * ============================================================================
 * Purpose: Defines HTTP route endpoints for user authentication operations
 * under `/api/auth`. Handles registration, login, and logout.
 * 
 * BACKWARD COMPATIBILITY: Profile routes are maintained here for legacy
 * frontend compatibility but delegate to userController. New implementations
 * should use `/api/user/profile` instead of `/api/auth/profile`.
 * ============================================================================
 */

// 1. Express Framework & Router Setup
const express = require('express');
const router = express.Router();

// 2. Middleware & Controller Imports
const authMiddleware = require('../middlewares/authMiddleware');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { sendOTP, verifyOTP, resetPasswordWithOTP } = require('../controllers/otpController');

// ============================================================================
// ROUTE ENDPOINTS
// ============================================================================

// A. Register New User: POST /api/auth/register
router.post('/register', registerUser);

// B. User Login: POST /api/auth/login
router.post('/login', loginUser);

// C. User Logout: POST /api/auth/logout
router.post('/logout', logoutUser);

// D. OTP Authentication & Self-Service Password Reset Routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);

// ============================================================================
// BACKWARD COMPATIBILITY ROUTES (Delegate to userController)
// New code should use /api/user/profile instead
// ============================================================================

// D. Fetch User Profile (Legacy): GET /api/auth/profile
router.get('/profile', authMiddleware, getUserProfile);

// E. Update User Profile (Legacy): PUT /api/auth/profile
router.put('/profile', authMiddleware, updateUserProfile);

// Export router instance for mounting in server.js
module.exports = router;