/**
 * ============================================================================
 * USER PROFILE CONTROLLER (userController.js)
 * ============================================================================
 * Purpose: Handles user profile management operations including fetching
 * user profile details, updating user information, managing user preferences,
 * and tracking profile completion status.
 * Separated from authController to maintain clean separation of concerns:
 * - authController: Registration, Login, Logout (Authentication)
 * - userController: Profile Management (User Data Operations)
 * ============================================================================
 */

// 1. Core Module Dependencies Imports
const db = require('../config/db');     // MySQL database connection pool instance

// ============================================================================
// 1. FETCH LOGGED-IN USER PROFILE CONTROLLER
// Endpoint: GET /api/user/profile
// ============================================================================
/**
 * Retrieves complete profile information for the currently authenticated user.
 * User ID is extracted from verified JWT token by authMiddleware.
 * Returns sanitized user data excluding sensitive fields like password_hash.
 */
exports.getUserProfile = async (req, res) => {
    try {
        // req.user is set by authMiddleware from the verified JWT token payload
        const userId = req.user.id;

        // Fetch detailed profile fields for the user
        const query = `
            SELECT id, name, email, phone, created_at, updated_at, age, gender, dob, 
                   city, state, pincode, education_level, preferred_field, career_goal, 
                   profile_completed 
            FROM users 
            WHERE id = ?
        `;
        
        const [users] = await db.query(query, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ 
                message: 'User profile not found.',
                requestId: req.requestId 
            });
        }

        res.status(200).json({ 
            message: 'Profile fetched successfully',
            user: users[0] 
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Fetch Profile Error:`, error);
        res.status(500).json({ 
            message: 'Server error while fetching profile.', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ============================================================================
// 2. UPDATE USER PROFILE CONTROLLER
// Endpoint: PUT /api/user/profile
// ============================================================================
/**
 * Updates user profile information with provided fields.
 * Automatically sets profile_completed flag to true upon successful update.
 * Validates and sanitizes input data before database update.
 * Returns updated profile data in response.
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name, phone, education_level, age, preferred_field,
            career_goal, city, state, pincode, gender, dob
        } = req.body;

        // Validation: Ensure at least name is provided
        if (!name || name.trim() === '') {
            return res.status(400).json({ 
                message: 'Name is required and cannot be empty.',
                requestId: req.requestId 
            });
        }

        // Clean & sanitize input values (handle null/empty/undefined gracefully)
        const cleanDob = dob && dob.trim() !== '' ? dob : null;
        const cleanAge = age !== undefined && age !== '' && !isNaN(parseInt(age)) ? parseInt(age) : null;
        const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;
        const cleanEducation = education_level && education_level.trim() !== '' ? education_level.trim() : null;
        const cleanPreferredField = preferred_field && preferred_field.trim() !== '' ? preferred_field.trim() : null;
        const cleanCareerGoal = career_goal && career_goal.trim() !== '' ? career_goal.trim() : null;
        const cleanCity = city && city.trim() !== '' ? city.trim() : null;
        const cleanState = state && state.trim() !== '' ? state.trim() : null;
        const cleanPincode = pincode && pincode.trim() !== '' ? pincode.trim() : null;
        const cleanGender = gender && gender.trim() !== '' ? gender.trim() : null;

        // Update user profile in database
        const updateQuery = `
            UPDATE users 
            SET name = ?, 
                phone = ?, 
                education_level = ?, 
                age = ?, 
                preferred_field = ?,
                career_goal = ?, 
                city = ?, 
                state = ?, 
                pincode = ?, 
                gender = ?, 
                dob = ?, 
                profile_completed = 1, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await db.query(updateQuery, [
            name.trim(), 
            cleanPhone, 
            cleanEducation, 
            cleanAge, 
            cleanPreferredField, 
            cleanCareerGoal, 
            cleanCity, 
            cleanState, 
            cleanPincode, 
            cleanGender, 
            cleanDob, 
            userId
        ]);

        // Fetch and return updated profile details
        const [rows] = await db.query(
            `SELECT id, name, email, phone, created_at, updated_at, age, gender, dob, 
                    city, state, pincode, education_level, preferred_field, career_goal, 
                    profile_completed 
             FROM users 
             WHERE id = ?`, 
            [userId]
        );
        
        res.status(200).json({ 
            message: 'Profile updated successfully!',
            user: rows[0] 
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Update Profile Error:`, error);
        res.status(500).json({ 
            message: 'Server error while updating profile.', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ============================================================================
// 3. GET USER STATISTICS CONTROLLER
// Endpoint: GET /api/user/stats
// ============================================================================
/**
 * Retrieves user dashboard statistics including:
 * - Total assessments completed
 * - Latest assessment score
 * - Profile completion percentage
 * - Recent activity summary
 */
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Count total completed assessments
        const [assessmentCount] = await db.query(
            'SELECT COUNT(*) as total FROM assessments WHERE user_id = ? AND status = ?',
            [userId, 'Completed']
        );

        // Get latest assessment result
        const [latestResult] = await db.query(
            `SELECT aptitude_score, personality_score, interest_score, eq_score, skills_score, created_at 
             FROM assessment_results 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userId]
        );

        // Get user profile completion status
        const [userInfo] = await db.query(
            'SELECT profile_completed FROM users WHERE id = ?',
            [userId]
        );

        // Calculate profile completion percentage
        const profileCompleted = userInfo.length > 0 && userInfo[0].profile_completed ? 100 : 50;

        // Calculate average score if assessment exists
        let lastScore = 0;
        if (latestResult.length > 0) {
            const result = latestResult[0];
            lastScore = Math.round(
                (result.aptitude_score + result.personality_score + 
                 result.interest_score + result.eq_score + result.skills_score) / 5
            );
        }

        res.status(200).json({
            message: 'User statistics fetched successfully',
            stats: {
                totalAssessments: assessmentCount[0].total,
                lastScore: lastScore,
                profileCompletion: profileCompleted,
                lastAssessmentDate: latestResult.length > 0 ? latestResult[0].created_at : null
            }
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Get User Stats Error:`, error);
        res.status(500).json({ 
            message: 'Server error while fetching user statistics.', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};

// ============================================================================
// 4. DELETE USER ACCOUNT CONTROLLER
// Endpoint: DELETE /api/user/account
// ============================================================================
/**
 * Permanently deletes user account and all associated data.
 * This is a destructive operation and should be used with caution.
 * Deletes:
 * - User profile
 * - All assessments
 * - All assessment results
 * - All user responses
 * - All notifications
 * Foreign key CASCADE constraints handle related data deletion.
 */
exports.deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { confirmEmail } = req.body;

        // Fetch user email for confirmation
        const [users] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ 
                message: 'User not found.',
                requestId: req.requestId 
            });
        }

        // Verify email confirmation matches
        if (!confirmEmail || confirmEmail.toLowerCase().trim() !== users[0].email.toLowerCase()) {
            return res.status(400).json({ 
                message: 'Email confirmation does not match. Account deletion cancelled.',
                requestId: req.requestId 
            });
        }

        // Perform account deletion (CASCADE will handle related records)
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        // Clear authentication cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.status(200).json({ 
            message: 'Account deleted successfully. All user data has been permanently removed.',
            requestId: req.requestId 
        });

    } catch (error) {
        console.error(`[Req ID: ${req.requestId}] Delete Account Error:`, error);
        res.status(500).json({ 
            message: 'Server error while deleting account.', 
            error: error.message,
            requestId: req.requestId 
        });
    }
};
