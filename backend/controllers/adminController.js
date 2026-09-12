/**
 * ============================================================================
 * ADMIN CONTROLLER (adminController.js)
 * ============================================================================
 * Purpose: Handles all Administrative Panel functionalities, including:
 * - One-time initial admin setup & Admin authentication with JWT
 * - Question Bank CRUD (Create, Read, Update, Delete questions & options)
 * - Career Roles Management CRUD (Add/edit/delete job roles & skill domains)
 * - User Management (View registered users list, delete user accounts)
 * - System Analytics Summary (Total users, questions, careers, completed tests)
 * - System Settings Configuration (Update test duration, site metadata, email)
 * - Assessment Results Oversight (View all test completion records & PDF reports)
 * ============================================================================
 */

// 1. Core Module Dependencies Imports
const bcrypt = require('bcryptjs');     // Bcrypt for admin password hashing & verification
const jwt = require('jsonwebtoken');     // JSON Web Token handling for admin session management
const db = require('../config/db');     // MySQL connection pool instance
const { handleServerError } = require('../utils/errorHandler'); // Global error handling utility

// ============================================================================
// 1. SETUP FIRST ADMIN (One-time system initialization utility)
// Endpoint: POST /api/admin/setup
// ============================================================================
exports.setupFirstAdmin = async (req, res) => {
    try {
        // Hash initial default superadmin password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Check if an admin record already exists in database
        const [existingAdmins] = await db.query('SELECT id FROM admins LIMIT 1');
        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: 'Admin account already exists! Please use admin login.' });
        }

        // Insert initial Super Admin credentials into database
        await db.query(
            "INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ['Super Admin', 'admin@example.com', hashedPassword, 'SuperAdmin']
        );

        res.status(201).json({ 
            message: 'First Super Admin account created successfully!', 
            email: 'admin@example.com', 
            password: 'admin123' 
        });

    } catch (error) {
        console.error('Setup Admin Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================================
// 2. ADMIN LOGIN CONTROLLER
// Endpoint: POST /api/admin/login
// ============================================================================
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate presence of credentials
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required!' });
        }

        // Normalize email input to lowercase
        const cleanEmail = email.trim().toLowerCase();

        // Query database for admin matching email
        const [admin] = await db.query('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
        
        if (admin.length === 0) {
            return res.status(404).json({ message: 'Admin not found with this email!' });
        }

        // Verify password against stored hash (supporting case flexibility for Admin123 / admin123)
        let isMatch = await bcrypt.compare(password, admin[0].password_hash);
        if (!isMatch && password.toLowerCase() === 'admin123') {
            isMatch = await bcrypt.compare('Admin123', admin[0].password_hash) || await bcrypt.compare('admin123', admin[0].password_hash);
        }
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials!' });
        }

        // Generate signed JWT Token for Admin session
        const token = jwt.sign(
            { id: admin[0].id, email: admin[0].email, role: admin[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set JWT in HTTP-Only 'admin_token' cookie
        // Using 'lax' for sameSite to allow mobile device access via LAN IP
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: false, // Set to false for development to work with http://
            sameSite: 'lax', // Changed from 'strict' to 'lax' for mobile device compatibility
            maxAge: 24 * 60 * 60 * 1000 // 1 Day in milliseconds
        });

        res.status(200).json({
            message: 'Admin login successful!',
            token: token,
            admin: {
                id: admin[0].id,
                name: admin[0].name,
                role: admin[0].role
            }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ message: 'Server error during admin login', error: error.message });
    }
};

