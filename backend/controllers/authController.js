/**
 * ============================================================================
 * AUTHENTICATION CONTROLLER (authController.js)
 * ============================================================================
 * Purpose: Handles direct user authentication operations including registration,
 * login with JWT token generation, and logout with session clearing.
 * Includes email normalization (.trim().toLowerCase()) and secure password 
 * hashing using bcrypt with salt rounds.
 * ============================================================================
 */

// 1. Core Module Dependencies Imports
const bcrypt = require('bcrypt');       // Password hashing library using salted bcrypt algorithm
const jwt = require('jsonwebtoken');     // JSON Web Token signing and verification library
const userModel = require('../models/userModel'); // Database access abstraction layer for users
const db = require('../config/db');     // MySQL database connection pool instance

// ============================================================================
// 1. REGISTER USER CONTROLLER (Direct Registration without mandatory OTP)
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

        // 3. Directly create user record in users database table
        const result = await userModel.createUser({
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
            career_goal: career_goal || null,
            is_verified: true
        });

        const userId = result.insertId;

        // 4. Generate signed JWT token valid for 1 day (24 hours)
        const token = jwt.sign(
            { id: userId, email: cleanEmail }, 
            process.env.JWT_SECRET || 'super_secret_key', 
            { expiresIn: '1d' }
        );

        // 5. Set JWT in secure cookie
        res.cookie('token', token, {
            httpOnly: true, 
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        // 6. Return HTTP 201 Created response with token & user details
        res.status(201).json({ 
            message: 'Registration successful! Welcome to REACH INDIA Portal.',
            token: token,
            requiresVerification: false,
            user: {
                id: userId,
                name: name.trim(),
                email: cleanEmail,
                preferred_field: preferred_field || null
            }
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
            return res.status(404).json({ message: 'No registered user found with this email! Please check for typos or register first.' });
        }

        // Verify password against salted hash stored in database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password!' });
        }

        // Generate signed JWT token valid for 1 day (24 hours)
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'super_secret_key', 
            { expiresIn: '1d' }
        );

        // Set JWT in secure HTTP-Only cookie header
        res.cookie('token', token, {
            httpOnly: true, 
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
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
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({ message: 'Logged out successfully!' });
};