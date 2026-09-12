/**
 * ============================================================================
 * AUTOMATIC DATABASE TABLE INITIALIZER (initDb.js)
 * ============================================================================
 * Purpose: Automatically creates and verifies missing MySQL database tables
 * (notifications, support_requests, system_settings) on server startup.
 * Seeds default data into system_settings if it doesn't already exist.
 * ============================================================================
 */

// 1. Import MySQL Database Connection Pool
const db = require('./db');

/**
 * Initializes required MySQL database tables asynchronously.
 */
async function initDb() {
    try {
        // A. Create Notifications Table (Stores user-specific notification alerts)
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,              -- Unique notification primary key ID
                user_id INT NOT NULL,                            -- Target user foreign key reference
                title VARCHAR(255) NOT NULL,                    -- Short notification title
                message TEXT NOT NULL,                          -- Full notification body message text
                type VARCHAR(50) DEFAULT 'info',                -- Category type (info, success, warning, error)
                is_read BOOLEAN DEFAULT FALSE,                  -- Read/unread toggle flag
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Auto-generated creation timestamp
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // B. Create Support Requests Table (Stores customer support tickets submitted by users)
        await db.query(`
            CREATE TABLE IF NOT EXISTS support_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,              -- Support ticket unique ID
                user_id INT NULL,                               -- User ID if logged in (nullable for guest inquiries)
                name VARCHAR(255) NOT NULL,                     -- Sender full name
                email VARCHAR(255) NOT NULL,                    -- Sender contact email
                subject VARCHAR(255) NOT NULL,                  -- Inquiry subject topic
                message TEXT NOT NULL,                          -- Detailed problem/feedback description
                status VARCHAR(50) DEFAULT 'Open',              -- Ticket status (Open, In Progress, Closed)
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Submission timestamp
            )
        `);

        // C. Create System Settings Table (Stores global app settings editable by Admin)
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id INT PRIMARY KEY DEFAULT 1,                   -- Single-row configuration ID (fixed at 1)
                site_name VARCHAR(255) DEFAULT 'Career Assessment System', -- Global platform title name
                contact_email VARCHAR(255) DEFAULT 'support@careerassessment.com', -- Official support email
                contact_phone VARCHAR(50) DEFAULT '+91 98765 43210',              -- Official support phone
                test_duration_minutes INT DEFAULT 30,           -- Default assessment time limit in minutes
                passing_score INT DEFAULT 50,                   -- Passing threshold benchmark score percentage
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // D. Create Admins Table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'Admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // E. Seed Default System Configuration Data if Row 1 is empty
        const [rows] = await db.query('SELECT id FROM system_settings WHERE id = 1');
        if (rows.length === 0) {
            await db.query(`
                INSERT INTO system_settings (id, site_name, contact_email, contact_phone, test_duration_minutes, passing_score)
                VALUES (1, 'Career Assessment System', 'support@careerassessment.com', '+91 98765 43210', 30, 50)
            `);
            console.log('✅ Default system settings row seeded successfully.');
        }

        // F. Seed Default Super Admin if Admins table is empty
        const [adminRows] = await db.query('SELECT id FROM admins LIMIT 1');
        if (adminRows.length === 0) {
            const bcrypt = require('bcryptjs');
            const defaultHashedPassword = await bcrypt.hash('admin123', 10);
            await db.query(
                "INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ['Super Admin', 'admin@example.com', defaultHashedPassword, 'SuperAdmin']
            );
            console.log('✅ Default Super Admin account (admin@example.com / admin123) seeded successfully.');
        }

        // G. Create OTPs Table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_code VARCHAR(10) NOT NULL,
                purpose VARCHAR(50) DEFAULT 'verification',
                expires_at DATETIME NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email_purpose (email, purpose)
            )
        `);

        // H. Ensure is_verified column exists on users table
        try {
            await db.query(`ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT TRUE;`);
            console.log('✅ Added is_verified column to users table.');
        } catch (e) {
            // Ignore duplicate column error if already exists
        }

        console.log('✅ Automatic Database tables check & initialization complete.');
    } catch (error) {
        console.error('❌ Error during automatic database schema initialization:', error.message);
    }
}

// Export initialization function for execution in server.js
module.exports = initDb;