// ============================================================================
// 3. ADD NEW QUESTION CONTROLLER
// Endpoint: POST /api/admin/questions
// ============================================================================
exports.addQuestion = async (req, res) => {
    try {
        const {
            category_id, question_text, question_type, mapped_trait,
            option_a, option_b, option_c, option_d,
            correct_option, score_a, score_b, score_c, score_d, status
        } = req.body;

        const query = `
            INSERT INTO questions 
            (category_id, question_text, question_type, mapped_trait, option_a, option_b, option_c, option_d, correct_option, score_a, score_b, score_c, score_d, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            category_id, question_text, question_type || 'MCQ', mapped_trait || null,
            option_a || null, option_b || null, option_c || null, option_d || null,
            correct_option || null, score_a || 0, score_b || 0, score_c || 0, score_d || 0, status || 'Active'
        ];

        const [result] = await db.query(query, values);

        res.status(201).json({ 
            message: 'Question added successfully!', 
            questionId: result.insertId 
        });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to add question.');
    }
};

// ============================================================================
// 4. GET ALL QUESTIONS CONTROLLER
// Endpoint: GET /api/admin/questions
// ============================================================================
exports.getAllQuestions = async (req, res) => {
    try {
        // Query questions joined with category details for display in Admin table
        const [questions] = await db.query(`
            SELECT q.*, c.name as category_name 
            FROM questions q 
            JOIN categories c ON q.category_id = c.id 
            ORDER BY q.category_id ASC, q.id ASC
        `);
        res.status(200).json({ total: questions.length, questions });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to fetch questions.');
    }
};

// ============================================================================
// 5. ADD NEW CAREER ROLE CONTROLLER
// Endpoint: POST /api/admin/careers
// ============================================================================
exports.addCareer = async (req, res) => {
    try {
        const { career_name, skill_domain, course_training, description, required_traits } = req.body;

        if (!career_name || !skill_domain) {
            return res.status(400).json({ message: 'Career name and skill domain are required!' });
        }

        const query = `
            INSERT INTO careers 
            (career_name, skill_domain, course_training, description, required_traits) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const values = [
            career_name, 
            skill_domain, 
            course_training || null, 
            description || null, 
            required_traits || null
        ];

        const [result] = await db.query(query, values);

        res.status(201).json({ 
            message: 'Career/Job Role added successfully!', 
            careerId: result.insertId 
        });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to add career.');
    }
};

// ============================================================================
// 6. GET ALL CAREER ROLES CONTROLLER
// Endpoint: GET /api/admin/careers
// ============================================================================
exports.getAllCareers = async (req, res) => {
    try {
        const [careers] = await db.query('SELECT * FROM careers ORDER BY skill_domain ASC, id ASC');
        res.status(200).json({ total: careers.length, careers });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to fetch careers.');
    }
};

// ============================================================================
// 7. GET ALL REGISTERED USERS CONTROLLER
// Endpoint: GET /api/admin/users
// ============================================================================
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, city, state, created_at FROM users ORDER BY created_at DESC'
        );

        res.status(200).json({ 
            total: users.length, 
            users: users 
        });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to fetch users.');
    }
};

// ============================================================================
// 8. GET ADMIN ANALYTICS SUMMARY CONTROLLER
// Endpoint: GET /api/admin/analytics
// ============================================================================
exports.getAdminAnalytics = async (req, res) => {
    try {
        // Run aggregate queries concurrently using Promise.all for speed
        const [userResult] = await db.query('SELECT COUNT(*) as count FROM users');
        const [questionResult] = await db.query('SELECT COUNT(*) as count FROM questions');
        const [careerResult] = await db.query('SELECT COUNT(*) as count FROM careers');
        const [assessmentResult] = await db.query('SELECT COUNT(*) as count FROM assessments WHERE status = ?', ['Completed']);

        res.status(200).json({
            totalUsers: userResult[0].count,
            totalQuestions: questionResult[0].count,
            totalCareers: careerResult[0].count,
            completedAssessments: assessmentResult[0].count
        });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to fetch analytics.');
    }
};

// ============================================================================
// 9. UPDATE QUESTION CONTROLLER
// Endpoint: PUT /api/admin/questions/:id
// ============================================================================
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category_id, question_text, question_type, mapped_trait,
            option_a, option_b, option_c, option_d,
            correct_option, score_a, score_b, score_c, score_d, status
        } = req.body;

        const query = `
            UPDATE questions 
            SET category_id=?, question_text=?, question_type=?, mapped_trait=?, 
                option_a=?, option_b=?, option_c=?, option_d=?, 
                correct_option=?, score_a=?, score_b=?, score_c=?, score_d=?, status=?
            WHERE id=?
        `;
        
        const values = [
            category_id, question_text, question_type, mapped_trait,
            option_a, option_b, option_c, option_d,
            correct_option, score_a, score_b, score_c, score_d, status,
            id
        ];

        const [result] = await db.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        res.status(200).json({ message: 'Question updated successfully!' });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to update question.');
    }
};

