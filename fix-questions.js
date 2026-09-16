const fs = require('fs');

// Patch HTML
let htmlFile = 'html-frontend/admin/questions/questions.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

// Remove the Add button
htmlContent = htmlContent.replace(/<button class="btn btn-primary" onclick="openAddModal\(\)">[\s\S]*?<\/button>/, '');
// Change the subtitle
htmlContent = htmlContent.replace(/<p class="text-muted mb-0">Add, edit, and organize assessment questions\.<\/p>/, '<p class="text-muted mb-0">View and organize assessment questions.</p>');
// Remove the Modal
htmlContent = htmlContent.replace(/<!-- Add\/Edit Question Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '');
// Remove Actions column from header
htmlContent = htmlContent.replace(/<th>Actions<\/th>/, '');

fs.writeFileSync(htmlFile, htmlContent);

// Patch JS
let jsFile = 'html-frontend/admin/questions/questions.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');

// Replace actions td rendering
jsContent = jsContent.replace(/<td class="text-end">[\s\S]*?<\/td>/g, '');
// Remove openAddModal, editQuestion, deleteQuestion, saveQuestion functions
jsContent = jsContent.replace(/function openAddModal\(\) \{[\s\S]*?\}\s*function/g, 'function');
jsContent = jsContent.replace(/function editQuestion\(id\) \{[\s\S]*?\}\s*function/g, 'function');
jsContent = jsContent.replace(/async function deleteQuestion\(id\) \{[\s\S]*?\}\s*function/g, 'function');
jsContent = jsContent.replace(/async function saveQuestion\(\) \{[\s\S]*?\}\s*$/g, '');
// Ensure we also remove it if it's the last function
jsContent = jsContent.replace(/async function deleteQuestion\(id\) \{[\s\S]*?\}\s*$/g, '');

fs.writeFileSync(jsFile, jsContent);
console.log("Updated questions.html and questions.js");
