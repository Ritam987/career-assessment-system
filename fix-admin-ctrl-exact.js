const fs = require('fs');
let file = 'backend/controllers/adminController.js';
let content = fs.readFileSync(file, 'utf8');

const addStart = content.indexOf('exports.addCareer =');
const addEnd = content.indexOf('exports.getAllCareers =');

const addCareerFunc = `exports.addCareer = async (req, res) => {
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

// ==========================================
// 6. GET ALL CAREERS
// ==========================================
`;

if (addStart > -1 && addEnd > -1) {
    content = content.substring(0, addStart) + addCareerFunc + content.substring(addEnd + 66);
}

const upStart = content.indexOf('exports.updateCareer =');
const upEnd = content.indexOf('exports.deleteCareer =');

const updateCareerFunc = `exports.updateCareer = async (req, res) => {
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

// ==========================================
// 12. DELETE CAREER
// ==========================================
`;

if (upStart > -1 && upEnd > -1) {
    content = content.substring(0, upStart) + updateCareerFunc + content.substring(upEnd + 67);
}

fs.writeFileSync(file, content);
console.log("Fixed addCareer and updateCareer accurately");
