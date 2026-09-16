const fetch = require('node-fetch');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });
async function check() {
    const db = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
    const hash = await bcrypt.hash('password', 10);
    await db.query("INSERT INTO admins (name, email, password_hash, role, company_id) VALUES ('Test Admin', 'testadmin@career.com', ?, 'SuperAdmin', 'TESTCOMP') ON DUPLICATE KEY UPDATE id=id", [hash]);
    
    const baseUrl = 'http://localhost:5000/api';
    const login = await fetch(`${baseUrl}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testadmin@career.com', password: 'password' })
    });
    const cookies = login.headers.get('set-cookie').split(';')[0];
    
    const cPost = await fetch(`${baseUrl}/admin/careers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookies },
        body: JSON.stringify({ career_name: 'Test Career API', skill_domain: 'Tech', description: 'desc', course_training: 'None', required_traits: ['A'], job_roles: ['B'] })
    });
    console.log(await cPost.text());
    await db.end();
}
check();
