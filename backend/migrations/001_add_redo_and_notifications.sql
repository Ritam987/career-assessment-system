-- ============================================================
-- Migration: Add redo_requests and notifications tables
-- Run: node backend/run-migration.js
-- ============================================================

CREATE TABLE IF NOT EXISTS redo_requests (
    id                            INT PRIMARY KEY AUTO_INCREMENT,
    user_id                       INT NOT NULL,
    reason                        TEXT NOT NULL,
    status                        ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    completed_attempts_at_request INT NOT NULL DEFAULT 0,
    current_score                 DECIMAL(5,2) DEFAULT NULL,
    current_career                VARCHAR(100) DEFAULT NULL,
    reviewed_by                   INT DEFAULT NULL,
    admin_comment                 TEXT DEFAULT NULL,
    approval_used                 TINYINT(1) NOT NULL DEFAULT 0,
    requested_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at                   TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_rr_user   FOREIGN KEY (user_id)     REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_rr_admin  FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rr_user_status ON redo_requests(user_id, status);

CREATE TABLE IF NOT EXISTS notifications (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    recipient_type  ENUM('user','admin') NOT NULL,
    recipient_id    INT NOT NULL,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    related_id      INT DEFAULT NULL,
    action_url      VARCHAR(300) DEFAULT NULL,
    is_read         TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_type, recipient_id, is_read, created_at);
