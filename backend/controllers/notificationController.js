const db = require('../config/db');

// Fetch user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );

        // If user has no notifications yet, generate standard starter notifications
        if (notifications.length === 0) {
            const initialNotifs = [
                [userId, 'Assessment Reminder', 'You have not completed your assessment. Please continue where you left off.', 'reminder'],
                [userId, 'Important Update', 'We have updated our career database to provide better recommendations.', 'update'],
                [userId, 'Welcome!', 'Welcome to Career Assessment System! Take your first assessment to unlock personalized recommendations.', 'info']
            ];
            for (const notif of initialNotifs) {
                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                    notif
                );
            }
            const [fresh] = await db.query(
                'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            const unreadCount = fresh.filter(n => !n.is_read).length;
            return res.status(200).json({ notifications: fresh, unreadCount });
        }

        const unreadCount = notifications.filter(n => !n.is_read).length;
        res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Failed to mark notifications as read', error: error.message });
    }
};
