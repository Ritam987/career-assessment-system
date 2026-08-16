const db = require('../config/db'); // Import database connection

// Find a user by their email in the database
exports.findUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; // Returns the user object if found, otherwise undefined
};

// Insert a new user into the database
exports.createUser = async (userData) => {
    const { full_name, email, hashedPassword, age, preferred_field, career_goal } = userData;
    const query = `
        INSERT INTO users (full_name, email, password_hash, age, preferred_field, career_goal, profile_completed) 
        VALUES (?, ?, ?, ?, ?, ?, true)
    `;
    const [result] = await db.query(query, [full_name, email, hashedPassword, age, preferred_field, career_goal]);
    return result;
};