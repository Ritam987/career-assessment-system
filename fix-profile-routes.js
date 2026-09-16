const fs = require('fs');

let routesFile = 'backend/routes/adminRoutes.js';
let content = fs.readFileSync(routesFile, 'utf8');

const profileImports = `
    getProfile,
    updateProfile,
    updateAvatar,
    updatePassword,
`;

const profileRoutes = `
// Profile
router.get('/profile',            adminMiddleware, getProfile);
router.put('/profile',            adminMiddleware, updateProfile);
router.post('/profile/avatar',    adminMiddleware, updateAvatar);
router.put('/profile/password',   adminMiddleware, updatePassword);
`;

if (!content.includes("router.get('/profile'")) {
    content = content.replace(/const \{\s*/, 'const {\n' + profileImports);
    content = content.replace(/module\.exports = router;/, profileRoutes + '\nmodule.exports = router;');
    fs.writeFileSync(routesFile, content);
    console.log("Updated adminRoutes.js");
} else {
    console.log("adminRoutes.js already updated");
}
