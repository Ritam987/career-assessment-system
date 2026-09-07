/**
 * ============================================================================
 * ADMIN ROLE AUTHORIZATION MIDDLEWARE (roleMiddleware.js)
 * ============================================================================
 * Purpose: Ensures that only authenticated users possessing valid Administrator
 * credentials recorded in the `admins` MySQL table can access protected admin
 * API endpoints. Returns HTTP 403 Forbidden if non-admin users attempt access.
 * ============================================================================
 */

// 1. Import MySQL Database connection pool
const db = require('../config/db');

/**
 * Role authorization guard middleware function.
 */
const roleMiddleware = async (req, res, next) => {
    try {
        // A. Extract user email from decoded req.user object (set by authMiddleware)
        const userEmail = req.user.email;

        // B. Query `admins` table to verify if user email possesses Admin role rights
        const [admin] = await db.query('SELECT * FROM admins WHERE email = ?', [userEmail]);

        // C. Reject request with 403 Forbidden if user email is not found in admins table
        if (admin.length === 0) {
            return res.status(403).json({ message: 'Access denied! Administrator privileges are required to perform this action.' });
        }

        // D. Proceed to protected Admin controller
        next();

    } catch (error) {
        console.error('Role Middleware Verification Error:', error);
        res.status(500).json({ message: 'Internal server error during admin role verification.' });
    }
};

// Export middleware module
module.exports = roleMiddleware;