const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token verification


const adminMiddleware = (req, res, next) => {  // Middleware function to verify admin access
    try {
        // release admin token from cookies
        const token = req.cookies.admin_token;

        if (!token) {
            return res.status(401).json({ message: '⚠️ Unauthorized: Admin token missing.' });
        }

        // verify the token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // check if the logged-in user is indeed a 'SuperAdmin' or 'Counselor'
        if (decoded.role !== 'SuperAdmin' && decoded.role !== 'Counselor') {
            return res.status(403).json({ message: '🚫 Forbidden: Admin access required.' });
        }

        req.admin = decoded; // save the decoded admin info to the request object for further use
        next();
    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Admin Auth Error:`, error.message);
        return res.status(401).json({ message: '❌ Unauthorized: Invalid or expired admin token.' });
    }
};

module.exports = adminMiddleware; // Export the middleware function for use in routes that require admin access