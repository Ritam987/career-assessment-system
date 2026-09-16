const fs = require('fs');

let routesFile = 'backend/routes/adminRoutes.js';
let content = fs.readFileSync(routesFile, 'utf8');

const newImports = `
    updateProfile,
    updateAvatar,
    updatePassword,
`;
content = content.replace(/getAdminProfile\n\} = require/, 'getAdminProfile,\n' + newImports + '} = require');

const newRoutes = `
router.put('/profile',            adminMiddleware, updateProfile);
router.post('/profile/avatar',    adminMiddleware, updateAvatar);
router.put('/profile/password',   adminMiddleware, updatePassword);
`;
content = content.replace(/router\.get\('\/profile',[\s\S]*?;\n/, "router.get('/profile',        adminMiddleware, getAdminProfile);\n" + newRoutes);

fs.writeFileSync(routesFile, content);

let ctrlFile = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlFile, 'utf8');
// Fix req.user.id -> req.admin.id in the new functions I added
ctrlContent = ctrlContent.replace(/req\.user\.id/g, 'req.admin.id');
fs.writeFileSync(ctrlFile, ctrlContent);

let jsFile = 'html-frontend/admin/profile/profile.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');
// Change data.profile to data.admin
jsContent = jsContent.replace(/const p = data\.profile;/, 'const p = data.admin;');
jsContent = jsContent.replace(/if \(data && data\.profile\)/, 'if (data && data.admin)');
fs.writeFileSync(jsFile, jsContent);

console.log("Fixed profile routing and variables");
