/**
 * ============================================================================
 * DATABASE CONFIGURATION (db.js)
 * ============================================================================
 * Purpose: Creates and exports a MySQL promise-based connection pool using mysql2.
 * A connection pool manages reusable database connections to ensure optimal
 * performance and high throughput under heavy concurrent user traffic.
 * ============================================================================
 */

// 1. Import MySQL promise-wrapper library and Node.js path module
const mysql = require('mysql2/promise'); // Promise-enabled MySQL driver for async/await usage
const path = require('path');             // Path module to accurately find .env configuration file

// 2. Explicitly load environment variables from backend/.env
// Ensures CLI commands and standalone scripts reliably find DB environment credentials
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 3. Configure and initialize the MySQL Connection Pool
// Connection pooling avoids opening and closing new TCP socket connections for every single query
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',     // Database host server hostname (e.g. localhost or remote IP)
    user: process.env.DB_USER || 'root',          // Database access user username
    password: process.env.DB_PASSWORD || '',      // Database user access password
    database: process.env.DB_NAME || 'career_assessment', // Name of target MySQL database instance
    waitForConnections: true,                     // Queue incoming queries when all pool connections are busy
    connectionLimit: 10,                          // Maximum number of concurrent connections in pool
    queueLimit: 0                                 // Unlimited query queue size (0 means no limit on queued queries)
});

// 4. Test Initial Database Connectivity on Startup
pool.getConnection()
    .then((connection) => {
        console.log('✅ MySQL Connection Pool initialized & connected successfully to database:', process.env.DB_NAME || 'career_assessment');
        connection.release(); // Release connection back to pool immediately after initial test ping
    })
    .catch((err) => {
        console.error('❌ Critical Database Connection Error:', err.message);
    });

// 5. Export Database Connection Pool Instance for application-wide query execution
module.exports = pool;