const fs = require('fs');
let file = 'backend/controllers/adminController.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Ensure bcrypt is there
if (!content.includes("const bcrypt = require('bcrypt')") && !content.includes("const bcrypt = require('bcryptjs')")) {
    content = "const bcrypt = require('bcrypt');\n" + content;
}

// 2. Add new profile endpoints and getAllResults at the end
const newFunctions = `
// ==========================================
// ADMIN PROFILE ROUTES
// ==========================================
exports.getProfile = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const [admins] = await db.query('SELECT id, name, email, role, profile_picture FROM admins WHERE id = ?', [adminId]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json({ profile: admins[0] });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
        
        await db.query('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name, email, adminId]);
        res.status(200).json({ message: 'Profile updated' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { avatar } = req.body; // Base64 string
        if (!avatar) return res.status(400).json({ message: 'Avatar data required' });
        
        await db.query('UPDATE admins SET profile_picture = ? WHERE id = ?', [avatar, adminId]);
        res.status(200).json({ message: 'Avatar updated' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { currentPassword, newPassword } = req.body;
        
        const [admins] = await db.query('SELECT password_hash FROM admins WHERE id = ?', [adminId]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        
        const admin = admins[0];
        
        if (admin.password_hash) {
            const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
            if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        
        await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, adminId]);
        res.status(200).json({ message: 'Password updated' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// 19. GET ALL ASSESSMENT RESULTS
// ==========================================
exports.getAllResults = async (req, res) => {
    try {
        const query = \`
            SELECT 
                u.full_name, u.email, u.education_level,
                ar.primary_career_name, ar.primary_match_pct, ar.created_at as completed_at
            FROM assessment_results ar
            JOIN users u ON ar.user_id = u.id
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE a.status = 'Completed'
            ORDER BY ar.created_at DESC
        \`;
        const [results] = await db.query(query);
        res.status(200).json({ results });
    } catch (e) {
        res.status(500).json({ message: 'Server error fetching results' });
    }
};
`;

if (!content.includes('exports.updateProfile =')) {
    content += '\n' + newFunctions;
}

// 3. Fix addCareer and updateCareer carefully using string replacement
content = content.replace(
    "const { career_name, skill_domain, course_training, description, required_traits } = req.body;",
    "const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;"
);

content = content.replace(
    "INSERT INTO careers \n            (career_name, skill_domain, course_training, description, required_traits) \n            VALUES (?, ?, ?, ?, ?)",
    "INSERT INTO careers \n            (career_name, skill_domain, course_training, description, required_traits, job_roles) \n            VALUES (?, ?, ?, ?, ?, ?)"
);

content = content.replace(
    "career_name, \n            skill_domain, \n            course_training || null, \n            description || null, \n            required_traits || null\n        ];",
    "career_name, \n            skill_domain, \n            course_training || null, \n            description || null, \n            JSON.stringify(required_traits || []), \n            JSON.stringify(job_roles || [])\n        ];"
);

// updateCareer
content = content.replace(
    "const { career_name, skill_domain, course_training, description, required_traits } = req.body;",
    "const { career_name, skill_domain, course_training, description, required_traits, job_roles } = req.body;"
);

content = content.replace(
    "UPDATE careers \n            SET career_name = ?, skill_domain = ?, course_training = ?, description = ?, required_traits = ?\n            WHERE id = ?",
    "UPDATE careers \n            SET career_name = ?, skill_domain = ?, course_training = ?, description = ?, required_traits = ?, job_roles = ?\n            WHERE id = ?"
);

content = content.replace(
    "career_name, \n            skill_domain, \n            course_training || null, \n            description || null, \n            required_traits || null,\n            id\n        ];",
    "career_name, \n            skill_domain, \n            course_training || null, \n            description || null, \n            JSON.stringify(required_traits || []), \n            JSON.stringify(job_roles || []),\n            id\n        ];"
);

fs.writeFileSync(file, content);
console.log("Successfully rebuilt adminController.js");
