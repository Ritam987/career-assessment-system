/**
 * ============================================================================
 * ADMIN CREATOR HELPER SCRIPT (addAdmin.js)
 * ============================================================================
 * Usage:
 *   1) With Command Line Arguments:
 *      node scripts/addAdmin.js "Admin Name" "admin@example.com" "Password123" "SuperAdmin"
 * 
 *   2) Interactive Prompt Mode:
 *      node scripts/addAdmin.js
 * ============================================================================
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdmin(name, email, password, role = 'Admin') {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM admins WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    if (existing.length > 0) {
      console.log(`❌ Error: An admin with email "${cleanEmail}" already exists in database.`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin record
    const [result] = await db.query(
      'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, role.trim()]
    );

    console.log('\n===========================================================');
    console.log('✅ NEW ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('-----------------------------------------------------------');
    console.log(`👤 ID:       ${result.insertId}`);
    console.log(`📛 Name:     ${name.trim()}`);
    console.log(`📧 Email:    ${cleanEmail}`);
    console.log(`🔑 Role:     ${role.trim()}`);
    console.log('===========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin account:', err.message);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length >= 3) {
  const [name, email, password, role] = args;
  createAdmin(name, email, password, role || 'Admin');
} else {
  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n===========================================================');
  console.log('🛠️  CREATE NEW ADMIN USER INTERACTIVE TOOL');
  console.log('===========================================================\n');

  rl.question('1) Enter Admin Full Name: ', (name) => {
    rl.question('2) Enter Admin Email: ', (email) => {
      rl.question('3) Enter Admin Password: ', (password) => {
        rl.question('4) Enter Role (SuperAdmin / Admin) [Default: Admin]: ', (role) => {
          rl.close();
          createAdmin(
            name || 'New Admin',
            email || 'admin@example.com',
            password || 'Admin123!',
            role || 'Admin'
          );
        });
      });
    });
  });
}
