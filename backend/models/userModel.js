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
 * Finds a single user by their email address (case-insensitive & trimmed).
 * @param {string} email - Raw user email address
 * @returns {Promise<Object|null>} User record object or null if not found
 */
exports.findUserByEmail = async (email) => {
    if (!email) return null;
    
    // Normalize email input to lowercase and strip whitespace
    const cleanEmail = email.trim().toLowerCase();
    
    // Case-insensitive SQL lookup query using LOWER(email)
    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    
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
        education_level, preferred_field, career_goal 
    } = userData;
    
    // Sanitize email input
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    
    // SQL INSERT Statement for new user account creation
    const query = `
        INSERT INTO users 
        (name, email, phone, password_hash, age, gender, dob, city, state, pincode, education_level, preferred_field, career_goal, profile_completed) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `;
    
    const [result] = await db.query(query, [
        name, cleanEmail, phone, hashedPassword, age, gender, dob, city, state, pincode, 
        education_level, preferred_field, career_goal
    ]);
    
    return result;
};