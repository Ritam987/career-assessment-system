/**
 * ============================================================================
 * USER MODEL (userModel.js)
 * ============================================================================
 * Purpose: Abstraction layer for interacting with the MySQL `users` database table.
 * Contains methods to query users by case-insensitive email and insert new
 * user registration records.
 * ============================================================================
 */

// 1. Import MySQL database pool
const db = require('../config/db');

/**
 * Finds a single user by their email address or phone number (case-insensitive & trimmed).
 * @param {string} identifier - Raw user email address or phone number
 * @returns {Promise<Object|null>} User record object or null if not found
 */
exports.findUserByEmail = async (identifier) => {
    if (!identifier) return null;
    
    // Normalize identifier input to lowercase and strip whitespace
    const cleanIdentifier = identifier.trim().toLowerCase();
    
    // Case-insensitive SQL lookup query searching both email and phone
    const [rows] = await db.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR phone = ?', 
        [cleanIdentifier, cleanIdentifier]
    );
    
    return rows[0] || null; 
};

/**
 * Inserts a new registered user row into the MySQL database.
 * @param {Object} userData - User registration parameters object
 * @returns {Promise<Object>} MySQL query result containing insertId
 */
exports.createUser = async (userData) => {
    const { 
        name, gender, email, phone, hashedPassword, dob, age, city, state, pincode,
        education_level, preferred_field, career_goal, is_verified
    } = userData;
    
    // Sanitize email input
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const verifiedFlag = is_verified !== undefined ? is_verified : false;
    
    // SQL INSERT Statement for new user account creation
    const query = `
        INSERT INTO users 
        (name, email, phone, password_hash, age, gender, dob, city, state, pincode, education_level, preferred_field, career_goal, profile_completed, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?)
    `;
    
    const [result] = await db.query(query, [
        name, cleanEmail, phone, hashedPassword, age, gender, dob, city, state, pincode, 
        education_level, preferred_field, career_goal, verifiedFlag
    ]);
    
    return result;
};