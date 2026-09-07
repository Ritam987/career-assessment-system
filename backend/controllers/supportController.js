const db = require('../config/db');

exports.submitSupportRequest = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields (name, email, subject, message) are required!' });
        }

        await db.query(
            'INSERT INTO support_requests (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, subject, message]
        );

        res.status(201).json({ message: 'Support request submitted successfully! Our team will contact you shortly.' });
    } catch (error) {
        console.error('Submit support error:', error);
        res.status(500).json({ message: 'Failed to submit support request', error: error.message });
    }
};

exports.getAllSupportRequests = async (req, res) => {
    try {
        const [requests] = await db.query('SELECT * FROM support_requests ORDER BY created_at DESC');
        res.status(200).json({ total: requests.length, requests });
    } catch (error) {
        console.error('Fetch support error:', error);
        res.status(500).json({ message: 'Failed to fetch support requests', error: error.message });
    }
};
