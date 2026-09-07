/**
 * ============================================================================
 * ASSESSMENT CONTROLLER (assessmentController.js)
 * ============================================================================
 * Purpose: Manages the end-to-end assessment lifecycle, including:
 * - Starting a new test session or resuming an existing in-progress test
 * - Step-by-step fetching of unanswered questions
 * - Real-time answer submission and progress state saving
 * - Final test submission, trait scoring calculation, career recommendations matching
 * - PDF report generation and download file streaming
 * ============================================================================
 */

// 1. Core Node.js & Utility Imports
const db = require('../config/db');                             // MySQL database pool instance
const fs = require('fs');                                       // Node.js filesystem module for PDF files
const path = require('path');                                   // Node.js path module
const { calculateScores, matchCareers } = require('../utils/scoreCalculator'); // Scoring algorithm & career matching utility
const { generateReport } = require('../utils/pdfGenerator');   // Server-side PDF report generator

// ============================================================================
// 1. START OR RESUME ASSESSMENT CONTROLLER
// Endpoint: POST /api/assessments/start
// ============================================================================
exports.startAssessment = async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from verified JWT token by authMiddleware

        // Check if the user already has an active, unsubmitted 'In-Progress' test session
        const [existingAssessment] = await db.query(
            'SELECT * FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (existingAssessment.length > 0) {
            // Resume existing in-progress test session
            return res.status(200).json({
                message: 'Resuming existing assessment in-progress',
                assessmentId: existingAssessment[0].id,
                lastAnsweredQuestionId: existingAssessment[0].last_answered_question_id
            });
        }

        // Initialize a brand new assessment session row in database
        const [result] = await db.query(
            'INSERT INTO assessments (user_id, status) VALUES (?, ?)',
            [userId, 'In-Progress']
        );

        res.status(201).json({
            message: 'New assessment started successfully!',
            assessmentId: result.insertId,
            lastAnsweredQuestionId: null
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Start Assessment Error:`, error);
        res.status(500).json({
            message: '❌ Error starting assessment',
            error: error.message,
            requestId: req.requestId
        });
    }
};

// ============================================================================
// 2. FETCH NEXT UNANSWERED QUESTION CONTROLLER
// Endpoint: GET /api/assessments/next-question
// ============================================================================
exports.getNextQuestion = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch active in-progress assessment session
        const [assessment] = await db.query(
            'SELECT * FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (assessment.length === 0) {
            return res.status(404).json({ message: 'No active assessment found. Please start an assessment first.' });
        }

        const assessmentId = assessment[0].id;

        // Query for the first active question that has NOT been answered yet in this test session
        const [nextQuestion] = await db.query(`
            SELECT q.id, q.category_id, q.question_text, q.question_type, q.mapped_trait, 
                   q.option_a, q.option_b, q.option_c, q.option_d, c.name as category_name
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.status = 'Active' 
            AND q.id NOT IN (
                SELECT question_id FROM user_responses WHERE assessment_id = ?
            )
            ORDER BY q.category_id ASC, q.id ASC
            LIMIT 1
        `, [assessmentId]);

        // If no unanswered questions remain, inform frontend that test is ready for submission
        if (nextQuestion.length === 0) {
            return res.status(200).json({ 
                message: 'All questions answered! Assessment ready for submission.',
                completed: true 
            });
        }

        // Return next question details to client
        res.status(200).json({
            message: 'Next question fetched successfully',
            completed: false,
            question: nextQuestion[0]
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Fetch Question Error:`, error);
        res.status(500).json({
            message: '❌ Error fetching next question',
            error: error.message,
            requestId: req.requestId
        });
    }
};

