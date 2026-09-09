const db             = require('../config/db');
const { calculateResults } = require('../utils/scoreCalculator');

// ============================================================
// 1. START OR RESUME ASSESSMENT
// ============================================================
exports.startAssessment = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if already has an In-Progress assessment
        const [existing] = await db.query(
            'SELECT * FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (existing.length > 0) {
            // Count how many questions already answered
            const [answered] = await db.query(
                'SELECT COUNT(*) as count FROM user_responses WHERE assessment_id = ?',
                [existing[0].id]
            );
            return res.status(200).json({
                message:      'Resuming existing assessment',
                assessmentId: existing[0].id,
                resuming:     true,
                answeredCount: answered[0].count
            });
        }

        // Start a fresh assessment
        const [result] = await db.query(
            'INSERT INTO assessments (user_id, status, scoring_version) VALUES (?, ?, ?)',
            [userId, 'In-Progress', process.env.SCORING_VERSION || 'v1.0']
        );

        res.status(201).json({
            message:      'New assessment started!',
            assessmentId: result.insertId,
            resuming:     false,
            answeredCount: 0
        });

    } catch (error) {
        console.error(`[${req.requestId}] Start Assessment Error:`, error);
        res.status(500).json({ message: 'Error starting assessment', error: error.message });
    }
};

// ============================================================
// 2. GET ALL QUESTIONS (sent at once for smooth navigation)
// ============================================================
exports.getAllQuestions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify user has an active assessment
        const [assessment] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (assessment.length === 0) {
            return res.status(404).json({ message: 'No active assessment found. Please start the assessment first.' });
        }

        const assessmentId = assessment[0].id;

        // Fetch all active questions with category info
        const [questions] = await db.query(`
            SELECT q.id, q.category_id, q.question_text, q.question_type,
                   q.option_a, q.option_b, q.option_c, q.option_d,
                   c.name AS category_name
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.status = 'Active'
            ORDER BY q.category_id ASC, q.id ASC
        `);

        // Fetch already-answered question IDs for this assessment
        const [answered] = await db.query(
            'SELECT question_id, selected_option FROM user_responses WHERE assessment_id = ?',
            [assessmentId]
        );

        const answeredMap = {};
        answered.forEach(r => { answeredMap[r.question_id] = r.selected_option; });

        res.status(200).json({
            message:      'Questions fetched successfully',
            assessmentId: assessmentId,
            total:        questions.length,
            answeredCount: answered.length,
            answeredMap:  answeredMap,
            questions:    questions
        });

    } catch (error) {
        console.error(`[${req.requestId}] Get Questions Error:`, error);
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

// ============================================================
// 3. SUBMIT ANSWER (saves score_earned from question table)
// ============================================================
exports.submitAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { questionId, selectedOption } = req.body;

        if (!questionId || !selectedOption) {
            return res.status(400).json({ message: 'questionId and selectedOption are required.' });
        }

        // Verify active assessment
        const [assessment] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );
        if (assessment.length === 0) {
            return res.status(404).json({ message: 'No active assessment found.' });
        }
        const assessmentId = assessment[0].id;

        // Fetch the question to get the score for selected option
        const [questions] = await db.query(
            'SELECT id, score_a, score_b, score_c, score_d FROM questions WHERE id = ?',
            [questionId]
        );
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        const q = questions[0];
        const optionKey = selectedOption.toUpperCase(); // A, B, C, or D
        const scoreMap  = { A: q.score_a, B: q.score_b, C: q.score_c, D: q.score_d };
        const scoreEarned = scoreMap[optionKey] !== undefined ? scoreMap[optionKey] : 0;

        // Upsert the response (insert or update if already answered)
        await db.query(`
            INSERT INTO user_responses (assessment_id, user_id, question_id, selected_option, score_earned)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE selected_option = VALUES(selected_option), score_earned = VALUES(score_earned)
        `, [assessmentId, userId, questionId, optionKey, scoreEarned]);

        // Update last answered question on assessment
        await db.query(
            'UPDATE assessments SET last_answered_question_id = ? WHERE id = ?',
            [questionId, assessmentId]
        );

        res.status(200).json({ message: 'Answer saved.', scoreEarned });

    } catch (error) {
        console.error(`[${req.requestId}] Submit Answer Error:`, error);
        res.status(500).json({ message: 'Error saving answer', error: error.message });
    }
};

