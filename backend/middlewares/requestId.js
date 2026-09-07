/**
 * ============================================================================
 * REQUEST ID TRACING MIDDLEWARE (requestId.js)
 * ============================================================================
 * Purpose: Generates or propagates a unique UUID v4 tracking identifier for
 * every incoming HTTP request. Attaches req.requestId for backend error logging
 * and sets the X-Request-ID response header for client-side audit tracing.
 * ============================================================================
 */

// 1. Import UUID v4 generator library
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware function to attach unique Request ID to req & res.
 */
const requestIdMiddleware = (req, res, next) => {
    // A. Use client-provided X-Request-ID header if present, otherwise generate new UUID v4
    const requestId = req.headers['x-request-id'] || uuidv4();

    // B. Attach request ID to Express request object (accessible in req.requestId)
    req.requestId = requestId;

    // C. Set X-Request-ID header on outgoing HTTP response
    res.setHeader('X-Request-ID', requestId);

    // D. Pass control to next Express middleware/controller
    next();
};

// Export middleware module
module.exports = requestIdMiddleware;