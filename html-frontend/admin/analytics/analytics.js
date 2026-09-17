/**
 * admin/analytics/analytics.js
 *
 * All data comes from GET /api/admin/analytics
 * DATABASE SOURCE documented per metric.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;

    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);

    try {
        const data = await window.adminApi.get('/admin/analytics');

        if (!data) {
            showError(i18next.t('common:no_data'));
            return;
        }

        // ═══════════════════════════════════════
        // KPI STAT CARDS
        // ═══════════════════════════════════════

        // totalUsers = COUNT(*) FROM users
        document.getElementById('aTotalUsers').textContent = data.totalUsers || 0;

        // totalAssessments = COUNT(*) FROM assessments WHERE status='Completed'
        document.getElementById('aTotalCompleted').textContent = data.totalAssessments || 0;

        // Completion rate = users who have completed at least 1 assessment / totalUsers
        const totalU = data.totalUsers || 0;
        const completedU = (data.assessmentStats && data.assessmentStats.completed) || 0;
        const rate = totalU > 0 ? Math.round((completedU / totalU) * 100) : 0;
        document.getElementById('aCompletionRate').textContent = rate + '%';

        // totalCareers = COUNT(*) FROM careers
        document.getElementById('aTotalCareers').textContent = data.totalCareers || 0;

        // ═══════════════════════════════════════
        // ASSESSMENT STATUS CHART
        // Source: assessmentStats.completed / in_progress / not_started
        // These come from: each user's latest assessment status, or "Not Started" if none
        // ═══════════════════════════════════════
        const stats = data.assessmentStats || { completed: 0, in_progress: 0, not_started: 0 };

        new Chart(document.getElementById('statusChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: [i18next.t('admin:dashboard.completed'), i18next.t('admin:dashboard.in_progress'), i18next.t('admin:dashboard.not_started')],
                datasets: [{
                    label: 'Users',
                    data: [stats.completed, stats.in_progress, stats.not_started],
                    backgroundColor: ['#10b981', '#7c3aed', '#f59e0b'],
                    borderRadius: 7,
                    maxBarThickness: 64,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111827',
                        cornerRadius: 8,
                        padding: 10,
                        callbacks: { label: ctx => ' ' + ctx.raw + ' Users' }
                    }
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { color: '#6b7280', font: { family: 'Inter', size: 12 } } },
                    y: { grid: { color: '#f3f4f6' }, border: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 }, maxTicksLimit: 5 }, beginAtZero: true }
                }
            }
        });

        // ═══════════════════════════════════════
        // EDUCATION DISTRIBUTION CHART
        // Source: educationStats.class10_12 / diploma / bachelors / other
        // These come from: SUM(CASE WHEN education_level IN (...)) FROM users
        // ═══════════════════════════════════════
        const edu = data.educationStats || { class10_12: 0, diploma: 0, bachelors: 0, other: 0 };

        new Chart(document.getElementById('eduChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [i18next.t('admin:dashboard.class_10_12'), i18next.t('admin:dashboard.diploma'), i18next.t('admin:dashboard.bachelors'), i18next.t('admin:dashboard.other')],
                datasets: [{
                    data: [edu.class10_12, edu.diploma, edu.bachelors, edu.other],
                    backgroundColor: ['#5b21b6', '#3b82f6', '#10b981', '#f59e0b'],
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '62%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: { font: { family: 'Inter', size: 12 }, padding: 14, usePointStyle: true }
                    },
                    tooltip: {
                        backgroundColor: '#111827',
                        cornerRadius: 8,
                        padding: 10,
                        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} users` }
                    }
                }
            }
        });

        // ═══════════════════════════════════════
        // ASSESSMENT METRICS TABLE
        // ═══════════════════════════════════════
        const metricsBody = document.getElementById('metricsBody');
        if (metricsBody) {
            metricsBody.innerHTML = [
                [i18next.t('admin:dashboard.total_users'),            totalU,                   'COUNT(*) FROM users'],
                [i18next.t('admin:dashboard.completed_assessments'),  data.totalAssessments || 0, "COUNT(*) FROM assessments WHERE status='Completed'"],
                [i18next.t('admin:dashboard.completed') + ' Users',      stats.completed,           "Users whose latest assessment status = 'Completed'"],
                [i18next.t('admin:dashboard.in_progress') + ' Users',    stats.in_progress,         "Users whose latest assessment status = 'In-Progress'"],
                [i18next.t('admin:dashboard.not_started') + ' Users',    stats.not_started,         "Users with no assessment attempt"],
                [i18next.t('admin:sidebar.questions'),       data.totalQuestions || 0,  "COUNT(*) FROM questions WHERE status='Active'"],
                [i18next.t('admin:dashboard.career_profiles'),        data.totalCareers || 0,    'COUNT(*) FROM careers'],
                [i18next.t('admin:dashboard.completion_rate'),        rate + '%',                'Completed Users / Total Users × 100']
            ].map(([metric, val, def]) => `
                <tr>
                    <td style="padding:10px 18px;font-size:.82rem;font-weight:600;color:var(--text);">${metric}</td>
                    <td style="padding:10px 18px;font-size:.88rem;font-weight:800;color:var(--purple);">${val}</td>
                    <td style="padding:10px 18px;font-size:.75rem;color:var(--text-sub);">${def}</td>
                </tr>
            `).join('');
        }

        // ═══════════════════════════════════════
        // EDUCATION BREAKDOWN TABLE
        // ═══════════════════════════════════════
        const eduBody = document.getElementById('eduBody');
        if (eduBody) {
            const eduRows = [
                [i18next.t('admin:dashboard.class_10_12'), edu.class10_12],
                [i18next.t('admin:dashboard.diploma'),     edu.diploma],
                [i18next.t('admin:dashboard.bachelors'),  edu.bachelors],
                [i18next.t('admin:dashboard.other'),       edu.other]
            ];
            const totalForEdu = (edu.class10_12 + edu.diploma + edu.bachelors + edu.other) || 1;
            eduBody.innerHTML = eduRows.map(([label, count]) => {
                const pct = Math.round((count / totalForEdu) * 100);
                return `
                <tr>
                    <td style="padding:10px 18px;font-size:.82rem;font-weight:600;color:var(--text);">${label}</td>
                    <td style="padding:10px 18px;font-size:.88rem;font-weight:800;color:var(--purple);">${count}</td>
                    <td style="padding:10px 18px;font-size:.82rem;color:var(--text-sub);">${pct}%</td>
                </tr>`;
            }).join('');
        }

    } catch (e) {
        console.error('Analytics error:', e);
        showError(i18next.t('common:error'));
    }
});

function showError(msg) {
    document.querySelectorAll('#aTotalUsers,#aTotalCompleted,#aCompletionRate,#aTotalCareers').forEach(el => el.textContent = '—');
    ['metricsBody', 'eduBody'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<tr><td colspan="3" class="text-center py-3 text-danger" style="font-size:.8rem;">${msg}</td></tr>`;
    });
}