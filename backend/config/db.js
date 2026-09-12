/**
 * ============================================================================
 * DATABASE CONFIGURATION (db.js)
 * ============================================================================
 * Purpose: Creates and exports a MySQL promise-based connection pool using mysql2.
 * Supports Railway production environment variables (MYSQLHOST, MYSQLUSER, 
 * MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT, MYSQL_URL, DATABASE_URL) alongside
 * standard environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT)
 * and local development defaults.
 * ============================================================================
 */

const mysql = require('mysql2/promise');
const path = require('path');

// Explicitly load environment variables from backend/.env (override pre-existing shell vars)
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

// Extract connection URL if provided by Railway / PaaS
const connectionUrl = (process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || '').trim();

let pool;

if (connectionUrl) {
    // If a full MySQL connection URL string is provided by Railway
    pool = mysql.createPool(connectionUrl);
} else {
    // Discrete environment variables with Railway PaaS and standard fallbacks
    const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
    const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
    const password = process.env.MYSQLPASSWORD !== undefined 
        ? process.env.MYSQLPASSWORD 
        : (process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '');
    const database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'career_assessment_db';
    const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);

    pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

// Test initial database connectivity on startup
pool.getConnection()
    .then((connection) => {
        const activeDb = process.env.MYSQLDATABASE || process.env.DB_NAME || 'career_assessment_db';
        const activeHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
        console.log(`✅ MySQL Connection Pool initialized & connected successfully to database [${activeDb}] on host [${activeHost}]`);
        connection.release();
    })
    .catch((err) => {
        console.error('❌ Critical Database Connection Error:', err.message);
    });

module.exports = pool;