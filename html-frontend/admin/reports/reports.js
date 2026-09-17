/**
 * admin/reports/reports.js
 */

document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);

    loadReportData();
});

async function loadReportData() {
    try {
        const data = await window.adminApi.get('/admin/analytics');
        if (data) {
            document.getElementById('rTotalUsers').textContent = data.totalUsers || 0;
            document.getElementById('rTotalAssessments').textContent = data.totalAssessments || 0;
            document.getElementById('rTotalQuestions').textContent = data.totalQuestions || 0;
            document.getElementById('rTotalCareers').textContent = data.totalCareers || 0;
            
            // Calculate completion rate safely
            const users = data.totalUsers || 0;
            const completed = data.totalAssessments || 0;
            let percentage = 0;
            
            if (users > 0) {
                // Number of completed assessments could technically be higher than users if retakes occur,
                // but for a simple completion rate display we cap it at 100%.
                percentage = Math.min(100, Math.round((completed / users) * 100));
            }
            
            const bar = document.getElementById('completionBar');
            bar.style.width = percentage + '%';
            bar.textContent = percentage + '%';
        }
    } catch (e) {
        window.adminApi.showToast(i18next.t('messages:failed_reports'), 'error');
    }
}

window.logout = function() { window.adminApi.logout(); }
