const fs = require('fs');
let file = 'html-frontend/admin/assets/js/admin-shared.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/,\s*\{\s*label:'Search & Filter'[\s\S]*?\}/, '');

fs.writeFileSync(file, content);
console.log("Removed Search & Filter from admin-shared.js");
