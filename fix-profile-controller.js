const fs = require('fs');

let controllerFile = 'backend/controllers/adminController.js';
let content = fs.readFileSync(controllerFile, 'utf8');

// We need bcrypt for password hashing
if (!content.includes("const bcrypt = require('bcrypt')") && !content.includes("const bcrypt = require('bcryptjs')")) {
    content = "const bcrypt = require('bcrypt');\n" + content;
}

const newFunctions = `
// ==========================================
// ADMIN PROFILE ROUTES
// ==========================================
exports.getProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const [admins] = await db.query('SELECT id, name, email, role, profile_picture FROM admins WHERE id = ?', [adminId]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json({ profile: admins[0] });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
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
        const adminId = req.user.id;
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
        const adminId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        const [admins] = await db.query('SELECT password_hash FROM admins WHERE id = ?', [adminId]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        
        const admin = admins[0];
        
        // If password_hash is null, they might have registered via Google login. We should handle it safely.
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
`;

if (!content.includes('exports.getProfile =')) {
    content += '\n' + newFunctions;
    fs.writeFileSync(controllerFile, content);
    console.log("Updated adminController.js");
} else {
    console.log("adminController.js already has profile functions");
}
