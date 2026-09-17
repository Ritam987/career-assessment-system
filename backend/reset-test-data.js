const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function resetData() {
    console.log('\n=============================================');
    console.log('       WIPING USER DATA FOR TESTING');
    console.log('=============================================\n');

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'career_assessment_db'
        });

        console.log('[*] Connected to database.');

        // Disable FK checks to allow deleting tables with relations
        await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
        
        console.log('[-] Wiping notifications...');
        await conn.query('DELETE FROM notifications;');

        console.log('[-] Wiping redo_requests...');
        await conn.query('DELETE FROM redo_requests;');

        console.log('[-] Wiping user_responses...');
        await conn.query('DELETE FROM user_responses;');

        console.log('[-] Wiping assessment_results...');
        await conn.query('DELETE FROM assessment_results;');

        console.log('[-] Wiping assessments...');
        await conn.query('DELETE FROM assessments;');

        console.log('[-] Wiping users...');
        await conn.query('DELETE FROM users;');

        // Re-enable FK checks
        await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('\n[+] SUCCESS! All test user data has been wiped.');
        console.log('    (Admins, Questions, Categories, and Careers were NOT deleted)');
        
        await conn.end();
    } catch (err) {
        console.error('[-] ERROR:', err.message);
    }
    process.exit();
}

resetData();
