const fs = require('fs');

let ctrlFile = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlFile, 'utf8');

// Fix addCareer
ctrlContent = ctrlContent.replace(
    /const \{ career_name, skill_domain, course_training, description, required_traits \} = req\.body;/,
    "const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;"
);

ctrlContent = ctrlContent.replace(
    /INSERT INTO careers[\s\S]*?VALUES \(\?, \?, \?, \?, \?\)/,
    "INSERT INTO careers (career_name, skill_domain, course_training, description, required_traits, job_roles) VALUES (?, ?, ?, ?, ?, ?)"
);

ctrlContent = ctrlContent.replace(
    /career_name,[\s\S]*?skill_domain,[\s\S]*?course_training \|\| null,[\s\S]*?description \|\| null,[\s\S]*?required_traits \|\| null\s*\]/,
    "career_name, \n              skill_domain, \n              course_training || null, \n              description || null, \n              JSON.stringify(required_traits || []), \n              JSON.stringify(job_roles || [])\n          ]"
);

// Fix updateCareer
ctrlContent = ctrlContent.replace(
    /exports\.updateCareer = async \(req, res\) => \{[\s\S]*?const \{ career_name, skill_domain, course_training, description, required_traits \} = req\.body;/,
    "exports.updateCareer = async (req, res) => {\n    try {\n        const { id } = req.params;\n        const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;"
);

ctrlContent = ctrlContent.replace(
    /UPDATE careers SET career_name = \?, skill_domain = \?, course_training = \?, description = \?, required_traits = \? WHERE id = \?/,
    "UPDATE careers SET career_name = ?, skill_domain = ?, course_training = ?, description = ?, required_traits = ?, job_roles = ? WHERE id = ?"
);

ctrlContent = ctrlContent.replace(
    /values = \[[\s\S]*?career_name,[\s\S]*?skill_domain,[\s\S]*?course_training \|\| null,[\s\S]*?description \|\| null,[\s\S]*?required_traits \|\| null,[\s\S]*?id\s*\];/,
    "values = [\n            career_name, \n            skill_domain, \n            course_training || null, \n            description || null, \n            JSON.stringify(required_traits || []), \n            JSON.stringify(job_roles || []), \n            id\n        ];"
);

fs.writeFileSync(ctrlFile, ctrlContent);
console.log("Fixed addCareer and updateCareer");
