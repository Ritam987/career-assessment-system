const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to handle multiple requests efficiently
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(() => console.log('MySQL Database Connected Successfully!'))
    .catch((err) => console.error('Database Connection Failed:', err.message));

module.exports = pool;