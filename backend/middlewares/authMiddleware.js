const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Extract token from request cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: '⚠️ Unauthorized: No token provided. Please log in.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Save decoded user information in request object (so it can be used in controllers)
        req.user = decoded; 

        next(); // If everything is fine, pass to the next step (controller)
    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Auth Middleware Error:`, error.message);
        return res.status(401).json({ message: '❌ Unauthorized: Invalid or expired token.' });
    }
};

module.exports = authMiddleware;