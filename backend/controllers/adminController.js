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
            'INSERT INTO admins (name, email, password_hash, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
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
        const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;

        // Validation: Ensure career_name and skill_domain are provided
        if (!career_name || !skill_domain) {
            return res.status(400).json({ message: 'Career name and skill domain are required!' });
        }

        const query = `
            INSERT INTO careers 
            (career_name, skill_domain, course_training, description, required_traits, job_roles) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            career_name, skill_domain, course_training || null, description || null, JSON.stringify(required_traits || []), JSON.stringify(job_roles || [])];

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
            'SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC'
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
        const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;

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
};// ==========================================
// 14. GET REDO REQUESTS (Admin)
// ==========================================
exports.getAllRedoRequests = async (req, res) => {
    try {
        const [requests] = await db.query(
            "SELECT r.*, u.full_name, u.email FROM redo_requests r JOIN users u ON r.user_id = u.id ORDER BY r.requested_at DESC"
        );
        res.status(200).json({ requests });
    } catch (error) {
        console.error('[' + req.requestId + '] Get All Redo Requests Error:', error);
        res.status(500).json({ message: 'Failed to fetch redo requests.', error: error.message });
    }
};

// ==========================================
// 15. APPROVE REDO REQUEST (Admin)
// ==========================================
exports.approveRedoRequest = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const adminId = req.admin.id;
        const { admin_comment } = req.body;

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [requests] = await connection.query("SELECT * FROM redo_requests WHERE id = ? FOR UPDATE", [id]);
        
        if (requests.length === 0) {
            await connection.rollback(); connection.release();
            return res.status(404).json({ message: 'Request not found.' });
        }

        const request = requests[0];
        if (request.status !== 'PENDING') {
            await connection.rollback(); connection.release();
            return res.status(409).json({ message: 'Request has already been processed.' });
        }

        const [completed] = await connection.query(
            "SELECT COUNT(*) as count FROM assessments WHERE user_id = ? AND status = 'Completed'",
            [request.user_id]
        );

        if (completed[0].count >= 3) {
            await connection.rollback(); connection.release();
            return res.status(409).json({ message: 'User already has the maximum of 3 completed assessments.' });
        }

        await connection.query(
            "UPDATE redo_requests SET status = 'APPROVED', reviewed_by = ?, admin_comment = ?, reviewed_at = NOW() WHERE id = ?",
            [adminId, admin_comment || '', id]
        );

        await connection.query(
            "INSERT INTO notifications (recipient_type, recipient_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?, ?)",
            ['user', request.user_id, 'REDO_APPROVED', 'Assessment Redo Approved', 'Your request to retake the career assessment has been approved. You can now start the assessment again.', id]
        );

        await connection.commit();
        connection.release();

        res.status(200).json({ message: 'Request approved successfully.' });

    } catch (error) {
        if (connection) { await connection.rollback(); connection.release(); }
        console.error('[' + req.requestId + '] Approve Redo Request Error:', error);
        res.status(500).json({ message: 'Failed to approve request.', error: error.message });
    }
};

// ==========================================
// 16. REJECT REDO REQUEST (Admin)
// ==========================================
exports.rejectRedoRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin.id;
        const { admin_comment } = req.body;

        if (!admin_comment || admin_comment.trim() === '') {
            return res.status(400).json({ message: 'A comment/reason is required for rejection.' });
        }

        const [result] = await db.query(
            "UPDATE redo_requests SET status = 'REJECTED', reviewed_by = ?, admin_comment = ?, reviewed_at = NOW() WHERE id = ? AND status = 'PENDING'",
            [adminId, admin_comment.trim(), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pending request not found or already processed.' });
        }

        // Notify user
        const [requests] = await db.query("SELECT user_id FROM redo_requests WHERE id = ?", [id]);
        if (requests.length > 0) {
            await db.query(
                "INSERT INTO notifications (recipient_type, recipient_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?, ?)",
                ['user', requests[0].user_id, 'REDO_REJECTED', 'Assessment Redo Request Declined', 'Your request to retake the assessment was declined: ' + admin_comment, id]
            );
        }

        res.status(200).json({ message: 'Request rejected successfully.' });

    } catch (error) {
        console.error('[' + req.requestId + '] Reject Redo Request Error:', error);
        res.status(500).json({ message: 'Failed to reject request.', error: error.message });
    }
};

// ==========================================
// 17. GET ADMIN PROFILE
// ==========================================
exports.getAdminProfile = async (req, res) => {
    try {
        const [admin] = await db.query('SELECT id, name, email, role, company_id, profile_picture FROM admins WHERE id = ?', [req.admin.id]);
        if (admin.length === 0) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json({ admin: admin[0] });
    } catch(err) {
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
};
// ==========================================
// 18. ADMIN LOGOUT
// ==========================================
exports.adminLogout = (req, res) => {
    res.clearCookie('admin_token', { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ message: 'Logged out successfully.' });
};

// ==========================================
// 19. ADMIN GOOGLE LOGIN
// ==========================================
const { OAuth2Client } = require('google-auth-library');

exports.adminGoogleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'No token provided' });

        const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email } = payload;

        // Admin must already be registered with this email
        const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (admins.length === 0) {
            return res.status(403).json({ message: 'No admin account found for this Google email. Please register first.' });
        }

        const admin = admins[0];
        const jwtToken = require('jsonwebtoken').sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('admin_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Admin Google login successful!',
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
        });

    } catch (error) {
        console.error('Admin Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google token or account not authorized.' });
    }
};
// ==========================================
// 8. GET ADMIN ANALYTICS (Dashboard Overview)
// ==========================================
exports.getAdminAnalytics = async (req, res) => {
    try {
        const [userResult] = await db.query('SELECT COUNT(*) as count FROM users');
        const [questionResult] = await db.query("SELECT COUNT(*) as count FROM questions WHERE status = 'Active'");
        const [careerResult] = await db.query('SELECT COUNT(*) as count FROM careers');
        const [assessmentResult] = await db.query('SELECT COUNT(*) as count FROM assessments WHERE status = ?', ['Completed']);
        
        // Get breakdown of users by their latest assessment status
        const [statusBreakdown] = await db.query(`
            SELECT 
              SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
              SUM(CASE WHEN status = 'In-Progress' THEN 1 ELSE 0 END) as in_progress,
              SUM(CASE WHEN status = 'Not Started' THEN 1 ELSE 0 END) as not_started
            FROM (
              SELECT 
                u.id, 
                IFNULL(
                    (SELECT status FROM assessments WHERE user_id = u.id ORDER BY started_at DESC LIMIT 1), 
                    'Not Started'
                ) as status
              FROM users u
            ) as user_status
        `);

        // Get breakdown of users by education
        const [eduBreakdown] = await db.query(`
            SELECT 
              SUM(CASE WHEN education_level IN ('Class 10', 'Class 12', '10th', '12th') THEN 1 ELSE 0 END) as class10_12,
              SUM(CASE WHEN education_level = 'Diploma' THEN 1 ELSE 0 END) as diploma,
              SUM(CASE WHEN education_level LIKE '%Bachelor%' OR education_level = 'BA' OR education_level = 'BSc' OR education_level = 'BCom' OR education_level = 'B.Tech' OR education_level = 'BBA' THEN 1 ELSE 0 END) as bachelors,
              SUM(CASE WHEN education_level NOT IN ('Class 10', 'Class 12', '10th', '12th', 'Diploma', 'BA', 'BSc', 'BCom', 'B.Tech', 'BBA') AND education_level NOT LIKE '%Bachelor%' THEN 1 ELSE 0 END) as other
            FROM users
        `);

        // Get recent users
        const [recentUsers] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.education_level, 
                   IFNULL((SELECT status FROM assessments WHERE user_id = u.id ORDER BY started_at DESC LIMIT 1), 'Not Started') as status
            FROM users u
            ORDER BY u.created_at DESC 
            LIMIT 5
        `);

        res.status(200).json({
            totalUsers: userResult[0].count,
            totalQuestions: questionResult[0].count,
            totalCareers: careerResult[0].count,
            totalAssessments: assessmentResult[0].count,
            assessmentStats: {
                completed: parseInt(statusBreakdown[0].completed) || 0,
                in_progress: parseInt(statusBreakdown[0].in_progress) || 0,
                not_started: parseInt(statusBreakdown[0].not_started) || 0
            },
            educationStats: {
                class10_12: parseInt(eduBreakdown[0].class10_12) || 0,
                diploma: parseInt(eduBreakdown[0].diploma) || 0,
                bachelors: parseInt(eduBreakdown[0].bachelors) || 0,
                other: parseInt(eduBreakdown[0].other) || 0
            },
            recentUsers: recentUsers
        });

    } catch (error) {
        console.error('Admin Analytics Error:', error);
        res.status(500).json({ message: 'Server error while fetching analytics', error: error.message });
    }
};



