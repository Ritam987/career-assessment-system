const fs = require('fs');
let jsFile = 'html-frontend/admin/questions/questions.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');

jsContent = jsContent.replace(/let questionModal;/, '');
jsContent = jsContent.replace(/questionModal = new bootstrap\.Modal\(document\.getElementById\('questionModal'\)\);/, '');
jsContent = jsContent.replace(/function openEditModal\(id\) \{[\s\S]*\}\s*$/, '');

fs.writeFileSync(jsFile, jsContent);
console.log("Cleaned up questions.js completely");
