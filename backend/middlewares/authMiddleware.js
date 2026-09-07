/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE (authMiddleware.js)
 * ============================================================================
 * Purpose: Verifies incoming user JSON Web Tokens (JWT) attached via HTTP-Only
 * cookies or standard Bearer authorization headers. Attaches the decoded user
 * payload (user ID, email) to req.user for protected route access control.
 * ============================================================================
 */

// 1. Import JSON Web Token verification library
const jwt = require('jsonwebtoken');

/**
 * Middleware handler to authenticate incoming HTTP requests.
 */
const authMiddleware = (req, res, next) => {
    try {
        // A. Prefer retrieving token from HTTP-Only cookie 'token'
        let token = req.cookies && req.cookies.token;

        // B. Fall back to checking Authorization header: "Bearer <token>"
        if (!token) {
            const authHeader = req.headers.authorization || req.headers.Authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1]; // Extract token string after "Bearer " prefix
            }
        }

        // C. Reject request if no authorization token was found
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Access token missing. Please log in to continue.' });
        }

        // D. Verify token integrity and signature using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // E. Attach decoded token payload (e.g. { id, email }) to request object
        req.user = decoded;

        // F. Proceed to next controller middleware
        next();

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Auth Middleware Verification Error:`, error.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired access token.' });
    }
};

// Export middleware for route protection
module.exports = authMiddleware;