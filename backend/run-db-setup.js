/**
 * run-db-setup.js
 * Run this ONCE to create all database tables and seed data.
 * Usage: node run-db-setup.js
 *
 * Prerequisites:
 *   1. MySQL Server must be running on your machine
 *   2. Your .env file must have correct DB credentials
 */

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

// Load credentials from .env manually (simple parser)
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const clean = line.trim();
    if (!clean || clean.startsWith('#')) return;
    const eqIndex = clean.indexOf('=');
    if (eqIndex === -1) return;
    const key = clean.substring(0, eqIndex).trim();
    const val = clean.substring(eqIndex + 1).trim();
    env[key] = val;
});

async function runSetup() {
    console.log('\n🚀 Career Assessment System — Database Setup\n');
    console.log('Connecting to MySQL...');

    let conn;
    try {
        conn = await mysql.createConnection({
            host:               env.DB_HOST     || 'localhost',
            user:               env.DB_USER     || 'root',
            password:           env.DB_PASSWORD || '',
            multipleStatements: true
        });
        console.log('✅ Connected to MySQL successfully!\n');
    } catch (err) {
        console.error('❌ Could not connect to MySQL!');
        console.error('   Error:', err.message);
        console.error('\n📋 Please make sure:');
        console.error('   1. MySQL Server is RUNNING on your machine');
        console.error('   2. DB_USER and DB_PASSWORD in .env are correct');
        console.error('   3. MySQL is installed (download from https://dev.mysql.com/downloads/)');
        process.exit(1);
    }

    try {
        const sqlFile = path.join(__dirname, 'db-setup.sql');
        const sql     = fs.readFileSync(sqlFile, 'utf8');

        console.log('📄 Running db-setup.sql...\n');
        await conn.query(sql);

        console.log('✅ All tables created successfully!');
        console.log('✅ 4 categories inserted');
        console.log('✅ 80 questions inserted (20 per category)');
        console.log('✅ 15 career/job roles inserted');
        console.log('✅ System settings inserted');
        console.log('\n🎉 Database setup complete! You can now start the server:\n');
        console.log('   npm run dev\n');

    } catch (err) {
        console.error('❌ SQL Error:', err.message);
        console.error('   Hint: If tables already exist, this is safe to ignore.');
    } finally {
        await conn.end();
    }
}

runSetup();
