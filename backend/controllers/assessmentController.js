const db = require('../config/db'); // Import database connection

// ==========================================
// 1. START OR RESUME ASSESSMENT
// ==========================================
exports.startAssessment = async (req, res) => {
    try {
        const userId = req.user.id; // coming from authMiddleware 

        // check if the user already has an in-progress assessment
        const [existingAssessment] = await db.query(
            'SELECT * FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (existingAssessment.length > 0) {
            // if the user already has an in-progress assessment, resume it
            return res.status(200).json({
                message: '✅ Resuming existing assessment',
                assessmentId: existingAssessment[0].id,
                lastAnsweredQuestionId: existingAssessment[0].last_answered_question_id
            });
        }

        // if the user is new, create a new assessment
        const [result] = await db.query(
            'INSERT INTO assessments (user_id, status) VALUES (?, ?)',
            [userId, 'In-Progress']
        );

        res.status(201).json({
            message: '✅ New assessment started successfully!',
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


// ==========================================
// 2. FETCH NEXT QUESTION (Step-by-Step)
// ==========================================
exports.getNextQuestion = async (req, res) => {
    try {
        const userId = req.user.id;

        // ১. Check if the user has an active assessment
        const [assessment] = await db.query(
            'SELECT * FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (assessment.length === 0) {
            return res.status(404).json({ message: '❌ No active assessment found. Please start the assessment first.' });
        }

        const assessmentId = assessment[0].id;

        // ২. Check for the next unanswered question
        const [nextQuestion] = await db.query(`
            SELECT q.id, q.category_id, q.question_text, q.question_type, q.mapped_trait, q.option_a, q.option_b, q.option_c, q.option_d, c.name as category_name
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.status = 'Active' 
            AND q.id NOT IN (
                SELECT question_id FROM user_responses WHERE assessment_id = ?
            )
            ORDER BY q.category_id ASC, q.id ASC
            LIMIT 1
        `, [assessmentId]);

        // if no more questions are left
        if (nextQuestion.length === 0) {
            return res.status(200).json({ 
                message: '✅ Assessment completed! No more questions left.',
                completed: true 
            });
        }

        // send the next question to the frontend
        res.status(200).json({
            message: '✅ Next question fetched successfully',
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

// ==========================================
// 3. SUBMIT ANSWER & UPDATE PROGRESS
// ==========================================
exports.submitAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { questionId, selectedOption } = req.body;

        // Validate input
        if (!questionId || !selectedOption) {
            return res.status(400).json({ message: '⚠️ Question ID and selected option are required!' });
        }

        // ১. Check if the user has an active assessment
        const [assessment] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (assessment.length === 0) {
            return res.status(404).json({ message: '❌ No active assessment found!' });
        }

        const assessmentId = assessment[0].id;

        // ২. Check if the user has already answered this question
        const [existingResponse] = await db.query(
            'SELECT id FROM user_responses WHERE assessment_id = ? AND question_id = ?',
            [assessmentId, questionId]
        );

        if (existingResponse.length > 0) {
            // if the user has already answered this question, update the existing response
            await db.query(
                'UPDATE user_responses SET selected_option = ? WHERE id = ?',
                [selectedOption, existingResponse[0].id]
            );
        } else {
            // ৩. If not answered yet, insert the new response
            await db.query(
                'INSERT INTO user_responses (assessment_id, user_id, question_id, selected_option) VALUES (?, ?, ?, ?)',
                [assessmentId, userId, questionId, selectedOption]
            );
        }

        // ৪. Update the last answered question ID in the assessments table
        await db.query(
            'UPDATE assessments SET last_answered_question_id = ? WHERE id = ?',
            [questionId, assessmentId]
        );

        res.status(200).json({ message: '✅ Answer submitted successfully!' });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Submit Answer Error:`, error);
        res.status(500).json({
            message: '❌ Error submitting answer',
            error: error.message,
            requestId: req.requestId
        });
    }
};

// ==========================================
// 4. COMPLETE ASSESSMENT
// ==========================================
exports.completeAssessment = async (req, res) => {
    try {
        const userId = req.user.id;

        // ১. Check if the user has an active assessment
        const [assessment] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (assessment.length === 0) {
            return res.status(400).json({ message: '❌ No active assessment found to complete.' });
        }

        const assessmentId = assessment[0].id;

        // ২. Mark the assessment as completed
        await db.query(
            'UPDATE assessments SET status = ?, completed_at = NOW() WHERE id = ?',
            ['Completed', assessmentId]
        );

        res.status(200).json({ 
            message: '🎉 Assessment completed successfully! Your results are now being processed.',
            assessmentId: assessmentId
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