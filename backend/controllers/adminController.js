const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
const db = require('../config/db'); // Import database connection

// ==========================================
// 1. SETUP FIRST ADMIN (One-time use)
// ==========================================
exports.setupFirstAdmin = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // check if an admin already exists
        const [existingAdmins] = await db.query('SELECT id FROM admins LIMIT 1');
        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: '⚠️ Admin already exists! Use login.' });
        }

        // Insert the first admin into the database
        await db.query(
            "INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ['Super Admin', 'admin@example.com', hashedPassword, 'SuperAdmin']
        );

        // Respond with success message and credentials
        res.status(201).json({ 
            message: '✅ First Admin created successfully!', 
            email: 'admin@example.com', 
            password: 'admin123' 
        });

    } catch (error) {
        console.error('Setup Admin Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// 2. ADMIN LOGIN
// ==========================================
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [admin] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        
        if (admin.length === 0) {
            return res.status(404).json({ message: '❌ Admin not found!' });
        }

        const isMatch = await bcrypt.compare(password, admin[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: '❌ Invalid credentials!' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin[0].id, email: admin[0].email, role: admin[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set Cookie named 'admin_token'
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 Day
        });

        res.status(200).json({
            message: '✅ Admin login successful!',
            token: token,
            admin: {
                id: admin[0].id,
                name: admin[0].name,
                role: admin[0].role
            }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ message: '❌ Server error during admin login', error: error.message });
    }
};

// ==========================================
// 3. ADD NEW QUESTION (Admin Only)
// ==========================================
exports.addQuestion = async (req, res) => {
    try {
        const {
            category_id, question_text, question_type, mapped_trait,
            option_a, option_b, option_c, option_d,
            correct_answer, score_a, score_b, score_c, score_d, status
        } = req.body;

        const query = `
            INSERT INTO questions 
            (category_id, question_text, question_type, mapped_trait, option_a, option_b, option_c, option_d, correct_answer, score_a, score_b, score_c, score_d, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            category_id, question_text, question_type || 'MCQ', mapped_trait || null,
            option_a || null, option_b || null, option_c || null, option_d || null,
            correct_answer || null, score_a || 0, score_b || 0, score_c || 0, score_d || 0, status || 'Active'
        ];

        const [result] = await db.query(query, values);

        res.status(201).json({ 
            message: '✅ Question added successfully!', 
            questionId: result.insertId 
        });
    } catch (error) {
        console.error('Add Question Error:', error);
        res.status(500).json({ message: '❌ Failed to add question.', error: error.message });
    }
};

// ==========================================
// 4. GET ALL QUESTIONS (Admin Dashboard)
// ==========================================
exports.getAllQuestions = async (req, res) => {
    try {
        const [questions] = await db.query(`
            SELECT q.*, c.name as category_name 
            FROM questions q 
            JOIN categories c ON q.category_id = c.id 
            ORDER BY q.category_id ASC, q.id ASC
        `);
        res.status(200).json({ total: questions.length, questions });
    } catch (error) {
        console.error('Fetch Questions Error:', error);
        res.status(500).json({ message: '❌ Failed to fetch questions.', error: error.message });
    }
};

// ==========================================
// 5. ADD NEW CAREER (Job Role)
// ==========================================
exports.addCareer = async (req, res) => {
    try {
        const { career_name, skill_domain, course_training, description, required_traits } = req.body;

        // Validation: Ensure career_name and skill_domain are provided
        if (!career_name || !skill_domain) {
            return res.status(400).json({ message: '⚠️ Career name and skill domain are required!' });
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
            message: '✅ Career/Job Role added successfully!', 
            careerId: result.insertId 
        });
    } catch (error) {
        console.error('Add Career Error:', error);
        res.status(500).json({ message: '❌ Failed to add career.', error: error.message });
    }
};

// ==========================================
// 6. GET ALL CAREERS
// ==========================================
exports.getAllCareers = async (req, res) => {
    try {
        // Validation: Ensure at least one career exists
        const [careers] = await db.query('SELECT * FROM careers ORDER BY skill_domain ASC, id ASC');
        res.status(200).json({ total: careers.length, careers });
    } catch (error) {
        console.error('Fetch Careers Error:', error);
        res.status(500).json({ message: '❌ Failed to fetch careers.', error: error.message });
    }
};