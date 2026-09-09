/**
 * scoreCalculator.js
 * Backend-only scoring engine.
 * Calculates category scores and career match percentages.
 * This runs ONLY on the server — never exposed to the frontend.
 */

const db = require('../config/db');

const MAX_SCORE_PER_QUESTION = 5;
const QUESTIONS_PER_CATEGORY = 20;
const MAX_CATEGORY_SCORE     = MAX_SCORE_PER_QUESTION * QUESTIONS_PER_CATEGORY; // 100

/**
 * Main scoring function.
 * Called after assessment is completed.
 * @param {number} assessmentId
 * @param {number} userId
 * @returns {object} Full result with category scores + ranked career matches
 */
async function calculateResults(assessmentId, userId) {

    // ── Step 1: Fetch all responses with their score_earned and category ──────
    const [responses] = await db.query(`
        SELECT
            ur.question_id,
            ur.selected_option,
            ur.score_earned,
            q.category_id
        FROM user_responses ur
        JOIN questions q ON ur.question_id = q.id
        WHERE ur.assessment_id = ?
    `, [assessmentId]);

    // ── Step 2: Aggregate scores by category ─────────────────────────────────
    // category IDs: 1=Personality, 2=Skills, 3=Interests, 4=Work Style
    const catTotals = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const catCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

    for (const r of responses) {
        const cid = r.category_id;
        if (catTotals[cid] !== undefined) {
            catTotals[cid] += (r.score_earned || 0);
            catCounts[cid] += 1;
        }
    }

    // ── Step 3: Convert to percentages (0–100) ────────────────────────────────
    const personalityPct = parseFloat(((catTotals[1] / MAX_CATEGORY_SCORE) * 100).toFixed(1));
    const skillsPct      = parseFloat(((catTotals[2] / MAX_CATEGORY_SCORE) * 100).toFixed(1));
    const interestsPct   = parseFloat(((catTotals[3] / MAX_CATEGORY_SCORE) * 100).toFixed(1));
    const workStylePct   = parseFloat(((catTotals[4] / MAX_CATEGORY_SCORE) * 100).toFixed(1));

    // ── Step 4: Fetch all active careers with trait weight profiles ───────────
    const [careers] = await db.query(`
        SELECT id, career_name, skill_domain, description, course_training,
               required_traits, job_roles
        FROM careers
        WHERE required_traits IS NOT NULL
        ORDER BY id ASC
    `);

    if (!careers || careers.length === 0) {
        throw new Error('No careers found in database. Please add career data first.');
    }

    // ── Step 5: Calculate match % for each career ─────────────────────────────
    const careerMatches = [];

    for (const career of careers) {
        // Parse trait weights (stored as JSON in MySQL)
        let weights;
        try {
            weights = typeof career.required_traits === 'string'
                ? JSON.parse(career.required_traits)
                : career.required_traits;
        } catch (e) {
            weights = { personality: 0.25, skills: 0.25, interests: 0.25, work_style: 0.25 };
        }

        // Parse job roles list
        let jobRoles = [];
        try {
            jobRoles = typeof career.job_roles === 'string'
                ? JSON.parse(career.job_roles)
                : (career.job_roles || []);
        } catch (e) {
            jobRoles = [];
        }

        // Weighted match percentage formula:
        // match% = (personality% × weight_p) + (skills% × weight_s)
        //        + (interests% × weight_i) + (work_style% × weight_w)
        const matchPct = parseFloat((
            (personalityPct * (weights.personality  || 0)) +
            (skillsPct      * (weights.skills       || 0)) +
            (interestsPct   * (weights.interests    || 0)) +
            (workStylePct   * (weights.work_style   || 0))
        ).toFixed(1));

        careerMatches.push({
            career_id:       career.id,
            career_name:     career.career_name,
            skill_domain:    career.skill_domain,
            description:     career.description,
            course_training: career.course_training,
            job_roles:       jobRoles,
            match_pct:       matchPct
        });
    }

    // ── Step 6: Sort by match % descending ───────────────────────────────────
    careerMatches.sort((a, b) => b.match_pct - a.match_pct);

    // ── Step 7: Primary recommendation = highest match ───────────────────────
    const primary = careerMatches[0] || null;

    return {
        personality_score:  personalityPct,
        skills_score:       skillsPct,
        interest_score:     interestsPct,
        work_style_score:   workStylePct,
        career_matches:     careerMatches,
        primary_career:     primary,
        scoring_version:    process.env.SCORING_VERSION || 'v1.0'
    };
}

module.exports = { calculateResults };
