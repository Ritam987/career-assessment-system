/**
 * ============================================================================
 * AUTHENTICATION CONTROLLER (authController.js)
 * ============================================================================
 * Purpose: Handles user authentication operations including registration,
 * login with JWT token generation, and logout with session clearing.
 * Includes email normalization (.trim().toLowerCase()) and secure password 
 * hashing using bcrypt with salt rounds.
 * 
 * NOTE: User profile management (GET/UPDATE profile) has been moved to
 * userController.js to maintain separation of concerns:
 * - authController: Authentication (register, login, logout)
 * - userController: Profile Management (view, update, stats, delete)
 * ============================================================================
 */

// 1. Core Module Dependencies Imports
const bcrypt = require('bcrypt');       // Password hashing library using salted bcrypt algorithm
const jwt = require('jsonwebtoken');     // JSON Web Token signing and verification library
const userModel = require('../models/userModel'); // Database access abstraction layer for users
const db = require('../config/db');     // MySQL database connection pool instance

// ============================================================================
// 1. REGISTER USER CONTROLLER
// Endpoint: POST /api/auth/register
// ============================================================================
exports.registerUser = async (req, res) => {
    try {
        // Extract registration parameters from request body
        const { 
            name, email, password, phone, age, gender, dob, 
            city, state, pincode, education_level, preferred_field, career_goal 
        } = req.body;

        // Check if mandatory email and password are provided
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email, and password are required!' });
        }

        // Normalize email to lowercase to prevent duplicate registrations with different cases
        const cleanEmail = email.trim().toLowerCase();

        // 1. Check if account ALREADY exists in main users table
        const existingUser = await userModel.findUserByEmail(cleanEmail);
        if (existingUser) {
            return res.status(400).json({ message: 'This email address is already registered! Please log in.' });
        }

        // 2. Securely hash password using bcrypt with 10 salt rounds
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Prepare registration data payload (Users table remains UNTOUCHED until OTP is verified)
        const registrationData = {
            name: name.trim(),
            email: cleanEmail,
            hashedPassword,
            phone: phone ? phone.trim() : null,
            age: age ? parseInt(age, 10) : null,
            gender: gender || null,
            dob: dob || null,
            city: city ? city.trim() : null,
            state: state ? state.trim() : null,
            pincode: pincode ? pincode.trim() : null,
            education_level: education_level || null,
            preferred_field: preferred_field || null,
            career_goal: career_goal || null
        };

        // 4. Invalidate any previous unverified signup OTPs for this email
        await db.query(
            'UPDATE otps SET is_used = TRUE WHERE LOWER(email) = LOWER(?) AND purpose = "signup" AND is_used = FALSE',
            [cleanEmail]
        );

        // 5. Generate cryptographically secure 6-digit OTP code for sign-up verification
        const crypto = require('crypto');
        const { sendOTPEmail } = require('../utils/mailer');
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // 6. Save OTP code and registration payload into otps table
        await db.query(
            'INSERT INTO otps (email, otp_code, purpose, user_data, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
            [cleanEmail, otpCode, 'signup', JSON.stringify(registrationData)]
        );

        // 7. Non-blocking background email dispatch via Nodemailer SSL Port 465 IPv4
        sendOTPEmail({ to: cleanEmail, otpCode, purpose: 'signup' })
            .catch(err => console.error(`[Background Mailer Error for ${cleanEmail}]:`, err?.message || err));

        // 8. Return HTTP 201 Created response immediately
        res.status(201).json({ 
            message: 'Registration details saved! A 6-digit OTP code has been sent to your email address.',
            email: cleanEmail,
            requiresVerification: true
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Register Error:`, error);
        
        res.status(500).json({ 
            message: 'Internal server error during user registration!', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ============================================================================
// 2. LOGIN USER CONTROLLER
// Endpoint: POST /api/auth/login
// ============================================================================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate presence of credentials
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required!' });
        }

        // Normalize email input
        const cleanEmail = email.trim().toLowerCase();

        // Query database for user matching given email
        const user = await userModel.findUserByEmail(cleanEmail);
        if (!user) {
            // Check if there is an unverified signup OTP for this email in otps table
            const [unverifiedOtp] = await db.query(
                `SELECT id FROM otps WHERE LOWER(email) = LOWER(?) AND purpose = 'signup' AND is_used = FALSE AND expires_at > NOW() ORDER BY id DESC LIMIT 1`,
                [cleanEmail]
            );

            if (unverifiedOtp.length > 0) {
                return res.status(403).json({ 
                    message: 'Your account registration is incomplete. Please enter the OTP sent to your email address.',
                    unverified: true,
                    email: cleanEmail
                });
            }

            return res.status(404).json({ message: 'No registered user found with this email! Please check for typos or register first.' });
        }

        // Verify password against salted hash stored in database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password!' });
        }

        // Check if user account email has been verified
        if (user.is_verified === 0 || user.is_verified === false) {
            return res.status(403).json({ 
                message: 'Your email address is not verified yet. Please verify your account with OTP first.',
                unverified: true,
                email: user.email 
            });
        }

        // Generate signed JWT token valid for 1 day (24 hours)
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // Set JWT in secure HTTP-Only cookie header
        // Using 'lax' for sameSite to allow mobile device access via LAN IP
        res.cookie('token', token, {
            httpOnly: true, 
            secure: false, // Set to false for development to work with http:// (not https://)
            sameSite: 'lax', // Changed from 'strict' to 'lax' for mobile device compatibility
            maxAge: 24 * 60 * 60 * 1000 // 1 Day in milliseconds
        });

        // Return token and sanitized user details payload
        res.status(200).json({
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                preferred_field: user.preferred_field
            }
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Login Error:`, error);
        res.status(500).json({ 
            message: 'Internal server error during login!', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ============================================================================
// 3. LOGOUT USER CONTROLLER
// Endpoint: POST /api/auth/logout
// ============================================================================
exports.logoutUser = (req, res) => {
    // Clear JWT cookie by setting expiration to force immediate removal
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({ message: 'Logged out successfully!' });
};