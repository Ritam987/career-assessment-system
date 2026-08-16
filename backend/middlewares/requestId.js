const { v4: uuidv4 } = require('uuid'); // Import the UUID library to generate unique request IDs

const requestIdMiddleware = (req, res, next) => {
    // Check if the client sent an existing request ID, otherwise generate a new UUID
    const requestId = req.headers['x-request-id'] || uuidv4();

    // Attach the request ID to the request object so it's accessible across the lifecycle
    req.requestId = requestId;

    // Send the request ID back in the response headers for client-side tracking
    res.setHeader('X-Request-ID', requestId);

    // Proceed to the next middleware or controller
    next();
};

module.exports = requestIdMiddleware; // Export the middleware function for use in the application