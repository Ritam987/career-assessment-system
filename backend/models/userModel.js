const db = require('../config/db');

// Find a user by email
exports.findUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
};

// Create a new user
exports.createUser = async ({ full_name, email, hashedPassword, phone_number, education_level, age }) => {
    const [result] = await db.query(
        'INSERT INTO users (full_name, email, password_hash, phone_number, education_level, age) VALUES (?, ?, ?, ?, ?, ?)',
        [full_name, email, hashedPassword, phone_number, education_level, age]
    );
    return result;
};

// Update profile fields
exports.updateUser = async (id, { full_name, phone_number, education_level, age }) => {
    const [result] = await db.query(
        'UPDATE users SET full_name = ?, phone_number = ?, education_level = ?, age = ? WHERE id = ?',
        [full_name, phone_number, education_level, age, id]
    );
    return result;
};

// Update password hash
exports.updatePassword = async (id, newHash) => {
    const [result] = await db.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newHash, id]
    );
    return result;
};