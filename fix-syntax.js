const fs = require('fs');
let file = 'backend/controllers/adminController.js';
let content = fs.readFileSync(file, 'utf8');

// Remove the second bcrypt declaration
content = content.replace(/\nconst bcrypt = require\('bcrypt'\);\n/, '\n');

fs.writeFileSync(file, content);
console.log("Fixed syntax error");
