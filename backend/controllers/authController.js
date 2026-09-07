/**
 * ============================================================================
 * AUTHENTICATION CONTROLLER (authController.js)
 * ============================================================================
 * Purpose: Handles user registration, user authentication login, JWT token
 * generation, cookie setting, logout, user profile retrieval, and user profile updates.
 * Includes email normalization (.trim().toLowerCase()) and password hashing using bcrypt.
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

        // Check if mandatory email is provided
        if (!email) {
            return res.status(400).json({ message: 'Email address is required!' });
        }

        // Normalize email to lowercase to prevent duplicate registrations with different cases
        const cleanEmail = email.trim().toLowerCase();

        // Check if account already exists in database with this email
        const existingUser = await userModel.findUserByEmail(cleanEmail);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists!' });
        }

        // Securely hash password using bcrypt with 10 salt rounds
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save new user profile into MySQL database via model
        await userModel.createUser({ 
            name, 
            email: cleanEmail, 
            hashedPassword, 
            phone,
            age, 
            gender, 
            dob, 
            city, 
            state, 
            pincode,
            education_level, 
            preferred_field, 
            career_goal
        });

        // Return HTTP 201 Created response
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        // Log detailed error stack with request ID for audit traceability
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
            return res.status(404).json({ message: 'No user found with this email! Please check for typos or register first.' });
        }

        // Verify password against salted hash stored in database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password!' });
        }

        // Generate signed JWT token valid for 1 day (24 hours)
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // Set JWT in secure HTTP-Only cookie header
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
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
    // Clear JWT cookie by setting expiration
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully!' });
};

// ============================================================================
// 4. FETCH LOGGED-IN USER PROFILE CONTROLLER
// Endpoint: GET /api/auth/profile
// ============================================================================
exports.getUserProfile = async (req, res) => {
    try {
        // req.user is set by authMiddleware from the verified JWT token payload
        const userId = req.user.id;

        // Fetch detailed profile fields for the user
        const query = `
            SELECT id, name, email, phone, created_at, age, gender, dob, city, state, pincode,
                   education_level, preferred_field, career_goal, profile_completed 
            FROM users WHERE id = ?
        `;
        
        const [users] = await db.query(query, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        res.status(200).json({ user: users[0] });
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        res.status(500).json({ message: 'Server error while fetching profile.', error: error.message });
    }
};

// ============================================================================
// 5. UPDATE USER PROFILE CONTROLLER
// Endpoint: PUT /api/auth/profile
// ============================================================================
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name, phone, education_level, age, preferred_field,
            career_goal, city, state, pincode, gender, dob
        } = req.body;

        // Clean & sanitize null/empty values
        const cleanDob = dob && dob.trim() !== '' ? dob : null;
        const cleanAge = age !== undefined && age !== '' && !isNaN(parseInt(age)) ? parseInt(age) : null;
        const cleanPhone = phone || null;
        const cleanEducation = education_level || null;
        const cleanPreferredField = preferred_field || null;
        const cleanCareerGoal = career_goal || null;
        const cleanCity = city || null;
        const cleanState = state || null;
        const cleanPincode = pincode || null;
        const cleanGender = gender || null;

        const query = `
            UPDATE users SET name = ?, phone = ?, education_level = ?, age = ?, preferred_field = ?,
            career_goal = ?, city = ?, state = ?, pincode = ?, gender = ?, dob = ?, profile_completed = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await db.query(query, [
            name, cleanPhone, cleanEducation, cleanAge, cleanPreferredField, 
            cleanCareerGoal, cleanCity, cleanState, cleanPincode, cleanGender, cleanDob, userId
        ]);

        // Return updated profile details
        const [rows] = await db.query(
            'SELECT id, name, email, phone, created_at, age, gender, dob, city, state, pincode, education_level, preferred_field, career_goal, profile_completed FROM users WHERE id = ?', 
            [userId]
        );
        
        res.status(200).json({ user: rows[0] });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error while updating profile.', error: error.message });
    }
};