// ==========================================
// ADMIN PROFILE ROUTES
// ==========================================
exports.getProfile = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const [admins] = await db.query('SELECT id, name, email, role, profile_picture FROM admins WHERE id = ?', [adminId]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json({ profile: admins[0] });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
        
        await db.query('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name, email, adminId]);
        res.status(200).json({ message: 'Profile updated' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ message: 'Avatar data required' });
        
        await db.query('UPDATE admins SET profile_picture = ? WHERE id = ?', [avatar, adminId]);
        res.status(200).json({ message: 'Avatar updated' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { currentPassword, newPassword } = req.body;
        
        const [admins] = await db.query('SELECT password_hash FROM admins WHERE id = ?', [adminId]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        
        const admin = admins[0];
        
        if (admin.password_hash) {
            const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
            if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        
        await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, adminId]);
        res.status(200).json({ message: 'Password updated' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// 19. GET ALL ASSESSMENT RESULTS
// ==========================================
exports.getAllResults = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.full_name, u.email, u.education_level,
                ar.primary_career_name, ar.primary_match_pct, ar.created_at as completed_at
            FROM assessment_results ar
            JOIN users u ON ar.user_id = u.id
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE a.status = 'Completed'
            ORDER BY ar.created_at DESC
        `;
        const [results] = await db.query(query);
        res.status(200).json({ results });
    } catch (e) {
        res.status(500).json({ message: 'Server error fetching results' });
    }
};
