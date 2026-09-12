/**
 * ============================================================================
 * OTP AUTHENTICATION CONTROLLER (otpController.js)
 * ============================================================================
 * Purpose: Handles 6-digit Email OTP generation, database storage with expiration,
 * Nodemailer dispatching, OTP verification, and OTP-based self-service Password Reset.
 * ============================================================================
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const userModel = require('../models/userModel');
const { sendOTPEmail } = require('../utils/mailer');

/**
 * Endpoint: POST /api/auth/send-otp
 * Generates 6-digit OTP, saves in database with 10-min expiry, and emails user.
 */
exports.sendOTP = async (req, res) => {
    try {
        const { email, purpose = 'signup' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email address is required!' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // 1. Check user account existence based on purpose
        const existingUser = await userModel.findUserByEmail(cleanEmail);

        if (purpose === 'password_reset') {
            if (!existingUser) {
                return res.status(404).json({ message: 'No registered account found with this email address.' });
            }
        } else if (purpose === 'signup') {
            if (existingUser && existingUser.is_verified) {
                return res.status(400).json({ message: 'This email is already registered and verified. Please log in.' });
            }
        }

        // 2. Generate cryptographically secure 6-digit numeric OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // 3. Mark previous active OTPs for this email/purpose as used
        await db.query(
            'UPDATE otps SET is_used = TRUE WHERE LOWER(email) = LOWER(?) AND purpose = ? AND is_used = FALSE',
            [cleanEmail, purpose]
        );

        // 4. Insert new OTP record into database with 10-minute expiration
        const query = `
            INSERT INTO otps (email, otp_code, purpose, expires_at)
            VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
        `;
        await db.query(query, [cleanEmail, otpCode, purpose]);

        // 5. Send OTP Email via Nodemailer asynchronously in background to prevent HTTP timeouts
        sendOTPEmail({ to: cleanEmail, otpCode, purpose })
            .catch(err => console.error(`[Background Mailer Error for ${cleanEmail}]:`, err?.message || err));

        res.status(200).json({
            message: `OTP sent successfully to ${cleanEmail}! Please check your email inbox.`,
            email: cleanEmail
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Failed to send OTP email.', error: error.message });
    }
};

/**
 * Endpoint: POST /api/auth/verify-otp
 * Verifies submitted OTP against database records and expiration.
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp, purpose = 'signup' } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and 6-digit OTP code are required!' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanOTP = otp.toString().trim();

        // Query database for matching, unexpired, unused OTP
        const [rows] = await db.query(
            `SELECT * FROM otps 
             WHERE LOWER(email) = LOWER(?) 
               AND purpose = ? 
               AND is_used = FALSE 
               AND expires_at > NOW() 
             ORDER BY id DESC LIMIT 1`,
            [cleanEmail, purpose]
        );

        if (rows.length === 0 || rows[0].otp_code !== cleanOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP code! Please request a new one.' });
        }

        const matchedRecord = rows[0];

        // Mark OTP as used
        await db.query('UPDATE otps SET is_used = TRUE WHERE id = ?', [matchedRecord.id]);

        // If user already exists in database, mark account as is_verified = TRUE
        await db.query('UPDATE users SET is_verified = TRUE WHERE LOWER(email) = LOWER(?)', [cleanEmail]);

        res.status(200).json({
            message: 'OTP verified successfully!',
            verified: true,
            email: cleanEmail
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Failed to verify OTP.', error: error.message });
    }
};

/**
 * Endpoint: POST /api/auth/reset-password-otp
 * Verifies OTP and resets user password in database.
 */
exports.resetPasswordWithOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP code, and new password are required!' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanOTP = otp.toString().trim();

        // 1. Verify OTP code against database
        const [rows] = await db.query(
            `SELECT * FROM otps 
             WHERE LOWER(email) = LOWER(?) 
               AND purpose = 'password_reset' 
               AND is_used = FALSE 
               AND expires_at > NOW() 
             ORDER BY id DESC LIMIT 1`,
            [cleanEmail]
        );

        if (rows.length === 0 || rows[0].otp_code !== cleanOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP code! Please request a new OTP.' });
        }

        const matchedRecord = rows[0];

        // 2. Hash new password securely
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update user password and ensure is_verified = TRUE
        const [updateResult] = await db.query(
            'UPDATE users SET password_hash = ?, is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = LOWER(?)',
            [hashedPassword, cleanEmail]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'No registered user found with this email address.' });
        }

        // 4. Mark OTP as used
        await db.query('UPDATE otps SET is_used = TRUE WHERE id = ?', [matchedRecord.id]);

        res.status(200).json({
            message: 'Password reset successful! You can now log in with your new password.',
            email: cleanEmail
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error resetting password.', error: error.message });
    }
};