// ============================================================================
// 3. SUBMIT / AUTOSAVE ANSWER CONTROLLER
// Endpoint: POST /api/assessments/submit-answer
// ============================================================================
exports.submitAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { questionId, selectedOption } = req.body;

        // Input payload validation
        if (!questionId || !selectedOption) {
            return res.status(400).json({ message: 'Question ID and selected option choice are required!' });
        }

        // Verify active test session
        const [assessment] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (assessment.length === 0) {
            return res.status(404).json({ message: '❌ No active assessment found!' });
        }

        const assessmentId = assessment[0].id;

        // Check if user already submitted an answer for this specific question ID
        const [existingResponse] = await db.query(
            'SELECT id FROM user_responses WHERE assessment_id = ? AND question_id = ?',
            [assessmentId, questionId]
        );

        if (existingResponse.length > 0) {
            // Update existing answer response (user revised choice)
            await db.query(
                'UPDATE user_responses SET selected_option = ? WHERE id = ?',
                [selectedOption, existingResponse[0].id]
            );
        } else {
            // Insert new answer response row
            await db.query(
                'INSERT INTO user_responses (assessment_id, user_id, question_id, selected_option) VALUES (?, ?, ?, ?)',
                [assessmentId, userId, questionId, selectedOption]
            );
        }

        // Update last answered question tracker on assessment row
        await db.query(
            'UPDATE assessments SET last_answered_question_id = ? WHERE id = ?',
            [questionId, assessmentId]
        );

        res.status(200).json({ message: 'Answer recorded/updated successfully!' });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Submit Answer Error:`, error);
        res.status(500).json({
            message: '❌ Error submitting answer',
            error: error.message,
            requestId: req.requestId
        });
    }
};

// ============================================================================
// 4. COMPLETE ASSESSMENT & GENERATE RESULTS CONTROLLER
// Endpoint: POST /api/assessments/complete
// ============================================================================
exports.completeAssessment = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find active in-progress assessment session
        const [assessment] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (assessment.length === 0) {
            return res.status(400).json({ message: 'No active assessment found to complete.' });
        }

        const assessmentId = assessment[0].id;

        // Mark assessment status as Completed with timestamp
        await db.query(
            'UPDATE assessments SET status = ?, completed_at = NOW() WHERE id = ?',
            ['Completed', assessmentId]
        );

        // Fetch all recorded user responses along with option score weights
        const [responses] = await db.query(
            `SELECT ur.selected_option, q.score_a, q.score_b, q.score_c, q.score_d, q.mapped_trait, q.question_type
             FROM user_responses ur
             JOIN questions q ON ur.question_id = q.id
             WHERE ur.assessment_id = ?`,
            [assessmentId]
        );

        // Calculate trait scores and domain aggregates (Aptitude, Personality, Interest, EQ, Skills)
        const { aggregates, traitScores } = calculateScores(responses);

        // Fetch user profile details for report branding
        const [users] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
        const userName = users[0] ? users[0].name : `User #${userId}`;
        const userEmail = users[0] ? users[0].email : '';

        // Fetch career roles catalog and calculate career match compatibility ranking
        const [careers] = await db.query('SELECT id, career_name, required_traits FROM careers');
        const recommendations = matchCareers(traitScores, careers);

        const recommendedJson = JSON.stringify(recommendations.slice(0, 5));

        // Create PDF output directory if missing
        const pdfDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
        const pdfPath = path.join(pdfDir, `report_${assessmentId}.pdf`);

        // Generate PDF report file
        try {
            await generateReport({ userId, assessmentId, userName, userEmail, aggregates, recommendations, outPath: pdfPath });
        } catch (e) {
            console.error('PDF generation error (non-fatal):', e);
        }

        // Insert results row into assessment_results table
        const insertQuery = `
            INSERT INTO assessment_results 
            (user_id, assessment_id, aptitude_score, personality_score, interest_score, eq_score, skills_score, recommended_careers, pdf_report_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(insertQuery, [
            userId, assessmentId, 
            aggregates.aptitude, aggregates.personality, aggregates.interest, aggregates.eq, aggregates.skills, 
            recommendedJson, pdfPath
        ]);

        res.status(200).json({ 
            message: 'Assessment completed successfully! Results computed.',
            assessmentId: assessmentId,
            recommendations: recommendations.slice(0, 5),
            pdf: pdfPath
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Complete Assessment Error:`, error);
        res.status(500).json({
            message: '❌ Error completing assessment',
            error: error.message,
            requestId: req.requestId
        });
    }
};

// ============================================================================
// 5. GET USER ASSESSMENT HISTORY CONTROLLER
// Endpoint: GET /api/assessments/history
// ============================================================================
exports.getAssessmentHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const [history] = await db.query(
            'SELECT id, status, started_at as created_at, completed_at FROM assessments WHERE user_id = ? ORDER BY started_at DESC',
            [userId]
        );

        res.status(200).json({
            message: 'Assessment history fetched successfully',
            totalAssessments: history.length,
            history: history
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Fetch Assessment History Error:`, error);
        res.status(500).json({
            message: '❌ Error fetching assessment history',
            error: error.message,
            requestId: req.requestId
        });
    }
};

// ============================================================================
// 6. GET LATEST ASSESSMENT RESULT CONTROLLER
// Endpoint: GET /api/assessments/result/latest
// ============================================================================
exports.getLatestResult = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM assessment_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', 
            [userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No assessment results found.' });
        }
        
        res.status(200).json({ result: rows[0] });
    } catch (error) {
        console.error('Fetch latest result error:', error);
        res.status(500).json({ message: 'Server error fetching latest result', error: error.message });
    }
};

// ============================================================================
// 7. DOWNLOAD REPORT PDF CONTROLLER
// Endpoint: GET /api/assessments/report/:id/download
// ============================================================================
exports.downloadReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const assessmentId = req.params.id;
        const pdfDir = path.join(__dirname, '..', 'reports');
        const pdfPath = path.join(pdfDir, `report_${assessmentId}.pdf`);

        // Generate PDF report if file doesn't already exist on disk
        if (!fs.existsSync(pdfPath)) {
            const [results] = await db.query(
                'SELECT * FROM assessment_results WHERE user_id = ? AND assessment_id = ?', 
                [userId, assessmentId]
            );
            const [users] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
            
            const userName = users[0] ? users[0].name : `User #${userId}`;
            const userEmail = users[0] ? users[0].email : '';

            let recs = [];
            let aggregates = { aptitude: 75, personality: 80, interest: 85, eq: 70, skills: 78 };
            
            if (results.length > 0) {
                try { recs = JSON.parse(results[0].recommended_careers); } catch(e){}
                aggregates = {
                    aptitude: results[0].aptitude_score || 0,
                    personality: results[0].personality_score || 0,
                    interest: results[0].interest_score || 0,
                    eq: results[0].eq_score || 0,
                    skills: results[0].skills_score || 0
                };
            }
            await generateReport({ userId, assessmentId, userName, userEmail, aggregates, recommendations: recs, outPath: pdfPath });
        }

        // Stream file download response to browser
        res.download(pdfPath, `Career_Assessment_Report_${assessmentId}.pdf`);
    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({ message: 'Server error downloading report', error: error.message });
    }
};