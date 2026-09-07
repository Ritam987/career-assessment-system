function handleServerError(res, req, error, message = 'Internal server error') {
    console.error(`[Req ID: ${req && req.requestId ? req.requestId : 'N/A'}] ${message}:`, error && error.message ? error.message : error);
    return res.status(500).json({ message, error: (error && error.message) || String(error), requestId: req && req.requestId });
}

module.exports = { handleServerError };
