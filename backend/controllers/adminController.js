const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
const db = require('../config/db'); // Import database connection

// ==========================================
// 1. REGISTER ADMIN (requires valid Company ID)
// ==========================================
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, company_id } = req.body;

        if (!name || !email || !password || !company_id) {
            return res.status(400).json({ message: 'All fields including Company ID are required.' });
        }

        // Validate Company ID against the secret stored in .env
        if (company_id !== process.env.ADMIN_COMPANY_ID) {
            return res.status(403).json({ message: 'Invalid Company ID. You are not authorized to register as an admin.' });
        }

        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'An admin account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO admins (name, email, password_hash, role, company_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'SuperAdmin', company_id]
        );

        res.status(201).json({ message: 'Admin registered successfully! Please log in.' });

    } catch (error) {
        console.error('Admin Register Error:', error);
        res.status(500).json({ message: 'Server error during admin registration.', error: error.message });
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
            return res.status(404).json({ message: 'Admin not found!' });
        }

        const isMatch = await bcrypt.compare(password, admin[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials!' });
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
            message: 'Question added successfully!', 
            questionId: result.insertId 
        });
    } catch (error) {
        console.error('Add Question Error:', error);
        res.status(500).json({ message: 'Failed to add question.', error: error.message });
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
        res.status(500).json({ message: 'Failed to fetch questions.', error: error.message });
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
        console.error('Add Career Error:', error);
        res.status(500).json({ message: 'Failed to add career.', error: error.message });
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
        res.status(500).json({ message: 'Failed to fetch careers.', error: error.message });
    }
};

// ==========================================
// 7. GET ALL REGISTERED USERS (Admin Only)
// ==========================================
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all registered users excluding passwords, ordered by newest first
        const [users] = await db.query(
            'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
        );

        res.status(200).json({ 
            total: users.length, 
            users: users 
        });
    } catch (error) {
        console.error('Fetch All Users Error:', error);
        res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
    }
};

// ==========================================
// 8. GET ADMIN ANALYTICS (Dashboard Overview)
// ==========================================
exports.getAdminAnalytics = async (req, res) => {
    try {
        // Fetch total counts from respective tables using Promise.all for parallel execution
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
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics.', error: error.message });
    }
};

// ==========================================
// 9. UPDATE QUESTION
// ==========================================
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params; // Extract question ID from URL
        const {
            category_id, question_text, question_type, mapped_trait,
            option_a, option_b, option_c, option_d,
            correct_answer, score_a, score_b, score_c, score_d, status
        } = req.body;

        const query = `
            UPDATE questions 
            SET category_id=?, question_text=?, question_type=?, mapped_trait=?, 
                option_a=?, option_b=?, option_c=?, option_d=?, 
                correct_answer=?, score_a=?, score_b=?, score_c=?, score_d=?, status=?
            WHERE id=?
        `;
        
        const values = [
            category_id, question_text, question_type, mapped_trait,
            option_a, option_b, option_c, option_d,
            correct_answer, score_a, score_b, score_c, score_d, status,
            id
        ];

        const [result] = await db.query(query, values);
        
        // Check if the question exists
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        res.status(200).json({ message: 'Question updated successfully!' });
    } catch (error) {
        console.error('Update Question Error:', error);
        res.status(500).json({ message: 'Failed to update question.', error: error.message });
    }
};

// ==========================================
// 10. DELETE QUESTION
// ==========================================
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params; // Extract question ID from URL
        
        const [result] = await db.query('DELETE FROM questions WHERE id = ?', [id]);
        
        // Check if the question exists
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        
        res.status(200).json({ message: 'Question deleted successfully!' });
    } catch (error) {
        console.error('Delete Question Error:', error);
        res.status(500).json({ message: 'Failed to delete question.', error: error.message });
    }
};

// ==========================================
// 11. UPDATE CAREER
// ==========================================
exports.updateCareer = async (req, res) => {
    try {
        const { id } = req.params; // Extract career ID from URL
        const { career_name, skill_domain, course_training, description, required_traits } = req.body;

        const query = `
            UPDATE careers 
            SET career_name=?, skill_domain=?, course_training=?, description=?, required_traits=?
            WHERE id=?
        `;
        
        const values = [career_name, skill_domain, course_training, description, required_traits, id];

        const [result] = await db.query(query, values);
        
        // Check if the career exists
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Career not found.' });
        }

        res.status(200).json({ message: 'Career updated successfully!' });
    } catch (error) {
        console.error('Update Career Error:', error);
        res.status(500).json({ message: 'Failed to update career.', error: error.message });
    }
};

// ==========================================
// 12. DELETE CAREER
// ==========================================
exports.deleteCareer = async (req, res) => {
    try {
        const { id } = req.params; // Extract career ID from URL
        
        const [result] = await db.query('DELETE FROM careers WHERE id = ?', [id]);
        
        // Check if the career exists
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Career not found.' });
        }
        
        res.status(200).json({ message: 'Career deleted successfully!' });
    } catch (error) {
        console.error('Delete Career Error:', error);
        res.status(500).json({ message: 'Failed to delete career.', error: error.message });
    }
};

// ==========================================
// 13. GET ALL CATEGORIES
// ==========================================
exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY id ASC');
        res.status(200).json({ total: categories.length, categories });
    } catch (error) {
        console.error('Fetch Categories Error:', error);
        res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
    }
};