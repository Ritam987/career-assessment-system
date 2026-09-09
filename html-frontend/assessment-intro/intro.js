// =============================================================
// intro.js — Assessment Introduction page
// Start button is an <a> tag (line 151) — override it with JS
// No named IDs on topbar name span — use querySelector
// =============================================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}
function changeLanguage(lang) { localStorage.setItem('cas_lang', lang); }
async function logoutUser() {
    await apiPost('/auth/logout');
    localStorage.removeItem('cas_user');
    window.location.href = '/login/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {

    // ── 1. Auth guard ────────────────────────────────────────
    const user = await requireAuth();
    if (!user) return;

    // ── 2. Fill topbar user chip name (no id, use user-chip span) ──
    const chipSpan = document.querySelector('.user-chip span');
    if (chipSpan) chipSpan.textContent = user.full_name || 'User';

    // ── 3. Check progress and update start button ────────────
    const startBtn = document.querySelector('.start-btn');
    if (!startBtn) return;

    const res = await apiGet('/assessments/progress');
    if (!res || !res.ok) return;

    const d = res.data;

    if (d.status === 'Completed') {
        // Already done — redirect to results
        startBtn.textContent = '✓ View My Results';
        startBtn.href        = '../results/results.html';
        // Show info banner
        insertStatusBanner('You have already completed the assessment. Click below to view your career results.', 'success');

    } else if (d.status === 'In-Progress') {
        startBtn.innerHTML = `Resume Assessment <i class="bi bi-arrow-right"></i>`;
        startBtn.href      = '../assessment/assessment.html';
        insertStatusBanner(
            `You have already answered <strong>${d.answeredCount} of ${d.totalCount}</strong> questions. Click Resume to continue from where you left off.`,
            'warning'
        );
    }
    // else 'Not-Started' — default href to assessment.html works fine,
    // but we intercept click to call POST /start first
    startBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const dest = startBtn.href;
        startBtn.style.opacity = '0.7';
        startBtn.style.pointerEvents = 'none';
        // Start (or resume) assessment on backend
        const r = await apiPost('/assessments/start');
        if (r && r.ok) {
            window.location.href = '../assessment/assessment.html';
        } else {
            showToast(r?.data?.message || 'Could not start assessment. Please try again.', 'error');
            startBtn.style.opacity = '';
            startBtn.style.pointerEvents = '';
        }
    });
});

function insertStatusBanner(html, type) {
    const actionRow = document.querySelector('.action-row');
    if (!actionRow) return;
    const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
    const banner = document.createElement('div');
    banner.style.cssText = `
        background:${colors[type] || colors.warning}18;
        border:1.5px solid ${colors[type] || colors.warning}55;
        border-radius:10px; padding:12px 16px;
        font-size:14px; color:#374151; margin-bottom:16px;
    `;
    banner.innerHTML = `<i class="bi bi-info-circle me-2" style="color:${colors[type]}"></i>${html}`;
    actionRow.insertAdjacentElement('beforebegin', banner);
}
