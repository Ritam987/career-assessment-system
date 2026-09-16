const fs = require('fs');
let htmlFile = 'html-frontend/admin/reports/reports.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

htmlContent = htmlContent.replace(/<div class="alert alert-warning">[\s\S]*?<\/div>/, '');

fs.writeFileSync(htmlFile, htmlContent);
console.log("Removed placeholder warning from reports.html");
