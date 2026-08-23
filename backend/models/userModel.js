const db = require('../config/db');

// Find a user by their email in the database
exports.findUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; 
};

// Insert a new user into the database
exports.createUser = async (userData) => {
    const { 
        name, gender, email, phone, hashedPassword, dob, age, city, state, pincode,
        education_level, preferred_field, career_goal 
    } = userData;
    
    // 13 input fields and `profile_completed` set to true at the end
    const query = `
        INSERT INTO users 
        (name, email, phone, password_hash, age, gender, dob, city, state, pincode, education_level, preferred_field, career_goal, profile_completed) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `;
    
    const [result] = await db.query(query, [
        name, email, phone, hashedPassword, age, gender, dob, city, state, pincode, 
        education_level, preferred_field, career_goal
    ]);
    
    return result;
};