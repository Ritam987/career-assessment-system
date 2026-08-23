const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
const userModel = require('../models/userModel'); // Importing the user model for database queries
const db = require('../config/db'); // Import database connection

// ==========================================
// 1. REGISTER CONTROLLER (Handles new user registration)
// ==========================================
exports.registerUser = async (req, res) => {
    try {
        // fields are extracted from the request body
        const { 
            name, email, password, phone, age, gender, dob, 
            city, state, pincode, education_level, preferred_field, career_goal 
        } = req.body;

        // Check if user already exists using the model
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists!' });
        }

        // Hash the password securely
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ২. মডেলে সমস্ত ডেটা পাঠানো হলো
        await userModel.createUser({ 
            name, 
            email, 
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

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        // Log the error along with the unique request ID for easy debugging
        console.error(`[Req ID: ${req.requestId}] Register Error:`, error);
        
        // Return a response containing the request ID and error details
        res.status(500).json({ 
            message: 'Internal server error during registration!', 
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
            return res.status(404).json({ message: 'No user found with this email!' });
        }

        // Compare password with the hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password!' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email }, // 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // Set JWT in HTTP-Only Cookie
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            maxAge: 24 * 60 * 60 * 1000 // 1 Day
        });

        res.status(200).json({
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id, // 
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

// ==========================================
// 3. LOGOUT CONTROLLER (Handles user logout)
// ==========================================
// New logout controller
exports.logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully!' });
};

// ==========================================
// FETCH LOGGED-IN USER PROFILE
// ==========================================
exports.getUserProfile = async (req, res) => {
    try {
        // The authMiddleware sets req.user with the decoded token data
        const userId = req.user.id;

           // added a query to fetch user details
        const query = `
            SELECT id, name, email, created_at, age, gender, dob, city, state, pincode,
                   education_level, preferred_field, career_goal, profile_completed 
            FROM users WHERE id = ?
        `;
        
        // call the query with the userId
        const [users] = await db.query(query, [userId]);

        // Check if the user exists
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user: users[0] });
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        res.status(500).json({ message: 'Server error while fetching profile.', error: error.message });
    }
};