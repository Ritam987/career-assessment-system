const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const path      = require('path');
const fs        = require('fs');
const userModel = require('../models/userModel');
const db        = require('../config/db');


// ============================================================
// 1. REGISTER USER
// ============================================================
exports.registerUser = async (req, res) => {
    try {
        const { full_name, email, password, phone_number, education_level, age } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check duplicate email
        const existing = await userModel.findUserByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.createUser({
            full_name,
            email,
            hashedPassword,
            phone_number: phone_number || null,
            education_level: education_level || null,
            age: age || null
        });

        res.status(201).json({ message: 'Registration successful! Please log in.' });

    } catch (error) {
        console.error(`[${req.requestId}] Register Error:`, error);
        res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
    }
};

// ============================================================
// 2. LOGIN USER
// ============================================================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // HTTP-only cookie (cannot be accessed by JS — secure)
        res.cookie('token', token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge:   7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: 'Login successful!',
            user: {
                id:              user.id,
                full_name:       user.full_name,
                email:           user.email,
                education_level: user.education_level,
                age:             user.age
            }
        });

    } catch (error) {
        console.error(`[${req.requestId}] Login Error:`, error);
        res.status(500).json({ message: 'Login failed. Please try again.', error: error.message });
    }
};

// ============================================================
// 3. LOGOUT USER
// ============================================================
exports.logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully.' });
};

// ============================================================
// 4. GET PROFILE (protected)
// ============================================================
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query(
            'SELECT id, full_name, email, phone_number, education_level, age, profile_picture, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user: rows[0] });

    } catch (error) {
        console.error(`[${req.requestId}] Get Profile Error:`, error);
        res.status(500).json({ message: 'Error fetching profile.', error: error.message });
    }
};

// ============================================================
// 5. UPDATE PROFILE (protected)
// ============================================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone_number, education_level, age } = req.body;

        await db.query(
            'UPDATE users SET full_name = ?, phone_number = ?, education_level = ?, age = ? WHERE id = ?',
            [full_name, phone_number, education_level, age, userId]
        );

        res.status(200).json({ message: 'Profile updated successfully.' });

    } catch (error) {
        console.error(`[${req.requestId}] Update Profile Error:`, error);
        res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
};

// ============================================================
// 6. CHANGE PASSWORD (protected)
// ============================================================
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ message: 'Current and new passwords are required.' });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        // Fetch current hash
        const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        const newHash = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        res.status(200).json({ message: 'Password changed successfully.' });

    } catch (error) {
        console.error(`[${req.requestId}] Change Password Error:`, error);
        res.status(500).json({ message: 'Error changing password.', error: error.message });
    }
};

// ============================================================
// 7. UPLOAD PROFILE PHOTO (protected, multipart/form-data)
// ============================================================
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        // Build public URL — served by Express static /uploads
        const filename   = req.file.filename;
        const publicUrl  = `/uploads/${filename}`;

        // Delete old photo file if it exists
        const [rows] = await db.query('SELECT profile_picture FROM users WHERE id = ?', [userId]);
        if (rows[0]?.profile_picture) {
            const oldPath = path.join(__dirname, '..', rows[0].profile_picture);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        // Save new path in DB
        await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [publicUrl, userId]);

        res.status(200).json({
            message:    'Profile photo updated successfully.',
            photoUrl:   publicUrl
        });

    } catch (error) {
        console.error(`[${req.requestId}] Upload Photo Error:`, error);
        res.status(500).json({ message: 'Error uploading photo.', error: error.message });
    }
};