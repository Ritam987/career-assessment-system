/**
 * ============================================================================
 * AUTOMATIC DATABASE TABLE INITIALIZER (initDb.js)
 * ============================================================================
 * Purpose: Automatically creates and verifies missing MySQL database tables
 * (users, admins, categories, questions, careers, assessments, user_responses,
 * assessment_results, notifications, support_requests, system_settings, otps)
 * in strict sequential order (users created FIRST) to prevent foreign key crashes.
 * Seeds default data into system_settings and admins if they don't exist.
 * ============================================================================
 */

// 1. Import MySQL Database Connection Pool
const db = require('./db');

/**
 * Initializes required MySQL database tables asynchronously.
 */
async function initDb() {
    try {
        // Temporarily disable foreign key checks during schema initialization
        await db.query('SET FOREIGN_KEY_CHECKS = 0;');

        // 1. CREATE USERS TABLE FIRST (Parent table referenced by child foreign keys)
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20) NULL,
                password_hash VARCHAR(255) NOT NULL,
                age INT NULL,
                gender VARCHAR(20) NULL,
                dob DATE NULL,
                city VARCHAR(100) NULL,
                state VARCHAR(100) NULL,
                pincode VARCHAR(10) NULL,
                education_level VARCHAR(50) NULL,
                preferred_field VARCHAR(100) NULL,
                career_goal TEXT NULL,
                profile_completed BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2. CREATE ADMINS TABLE
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

        // 3. CREATE CATEGORIES TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. CREATE QUESTIONS TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                question_type VARCHAR(50) DEFAULT 'MCQ',
                question_text TEXT NOT NULL,
                option_a TEXT NULL,
                option_b TEXT NULL,
                option_c TEXT NULL,
                option_d TEXT NULL,
                score_a INT DEFAULT 0,
                score_b INT DEFAULT 0,
                score_c INT DEFAULT 0,
                score_d INT DEFAULT 0,
                correct_answer VARCHAR(10) NULL,
                correct_option VARCHAR(10) NULL,
                score_weight INT DEFAULT 1,
                mapped_trait VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. CREATE CAREERS TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS careers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                career_name VARCHAR(255) NOT NULL UNIQUE,
                category VARCHAR(100) NULL,
                required_traits TEXT NULL,
                description TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. CREATE ASSESSMENTS TABLE (Dependent on users)
        await db.query(`
            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                status VARCHAR(50) DEFAULT 'In_Progress',
                score INT DEFAULT 0,
                completed_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 7. CREATE USER RESPONSES TABLE (Dependent on assessments & questions)
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assessment_id INT NOT NULL,
                question_id INT NOT NULL,
                selected_option VARCHAR(10) NULL,
                score INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            )
        `);

        // 8. CREATE ASSESSMENT RESULTS TABLE (Dependent on users)
        await db.query(`
            CREATE TABLE IF NOT EXISTS assessment_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                assessment_id INT NULL,
                domain_scores JSON NULL,
                recommended_careers JSON NULL,
                pdf_report_url VARCHAR(500) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 9. CREATE NOTIFICATIONS TABLE (Dependent on users)
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 10. CREATE SUPPORT REQUESTS TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS support_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 11. CREATE SYSTEM SETTINGS TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id INT PRIMARY KEY DEFAULT 1,
                site_name VARCHAR(255) DEFAULT 'Career Assessment System',
                contact_email VARCHAR(255) DEFAULT 'support@careerassessment.com',
                contact_phone VARCHAR(50) DEFAULT '+91 98765 43210',
                test_duration_minutes INT DEFAULT 30,
                passing_score INT DEFAULT 50,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 12. CREATE OTPS TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_code VARCHAR(10) NOT NULL,
                purpose VARCHAR(50) DEFAULT 'verification',
                user_data TEXT NULL,
                expires_at DATETIME NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email_purpose (email, purpose)
            )
        `);

        try {
            await db.query(`ALTER TABLE otps ADD COLUMN user_data TEXT NULL;`);
        } catch (e) {}

        // Re-enable foreign key checks after schema initialization
        await db.query('SET FOREIGN_KEY_CHECKS = 1;');

        // Seed Default System Configuration Data if Row 1 is empty
        const [rows] = await db.query('SELECT id FROM system_settings WHERE id = 1');
        if (rows.length === 0) {
            await db.query(`
                INSERT INTO system_settings (id, site_name, contact_email, contact_phone, test_duration_minutes, passing_score)
                VALUES (1, 'Career Assessment System', 'support@careerassessment.com', '+91 98765 43210', 30, 50)
            `);
            console.log('✅ Default system settings row seeded successfully.');
        }

        // Seed Default Super Admin if Admins table is empty
        const [adminRows] = await db.query('SELECT id FROM admins LIMIT 1');
        if (adminRows.length === 0) {
            const bcrypt = require('bcryptjs');
            const defaultHashedPassword = await bcrypt.hash('Admin@1234', 10);
            await db.query(
                "INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ['Super admin', 'admin@example.com', defaultHashedPassword, 'SuperAdmin']
            );
            console.log('✅ Default Super Admin account (admin@example.com / Admin@1234) seeded successfully.');
        }

        console.log('✅ Automatic Database tables check & initialization complete.');
    } catch (error) {
        // Ensure foreign key checks are restored even if an error occurs
        try { await db.query('SET FOREIGN_KEY_CHECKS = 1;'); } catch (e) {}
        console.error('❌ Error during automatic database schema initialization:', error.message);
    }
}

// Export initialization function for execution in server.js
module.exports = initDb;
