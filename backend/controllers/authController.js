const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); // Importing the user model for database queries

// ==========================================
// 1. REGISTER CONTROLLER (Handles new user registration)
// ==========================================
exports.registerUser = async (req, res) => {
    try {
        const { full_name, email, password, age, preferred_field, career_goal } = req.body;

        // Check if user already exists using the model
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: '⚠️ User with this email already exists!' });
        }

        // Hash the password securely
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save the new user using the model
        await userModel.createUser({ 
            full_name, 
            email, 
            hashedPassword, 
            age, 
            preferred_field, 
            career_goal 
        });

        res.status(201).json({ message: '✅ User registered successfully!' });

    } catch (error) {
        // Log the error along with the unique request ID for easy debugging
        console.error(`[Req ID: ${req.requestId}] Register Error:`, error);
        
        // Return a response containing the request ID and error details
        res.status(500).json({ 
            message: '❌ Internal server error during registration!', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ==========================================
// 2. LOGIN CONTROLLER (Handles user login)
// ==========================================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email using the model
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: '❌ No user found with this email!' });
        }

        // Compare password with the hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '❌ Invalid password!' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.user_id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // ==========================================
        // 🔹 INJECTED: Set JWT in HTTP-Only Cookie
        // ==========================================
        res.cookie('token', token, {
            httpOnly: true, // hides from client-side JavaScript (Secures from XSS)
            secure: process.env.NODE_ENV === 'production', // uses HTTPS in production
            sameSite: 'strict', // CSRF attack protection
            maxAge: 24 * 60 * 60 * 1000 // 1 Day
        });

        res.status(200).json({
            message: '✅ Login successful!',
            token: token, // Postman testing convenience
            user: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                preferred_field: user.preferred_field
            }
        });

    } catch (error) {
        // Log the error along with the unique request ID for easy debugging
        console.error(`[Req ID: ${req.requestId}] Login Error:`, error);
        
        // Return a response containing the request ID and error details
        res.status(500).json({ 
            message: '❌ Internal server error during login!', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ==========================================
// 3. LOGOUT CONTROLLER (Handles user logout)
// ==========================================
// 🔹 INJECTED: New logout controller
exports.logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: '✅ Logged out successfully!' });
};