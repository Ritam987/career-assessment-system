const mysql = require('mysql2/promise'); // Use the promise-based version of mysql2 for async/await support
require('dotenv').config(); // Load environment variables from a .env file

// Create a connection pool to handle multiple requests efficiently
const pool = mysql.createPool({
    host: process.env.DB_HOST, // Database host
    user: process.env.DB_USER, // Database user
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_NAME, // Database name
    waitForConnections: true, // Wait for a connection to be available 
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0 // Unlimited queueing for connection requests
});

pool.getConnection() // Attempt to get a connection from the pool to test the connection
    .then(() => console.log('✅ MySQL Database Connected Successfully!'))
    .catch((err) => console.error('❌ Database Connection Failed:', err.message));

module.exports = pool; // Export the connection pool for use in other parts of the application