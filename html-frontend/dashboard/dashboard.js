// =============================================================
// dashboard.js  — real API integration
// IDs in HTML: #headerName, #bannerName, #sidebarBadge
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

// Fix logout link — dashboard sidebar uses plain href, intercept it
document.addEventListener('DOMContentLoaded', async () => {

    // ── 1. Auth guard ────────────────────────────────────────
    const user = await requireAuth();
    if (!user) return;

    // ── 2. Fill name in topbar chip and welcome banner ───────
    const firstName = (user.full_name || 'User').split(' ')[0];
    const headerNameEl = document.getElementById('headerName');
    const bannerNameEl = document.getElementById('bannerName');
    if (headerNameEl) headerNameEl.textContent = user.full_name || 'User';
    if (bannerNameEl) bannerNameEl.textContent  = firstName;

    // ── 3. Load assessment progress and update cards ─────────
    await loadProgressCards();
});

async function loadProgressCards() {
    const res = await apiGet('/assessments/progress');
    if (!res || !res.ok) return;

    const d = res.data;

    // The "Current Status" card (card-yellow)
    const statusChip  = document.querySelector('.card-yellow .chip');
    const statusBody  = document.querySelector('.card-yellow .stat-body p');
    const statusLink  = document.querySelector('.card-yellow .stat-action');

    // The progress tracker step labels
    const step1Sub    = document.querySelector('.track-step:nth-child(1) .step-sub');
    const step2Sub    = document.querySelector('.track-step:nth-child(2) .step-sub');
    const step1Circle = document.querySelector('.track-step:nth-child(1) .step-circle');
    const step2Circle = document.querySelector('.track-step:nth-child(2) .step-circle');
    const infoNote    = document.querySelector('.info-note span');

    if (d.status === 'Completed') {
        if (statusChip)  { statusChip.textContent = 'Completed'; statusChip.className = 'chip chip-green'; }
        if (statusBody)  statusBody.textContent    = `You matched ${d.primaryMatchPct}% with ${d.primaryCareerName || 'a career'}.`;
        if (statusLink)  { statusLink.textContent  = 'View Results →'; statusLink.href = '../results/results.html'; }

        if (step1Sub)    step1Sub.textContent    = 'Completed ✓';
        if (step2Sub)    step2Sub.textContent    = 'Ready';
        if (step1Circle) step1Circle.classList.add('done');
        if (step2Circle) step2Circle.classList.add('active');
        if (infoNote)    infoNote.textContent    = 'Assessment complete! View your results.';

        // Update take-assessment card text
        const takeCard = document.querySelector('.card-purple .stat-body p');
        if (takeCard) takeCard.textContent = 'You have completed the assessment. View your results.';
        const takeLink = document.querySelector('.card-purple .stat-action');
        if (takeLink) { takeLink.textContent = 'View Results →'; takeLink.href = '../results/results.html'; }

    } else if (d.status === 'In-Progress') {
        const pct = Math.round((d.answeredCount / d.totalCount) * 100);
        if (statusChip)  { statusChip.textContent = `${pct}% Done`; statusChip.className = 'chip chip-yellow'; }
        if (statusBody)  statusBody.textContent   = `You've answered ${d.answeredCount} of ${d.totalCount} questions.`;
        if (statusLink)  { statusLink.textContent = 'Resume →'; statusLink.href = '../assessment/assessment.html'; }
        if (step1Sub)    step1Sub.textContent     = `${pct}% Complete`;
        if (infoNote)    infoNote.textContent     = `Resume your assessment — ${d.totalCount - d.answeredCount} questions remaining.`;

        const takeLink = document.querySelector('.card-purple .stat-action');
        if (takeLink) { takeLink.textContent = 'Resume Assessment →'; takeLink.href = '../assessment/assessment.html'; }

    } else {
        // Not started — defaults already shown in HTML
        if (step1Sub) step1Sub.textContent = 'Pending';
    }
}
