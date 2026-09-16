const fs = require('fs');
let file = 'html-frontend/admin/assets/js/admin-shared.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{ label:'Score Management', icon:'bi-sliders',        href:'\.\.\/scoring\/scoring\.html' \}/, '');
// Clean up trailing comma
content = content.replace(/,\s*\]\s*\},/g, '\n    ]\n  },');

// Remove Configuration group
content = content.replace(/\{\s*type:'group',\s*id:'g-config',\s*label:'Configuration'[\s\S]*?\]\s*\},/, '');

// Remove Career Mapping
content = content.replace(/,\s*\{ label:'Career Mapping',\s*icon:'bi-diagram-3',\s*href:'\.\.\/mapping\/mapping\.html' \}/, '');

fs.writeFileSync(file, content);
console.log("Updated admin-shared.js");
