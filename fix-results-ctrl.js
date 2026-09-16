const fs = require('fs');

let ctrlFile = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlFile, 'utf8');

const newFunc = `
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

if (!ctrlContent.includes('exports.getAllResults =')) {
    ctrlContent += '\n' + newFunc;
    fs.writeFileSync(ctrlFile, ctrlContent);
}

let routesFile = 'backend/routes/adminRoutes.js';
let routesContent = fs.readFileSync(routesFile, 'utf8');

if (!routesContent.includes('getAllResults')) {
    routesContent = routesContent.replace(/updatePassword,\n\} = require/, 'updatePassword,\n    getAllResults\n} = require');
    routesContent = routesContent.replace(/router\.get\('\/analytics',[\s\S]*?;\n/, "router.get('/analytics',      adminMiddleware, getAdminAnalytics);\nrouter.get('/results',        adminMiddleware, getAllResults);\n");
    fs.writeFileSync(routesFile, routesContent);
}

console.log("Added getAllResults endpoint");
