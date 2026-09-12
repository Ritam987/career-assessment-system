/**
 * ============================================================================
 * USER PROFILE ROUTES ROUTER (userRoutes.js)
 * ============================================================================
 * Purpose: Defines HTTP route endpoints for user profile management operations
 * under `/api/user`. All routes are protected by authMiddleware requiring
 * valid JWT authentication token.
 * 
 * Route Separation Philosophy:
 * - /api/auth/* → Authentication operations (register, login, logout)
 * - /api/user/* → User profile & account management (CRUD operations)
 * ============================================================================
 */

// 1. Express Framework & Router Setup
const express = require('express');
const router = express.Router();

// 2. Middleware & Controller Imports
const authMiddleware = require('../middlewares/authMiddleware');
const { 
    getUserProfile, 
    updateUserProfile, 
    getUserStats,
    deleteUserAccount 
} = require('../controllers/userController');

// ============================================================================
// ROUTE ENDPOINTS (All Protected by authMiddleware)
// ============================================================================

// A. Fetch Current User Profile: GET /api/user/profile
router.get('/profile', authMiddleware, getUserProfile);

// B. Update Current User Profile: PUT /api/user/profile
router.put('/profile', authMiddleware, updateUserProfile);

// C. Get User Dashboard Statistics: GET /api/user/stats
router.get('/stats', authMiddleware, getUserStats);

// D. Delete User Account (Permanent): DELETE /api/user/account
router.delete('/account', authMiddleware, deleteUserAccount);

// Export router instance for mounting in server.js
module.exports = router;
