/**
 * ============================================================================
 * QUESTION BANK CONTROLLER (questionController.js)
 * ============================================================================
 * Purpose: Handles question bank management endpoints for adding, fetching,
 * updating, and deleting psychometric and aptitude assessment questions.
 * ============================================================================
 */

// 1. Import MySQL database pool connection
const db = require('../config/db');

// ============================================================================
// 1. ADD NEW QUESTION CONTROLLER
// Endpoint: POST /api/questions
// ============================================================================
exports.addQuestion = async (req, res) => {
    try {
        // Extract question parameters from request body
        const { 
            category_id, question_text, question_type, mapped_trait, 
            option_a, option_b, option_c, option_d, correct_option, status 
        } = req.body;
        
        // SQL query to insert new question into questions table
        const query = `
            INSERT INTO questions 
            (category_id, question_text, question_type, mapped_trait, option_a, option_b, option_c, option_d, correct_option, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(query, [
            category_id, question_text, question_type, mapped_trait, 
            option_a, option_b, option_c, option_d, correct_option, status || 'Active'
        ]);

        res.status(201).json({ message: 'Question added successfully!' });
    } catch (error) {
        console.error("Add Question Error:", error);
        res.status(500).json({ message: 'Error adding question', error: error.message });
    }
};

// ============================================================================
// 2. GET ALL QUESTIONS CONTROLLER
// Endpoint: GET /api/questions
// ============================================================================
exports.getAllQuestions = async (req, res) => {
    try {
        // Fetch all questions ordered by newest first
        const [questions] = await db.query('SELECT * FROM questions ORDER BY id DESC');
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

// ============================================================================
// 3. UPDATE QUESTION CONTROLLER
// Endpoint: PUT /api/questions/:id
// ============================================================================
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, option_a, option_b, option_c, option_d, correct_option, status } = req.body;
        
        // SQL update query to revise question text and option choices
        const query = `
            UPDATE questions 
            SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?, status=? 
            WHERE id=?
        `;
        await db.query(query, [question_text, option_a, option_b, option_c, option_d, correct_option, status, id]);
        
        res.status(200).json({ message: 'Question updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error: error.message });
    }
};

// ============================================================================
// 4. DELETE QUESTION CONTROLLER
// Endpoint: DELETE /api/questions/:id
// ============================================================================
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete question row matching given primary key ID
        await db.query('DELETE FROM questions WHERE id = ?', [id]);
        res.status(200).json({ message: 'Question deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
};