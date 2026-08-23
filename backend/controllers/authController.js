const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); 

// ==========================================
// 1. REGISTER CONTROLLER 
// ==========================================
exports.registerUser = async (req, res) => {
    try {
        // Receiving 13 fields from the frontend
        const { 
            name, gender, email, password, phone, dob, age, city, state, pincode,
            education_level, preferred_field, career_goal 
        } = req.body;

        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists!' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Sending the data to the model
        await userModel.createUser({ 
            name, 
            gender,
            email, 
            phone,
            hashedPassword, 
            dob,
            age, 
            city,
            state,
            pincode,
            education_level, 
            preferred_field, 
            career_goal
        });

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Register Error:`, error);
        res.status(500).json({ 
            message: 'Internal server error during registration!', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ==========================================
// 2. LOGIN CONTROLLER 
// ==========================================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password!' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id,
                name: user.name, 
                email: user.email
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