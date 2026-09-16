const fs = require('fs');
let file = 'backend/controllers/adminController.js';
let content = fs.readFileSync(file, 'utf8');

// The file got mangled. Let's fix it by completely replacing the addCareer and updateCareer blocks.
// Fortunately, the rest of the file is probably okay. But let's check where addCareer starts.

const addCareerFunc = `
exports.addCareer = async (req, res) => {
    try {
        const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;

        if (!career_name || !skill_domain) {
            return res.status(400).json({ message: 'Career name and skill domain are required!' });
        }

        const query = \`
            INSERT INTO careers 
            (career_name, skill_domain, course_training, description, required_traits, job_roles) 
            VALUES (?, ?, ?, ?, ?, ?)
        \`;
        
        const values = [
            career_name, 
            skill_domain, 
            course_training || null, 
            description || null, 
            JSON.stringify(required_traits || []),
            JSON.stringify(job_roles || [])
        ];

        const [result] = await db.query(query, values);

        res.status(201).json({ 
            message: 'Career/Job Role added successfully!', 
            careerId: result.insertId 
        });
    } catch (error) {
        console.error('Add Career Error:', error);
        res.status(500).json({ message: 'Failed to add career.', error: error.message });
    }
};
`;

const updateCareerFunc = `
exports.updateCareer = async (req, res) => {
    try {
        const { id } = req.params;
        const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;

        const query = \`
            UPDATE careers 
            SET career_name = ?, skill_domain = ?, course_training = ?, description = ?, required_traits = ?, job_roles = ?
            WHERE id = ?
        \`;
        
        const values = [
            career_name, 
            skill_domain, 
            course_training || null, 
            description || null, 
            JSON.stringify(required_traits || []),
            JSON.stringify(job_roles || []),
            id
        ];

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Career not found' });
        }

        res.status(200).json({ message: 'Career updated successfully!' });
    } catch (error) {
        console.error('Update Career Error:', error);
        res.status(500).json({ message: 'Failed to update career.', error: error.message });
    }
};
`;

content = content.replace(/exports\.addCareer = async \(req, res\) => \{[\s\S]*?\} catch \(error\) \{[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Failed to add career\.', error: error\.message \}\);\s*\}\s*\};/, addCareerFunc.trim());

content = content.replace(/exports\.updateCareer = async \(req, res\) => \{\n    try \{\n        const \{ id \} = req\.params;\n        const \{ career_name, skill_domain, course_training, description, required_traits, job_roles \} = req\.body;[\s\S]*?\} catch \(error\) \{[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Failed to update career\.', error: error\.message \}\);\s*\}\s*\};/, updateCareerFunc.trim());

// Wait, the previous mangled replace probably destroyed the whole function! Let's check!
