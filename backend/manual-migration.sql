-- Run this manually in MySQL Workbench / HeidiSQL / phpMyAdmin
-- as any admin user (root or otherwise)

USE career_assessment_db;

CREATE TABLE IF NOT EXISTS redo_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    completed_attempts_at_request INT NOT NULL DEFAULT 0,
    current_score DECIMAL(5,2) DEFAULT NULL,
    current_career VARCHAR(255) DEFAULT NULL,
    reviewed_by INT DEFAULT NULL,
    admin_comment TEXT DEFAULT NULL,
    approval_used TINYINT(1) NOT NULL DEFAULT 0,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_type ENUM('user','admin') NOT NULL,
    recipient_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INT DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Grant app user access to new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON career_assessment_db.redo_requests   TO 'carrera_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON career_assessment_db.notifications    TO 'carrera_app'@'localhost';
FLUSH PRIVILEGES;