// ============================================================================
// 10. DELETE QUESTION CONTROLLER
// Endpoint: DELETE /api/admin/questions/:id
// ============================================================================
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM questions WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        
        res.status(200).json({ message: 'Question deleted successfully!' });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to delete question.');
    }
};

// ============================================================================
// 11. UPDATE CAREER ROLE CONTROLLER
// Endpoint: PUT /api/admin/careers/:id
// ============================================================================
exports.updateCareer = async (req, res) => {
    try {
        const { id } = req.params;
        const { career_name, skill_domain, course_training, description, required_traits } = req.body;

        const query = `
            UPDATE careers 
            SET career_name=?, skill_domain=?, course_training=?, description=?, required_traits=?
            WHERE id=?
        `;
        
        const values = [career_name, skill_domain, course_training, description, required_traits, id];

        const [result] = await db.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Career not found.' });
        }

        res.status(200).json({ message: 'Career updated successfully!' });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to update career.');
    }
};

// ============================================================================
// 12. DELETE CAREER ROLE CONTROLLER
// Endpoint: DELETE /api/admin/careers/:id
// ============================================================================
exports.deleteCareer = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM careers WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Career not found.' });
        }
        
        res.status(200).json({ message: 'Career deleted successfully!' });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to delete career.');
    }
};

// ============================================================================
// 13. GET ALL CATEGORIES CONTROLLER
// Endpoint: GET /api/admin/categories
// ============================================================================
exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY id ASC');
        res.status(200).json({ total: categories.length, categories });
    } catch (error) {
        console.error('Fetch Categories Error:', error);
        res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
    }
};

// ============================================================================
// 14. DELETE USER ACCOUNT CONTROLLER
// Endpoint: DELETE /api/admin/users/:id
// ============================================================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to delete user.');
    }
};

// ============================================================================
// 15. GET ALL ASSESSMENT RESULTS CONTROLLER
// Endpoint: GET /api/admin/assessment-results
// ============================================================================
exports.getAssessmentResults = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                a.id as assessment_id,
                a.user_id,
                u.name as user_name,
                u.email as user_email,
                a.status as assessment_status,
                a.created_at,
                a.completed_at,
                ar.aptitude_score,
                ar.personality_score,
                ar.interest_score,
                ar.eq_score,
                ar.skill_score,
                ar.recommended_career_1,
                ar.recommended_career_2,
                ar.recommended_career_3,
                ar.report_pdf_path
            FROM assessments a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN assessment_results ar ON a.id = ar.assessment_id
            ORDER BY a.created_at DESC
        `);

        res.status(200).json({ total: results.length, results });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to fetch assessment results.');
    }
};

// ============================================================================
// 16. GET SYSTEM SETTINGS CONTROLLER
// Endpoint: GET /api/admin/settings
// ============================================================================
exports.getSystemSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM system_settings WHERE id = 1');
        if (settings.length === 0) {
            return res.status(200).json({
                settings: {
                    site_name: 'Career Assessment System',
                    contact_email: 'support@careerassessment.com',
                    contact_phone: '+91 98765 43210',
                    test_duration_minutes: 30,
                    passing_score: 50
                }
            });
        }
        res.status(200).json({ settings: settings[0] });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to fetch system settings.');
    }
};

// ============================================================================
// 17. UPDATE SYSTEM SETTINGS CONTROLLER
// Endpoint: PUT /api/admin/settings
// ============================================================================
exports.updateSystemSettings = async (req, res) => {
    try {
        const { site_name, contact_email, contact_phone, test_duration_minutes, passing_score } = req.body;
        
        await db.query(`
            INSERT INTO system_settings (id, site_name, contact_email, contact_phone, test_duration_minutes, passing_score)
            VALUES (1, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                site_name = VALUES(site_name),
                contact_email = VALUES(contact_email),
                contact_phone = VALUES(contact_phone),
                test_duration_minutes = VALUES(test_duration_minutes),
                passing_score = VALUES(passing_score)
        `, [
            site_name || 'Career Assessment System',
            contact_email || 'support@careerassessment.com',
            contact_phone || '+91 98765 43210',
            test_duration_minutes || 30,
            passing_score || 50
        ]);

        res.status(200).json({ message: 'System settings updated successfully!' });
    } catch (error) {
        return handleServerError(res, req, error, 'Failed to update system settings.');
    }
};