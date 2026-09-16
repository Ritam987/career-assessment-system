const fs = require('fs');

let jsFile = 'html-frontend/admin/results/results.js';
let jsContent = `
/**
 * admin/results/results.js
 */

document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    document.querySelectorAll('.admin-name, .u-name').forEach(el => el.textContent = admin.name);

    loadResults();
});

async function loadResults() {
    try {
        const data = await window.adminApi.get('/admin/results');
        renderTable(data && data.results ? data.results : []);
    } catch (e) {
        window.adminApi.showToast('Failed to load results', 'error');
        renderTable([]);
    }
}

function renderTable(results) {
    const tbody = document.querySelector('#resultsTable tbody');
    if (!tbody) return;

    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No completed assessments found.</td></tr>';
        return;
    }

    tbody.innerHTML = results.map(r => \`
        <tr>
            <td class="fw-semibold">\${r.full_name || 'Unknown'}</td>
            <td>\${r.email}</td>
            <td><span class="badge bg-light text-dark border">\${r.education_level || 'N/A'}</span></td>
            <td class="fw-bold text-primary">\${r.primary_career_name || 'N/A'}</td>
            <td>\${r.primary_match_pct ? Number(r.primary_match_pct).toFixed(1) + '%' : 'N/A'}</td>
            <td>\${new Date(r.completed_at).toLocaleString('en-IN')}</td>
        </tr>
    \`).join('');
}

window.logout = function() { window.adminApi.logout(); }
`;

fs.writeFileSync(jsFile, jsContent);
console.log("Updated results.js");
