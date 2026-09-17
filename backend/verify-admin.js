require('dotenv').config({ path: '.env' });
const fetch = require('node-fetch');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });

    await db.query("DELETE FROM admins WHERE email = 'verify@admin.test'");
    const hash = await bcrypt.hash('TestPass123', 10);
    const [[roleRow]] = await db.query("SELECT role FROM admins LIMIT 1");
    const roleVal = roleRow ? roleRow.role : 'SuperAdmin';
    await db.query(`INSERT INTO admins (name, email, password_hash, role, company_id) VALUES ('Verify Admin', 'verify@admin.test', ?, ?, 'VTEST')`, [hash, roleVal]);

    const base = 'http://localhost:5000/api';
    const loginRes = await fetch(`${base}/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'verify@admin.test', password:'TestPass123'}) });
    const cookie = loginRes.headers.get('set-cookie').split(';')[0];
    const loginData = await loginRes.json();
    console.log(`[1] POST /admin/login: ${loginRes.status} — admin.id: ${loginData.admin && loginData.admin.id}`);

    const opts = { headers: { Cookie: cookie } };

    const profRes = await fetch(`${base}/admin/profile`, opts);
    const profData = await profRes.json();
    console.log(`[2] GET /admin/profile: ${profRes.status} — profile.name: "${profData.profile && profData.profile.name}"`);

    const profPutRes = await fetch(`${base}/admin/profile`, { method:'PUT', headers:{'Content-Type':'application/json', Cookie:cookie}, body:JSON.stringify({name:'Updated Name', email:'verify@admin.test'})});
    console.log(`[3] PUT /admin/profile: ${profPutRes.status}`);

    const anRes = await fetch(`${base}/admin/analytics`, opts);
    const an = await anRes.json();
    console.log(`[4] GET /admin/analytics: ${anRes.status}`);
    console.log(`    totalUsers=${an.totalUsers} totalAssessments=${an.totalAssessments} totalCareers=${an.totalCareers} totalQuestions=${an.totalQuestions}`);
    console.log(`    assessmentStats: completed=${an.assessmentStats&&an.assessmentStats.completed} in_progress=${an.assessmentStats&&an.assessmentStats.in_progress} not_started=${an.assessmentStats&&an.assessmentStats.not_started}`);
    console.log(`    educationStats: class10_12=${an.educationStats&&an.educationStats.class10_12} diploma=${an.educationStats&&an.educationStats.diploma} bachelors=${an.educationStats&&an.educationStats.bachelors} other=${an.educationStats&&an.educationStats.other}`);
    console.log(`    recentUsers count=${an.recentUsers&&an.recentUsers.length}`);

    const qRes = await fetch(`${base}/admin/questions`, opts);
    const qD = await qRes.json();
    console.log(`[5] GET /admin/questions: ${qRes.status} — count: ${qD.total}`);

    const cRes = await fetch(`${base}/admin/careers`, opts);
    const cD = await cRes.json();
    console.log(`[6] GET /admin/careers: ${cRes.status} — count: ${cD.careers&&cD.careers.length}`);

    const cPost = await fetch(`${base}/admin/careers`, { method:'POST', headers:{'Content-Type':'application/json', Cookie:cookie}, body:JSON.stringify({career_name:'TEST_VERIFY', skill_domain:'QA', description:'test', course_training:'none', required_traits:['a'], job_roles:['b']})});
    const cPD = await cPost.json();
    console.log(`[7] POST /admin/careers: ${cPost.status} — new id: ${cPD.careerId}`);

    if (cPD.careerId) {
        const cPut = await fetch(`${base}/admin/careers/${cPD.careerId}`, { method:'PUT', headers:{'Content-Type':'application/json', Cookie:cookie}, body:JSON.stringify({career_name:'TEST_VERIFY_UPDATED', skill_domain:'QA2', job_roles:['c']})});
        console.log(`[8] PUT /admin/careers/${cPD.careerId}: ${cPut.status}`);
        const cDel = await fetch(`${base}/admin/careers/${cPD.careerId}`, { method:'DELETE', headers:{Cookie:cookie}});
        console.log(`[9] DELETE /admin/careers/${cPD.careerId}: ${cDel.status}`);
    }

    const rRes = await fetch(`${base}/admin/results`, opts);
    const rD = await rRes.json();
    console.log(`[10] GET /admin/results: ${rRes.status} — count: ${rD.results&&rD.results.length}`);

    const catRes = await fetch(`${base}/admin/categories`, opts);
    console.log(`[11] GET /admin/categories: ${catRes.status}`);

    const notifRes = await fetch(`${base}/admin/notifications`, opts);
    console.log(`[12] GET /admin/notifications: ${notifRes.status}`);

    await db.query("DELETE FROM admins WHERE email = 'verify@admin.test'");
    await db.end();
    console.log('\n=== ALL DONE ===');
}
main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });