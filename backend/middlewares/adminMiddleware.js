const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token verification

// Admin middleware supports cookie `admin_token` or Authorization header `Bearer <token>`
const adminMiddleware = (req, res, next) => {
    try {
        // Check cookie first, then Authorization header
        let token = req.cookies && req.cookies.admin_token;
        if (!token) {
            const authHeader = req.headers.authorization || req.headers.Authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Admin token missing.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'SuperAdmin' && decoded.role !== 'Counselor') {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Admin Auth Error:`, error.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired admin token.' });
    }
};

module.exports = adminMiddleware;