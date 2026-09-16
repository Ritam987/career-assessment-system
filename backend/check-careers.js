const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });
async function check() {
    const db = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
    const [cols] = await db.query("SHOW COLUMNS FROM careers");
    console.log(cols.map(c => c.Field));
    await db.end();
}
check();
