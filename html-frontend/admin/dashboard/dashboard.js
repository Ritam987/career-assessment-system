document.addEventListener('DOMContentLoaded', async () => {
    // Topbar Profile
    try {
        const profileData = await window.adminApi.get('/admin/profile');
        if (profileData && profileData.admin) {
            document.querySelector('.admin-name').textContent = profileData.admin.name;
        }
    } catch (e) {
        console.warn('Could not load profile');
    }

    loadAnalytics();
});

async function loadAnalytics() {
    window.adminApi.setLoading(true);
    try {
        const data = await window.adminApi.get('/admin/analytics');
        
        // Find elements (assuming order: Total Users, Assessments, Careers)
        const vals = document.querySelectorAll('.kc-val');
        if (vals.length >= 3) {
            vals[0].textContent = data.analytics.totalUsers || 0;
            vals[1].textContent = data.analytics.totalAssessments || 0;
            vals[2].textContent = data.analytics.totalCareers || 0;
        }
        
        // Donut center text
        const donutCenter = document.querySelector('.donut-center b');
        if (donutCenter) {
            donutCenter.textContent = data.analytics.totalUsers || 0;
        }

    } catch (error) {
        console.error('Error loading analytics:', error);
    } finally {
        window.adminApi.setLoading(false);
    }
}
