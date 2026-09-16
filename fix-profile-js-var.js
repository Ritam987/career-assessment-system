const fs = require('fs');
let jsFile = 'html-frontend/admin/profile/profile.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');

jsContent = jsContent.replace(/const p = data\.admin;/, 'const p = data.profile;');
jsContent = jsContent.replace(/if \(data && data\.admin\)/, 'if (data && data.profile)');

fs.writeFileSync(jsFile, jsContent);
console.log("Fixed profile.js");