// ============================================================
// 4. COMPLETE ASSESSMENT — runs scoring engine, saves result
// ============================================================
exports.completeAssessment = async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify active assessment
        const [assessment] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );
        if (assessment.length === 0) {
            return res.status(400).json({ message: 'No active assessment found.' });
        }
        const assessmentId = assessment[0].id;

        // Count answers — must have answered all 80
        const [countResult] = await db.query(
            'SELECT COUNT(*) as count FROM user_responses WHERE assessment_id = ?',
            [assessmentId]
        );
        const [totalQ] = await db.query(
            "SELECT COUNT(*) as count FROM questions WHERE status = 'Active'"
        );

        if (countResult[0].count < totalQ[0].count) {
            return res.status(400).json({
                message: `Please answer all ${totalQ[0].count} questions before submitting. You have answered ${countResult[0].count}.`,
                answeredCount: countResult[0].count,
                totalCount:    totalQ[0].count
            });
        }

        // Mark assessment as completed
        await db.query(
            'UPDATE assessments SET status = ?, completed_at = NOW() WHERE id = ?',
            ['Completed', assessmentId]
        );

        // Run backend scoring engine
        const result = await calculateResults(assessmentId, userId);

        // Save result to assessment_results table
        await db.query(`
            INSERT INTO assessment_results
            (user_id, assessment_id, personality_score, skills_score, interest_score,
             work_style_score, career_matches, primary_career_id, primary_career_name,
             primary_match_pct, scoring_version)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            assessmentId,
            result.personality_score,
            result.skills_score,
            result.interest_score,
            result.work_style_score,
            JSON.stringify(result.career_matches),
            result.primary_career ? result.primary_career.career_id   : null,
            result.primary_career ? result.primary_career.career_name : null,
            result.primary_career ? result.primary_career.match_pct   : 0,
            result.scoring_version
        ]);

        res.status(200).json({
            message: 'Assessment completed and results calculated!',
            assessmentId,
            primaryRecommendation: result.primary_career
                ? `${result.primary_career.match_pct}% Match with ${result.primary_career.career_name}`
                : 'No recommendation available'
        });

    } catch (error) {
        console.error(`[${req.requestId}] Complete Assessment Error:`, error);
        res.status(500).json({ message: 'Error completing assessment', error: error.message });
    }
};

// ============================================================
// 5. GET RESULTS (fetches saved result for display)
// ============================================================
exports.getResults = async (req, res) => {
    try {
        const userId = req.user.id;

        const [results] = await db.query(`
            SELECT ar.*, a.completed_at, a.started_at
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE ar.user_id = ?
            ORDER BY ar.created_at DESC
            LIMIT 1
        `, [userId]);

        if (results.length === 0) {
            return res.status(404).json({
                message: 'No results found. Please complete the assessment first.',
                hasResults: false
            });
        }

        const r = results[0];
        let careerMatches = [];
        try {
            careerMatches = typeof r.career_matches === 'string'
                ? JSON.parse(r.career_matches)
                : (r.career_matches || []);
        } catch (e) { careerMatches = []; }

        res.status(200).json({
            hasResults:        true,
            assessmentId:      r.assessment_id,
            completedAt:       r.completed_at,
            personalityScore:  r.personality_score,
            skillsScore:       r.skills_score,
            interestScore:     r.interest_score,
            workStyleScore:    r.work_style_score,
            primaryCareer: {
                id:         r.primary_career_id,
                name:       r.primary_career_name,
                match_pct:  r.primary_match_pct
            },
            careerMatches:     careerMatches,
            scoringVersion:    r.scoring_version
        });

    } catch (error) {
        console.error(`[${req.requestId}] Get Results Error:`, error);
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
};

// ============================================================
// 6. GET PROGRESS (for dashboard card)
// ============================================================
exports.getProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check for completed assessment first
        const [completed] = await db.query(
            'SELECT id, completed_at FROM assessments WHERE user_id = ? AND status = ? ORDER BY completed_at DESC LIMIT 1',
            [userId, 'Completed']
        );

        if (completed.length > 0) {
            const [result] = await db.query(
                'SELECT primary_career_name, primary_match_pct FROM assessment_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            return res.status(200).json({
                status:            'Completed',
                completedAt:       completed[0].completed_at,
                primaryCareerName: result[0] ? result[0].primary_career_name : null,
                primaryMatchPct:   result[0] ? result[0].primary_match_pct   : null
            });
        }

        // Check for in-progress assessment
        const [inProgress] = await db.query(
            'SELECT id FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'In-Progress']
        );

        if (inProgress.length > 0) {
            const [answered] = await db.query(
                'SELECT COUNT(*) as count FROM user_responses WHERE assessment_id = ?',
                [inProgress[0].id]
            );
            const [totalQ] = await db.query(
                "SELECT COUNT(*) as count FROM questions WHERE status = 'Active'"
            );
            return res.status(200).json({
                status:        'In-Progress',
                assessmentId:  inProgress[0].id,
                answeredCount: answered[0].count,
                totalCount:    totalQ[0].count
            });
        }

        // Never started
        res.status(200).json({ status: 'Not-Started' });

    } catch (error) {
        console.error(`[${req.requestId}] Get Progress Error:`, error);
        res.status(500).json({ message: 'Error fetching progress', error: error.message });
    }
};

// ============================================================
// 7. GET ASSESSMENT HISTORY
// ============================================================
exports.getAssessmentHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const [history] = await db.query(
            'SELECT id, status, started_at, completed_at FROM assessments WHERE user_id = ? ORDER BY started_at DESC',
            [userId]
        );

        res.status(200).json({
            message:          'History fetched',
            totalAssessments: history.length,
            history
        });

    } catch (error) {
        console.error(`[${req.requestId}] History Error:`, error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};