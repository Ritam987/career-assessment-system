const fetch = require('node-fetch');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

async function runTests() {
    const baseUrl = 'http://localhost:5000/api';
    
    // Connect to DB
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });

    await db.query("DELETE FROM admins WHERE email = 'testadmin@career.com'");
    
    const hash = await bcrypt.hash('password', 10);
    await db.query("INSERT INTO admins (name, email, password_hash, role, company_id) VALUES ('Test Admin', 'testadmin@career.com', ?, 'SuperAdmin', 'TESTCOMP')", [hash]);
    
    const freshLogin = await fetch(`${baseUrl}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testadmin@career.com', password: 'password' })
    });
    
    const adminCookies = freshLogin.headers.get('set-cookie').split(';')[0];
    const adminId = (await freshLogin.json()).admin.id;
    console.log(`Admin Logged In (ID: ${adminId})`);
    
    // 2. Test Admin Profile
    console.log("2. Testing Profile APIs...");
    const profGet = await fetch(`${baseUrl}/admin/profile`, { headers: { 'Cookie': adminCookies }});
    console.log(`GET /profile: ${profGet.status} - ${(await profGet.text()).substring(0,50)}`);
    
    const profPut = await fetch(`${baseUrl}/admin/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookies },
        body: JSON.stringify({ name: 'Updated Admin', email: 'testadmin@career.com' })
    });
    console.log(`PUT /profile: ${profPut.status}`);
    
    // 3. Test Avatar Upload
    const avaPut = await fetch(`${baseUrl}/admin/profile/avatar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookies },
        body: JSON.stringify({ avatar: 'data:image/png;base64,iVBORw0K...' })
    });
    console.log(`POST /profile/avatar: ${avaPut.status}`);
    
    // 4. Test Career CRUD
    console.log("3. Testing Career CRUD...");
    const cPost = await fetch(`${baseUrl}/admin/careers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookies },
        body: JSON.stringify({ career_name: 'Test Career API', skill_domain: 'Tech', description: 'desc', course_training: 'None', required_traits: ['A'], job_roles: ['B'] })
    });
    console.log(`POST /careers: ${cPost.status}`);
    
    const cGet = await fetch(`${baseUrl}/admin/careers`, { headers: { 'Cookie': adminCookies }});
    const careersData = await cGet.json();
    const newCareer = careersData.careers.find(c => c.career_name === 'Test Career API');
    console.log(`GET /careers: Found newly created career (ID: ${newCareer?.id})`);
    
    if (newCareer) {
        const cPut = await fetch(`${baseUrl}/admin/careers/${newCareer.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookies },
            body: JSON.stringify({ career_name: 'Test Career Updated' })
        });
        console.log(`PUT /careers/:id : ${cPut.status}`);
        
        const cDel = await fetch(`${baseUrl}/admin/careers/${newCareer.id}`, {
            method: 'DELETE', headers: { 'Cookie': adminCookies }
        });
        console.log(`DELETE /careers/:id : ${cDel.status}`);
    }
    
    // 5. Test Reports Endpoint
    console.log("4. Testing Reports API...");
    const rGet = await fetch(`${baseUrl}/admin/results`, { headers: { 'Cookie': adminCookies }});
    console.log(`GET /results: ${rGet.status} - ${(await rGet.text()).substring(0,50)}`);
    
    // Clean up
    await db.query("DELETE FROM admins WHERE email = 'testadmin@career.com'");
    await db.end();
    console.log("=== TESTS COMPLETE ===");
}
runTests().catch(console.error);
