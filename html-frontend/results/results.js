// =============================================================
// results.js â€” My Results page
// Exact HTML IDs:
//   #topCareer, #topCareerDesc, #matchScore, #altCareersList
//   #scorePersonality, #scoreInterest, #scoreSkills, #scoreWork
//   #barPersonality, #barInterest, #barSkills, #barWork
//   #traitSummaryText
//   Topbar name: .user-chip span (no id)
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

    // â”€â”€ 1. Auth guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const user = await requireAuth();
    if (!user) return;

    // â”€â”€ 2. Topbar name (no id â€” use .user-chip span) â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const chipSpan = document.querySelector('.user-chip span');
    if (chipSpan) chipSpan.textContent = user.full_name || 'User';

    // â”€â”€ 3. Load results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await loadResults();
});

async function loadResults() {
    const res = await apiGet('/assessments/results');

    if (!res || !res.ok || !res.data.hasResults) {
        // No results yet â€” show prompt to take assessment
        showNoResultsState();
        return;
    }

    const d = res.data;

    // â”€â”€ Primary career card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const primary = d.primaryCareer;
    if (primary) {
        const topCareerEl     = document.getElementById('topCareer');
        const topCareerDescEl = document.getElementById('topCareerDesc');
        const matchScoreEl    = document.getElementById('matchScore');

        if (topCareerEl)     topCareerEl.textContent     = primary.name || 'â€”';
        if (matchScoreEl)    matchScoreEl.textContent     = `${primary.match_pct}%`;
        if (topCareerDescEl) topCareerDescEl.textContent  =
            d.careerMatches[0]?.description || `Your profile matches best with ${primary.name}.`;
    }

    // â”€â”€ Alternate careers list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const altEl = document.getElementById('altCareersList');
    if (altEl) {
        const alts = (d.careerMatches || []).slice(1, 6); // positions 2-6
        if (alts.length === 0) {
            altEl.innerHTML = '<p class="text-muted small">No alternate careers found.</p>';
        } else {
            altEl.innerHTML = alts.map(career => `
                <div class="alt-card" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
                    <div>
                        <div style="font-weight:600;font-size:14px;">${career.career_name}</div>
                        <div style="font-size:12px;color:#6b7280;">${career.skill_domain || ''}</div>
                    </div>
                    <div style="font-weight:700;color:#6366f1;font-size:16px;">${career.match_pct}%</div>
                </div>
            `).join('');
        }
    }

    // â”€â”€ Category score bars (animated) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Reset bars to 0 first, then animate to real values
    const barIds = {
        barPersonality: 0,
        barInterest:    0,
        barSkills:      0,
        barWork:        0
    };
    Object.keys(barIds).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.width = '0%';
    });

    // Animate after a short delay
    setTimeout(() => {
        setBar('barPersonality', 'scorePersonality', d.personalityScore);
        setBar('barInterest',    'scoreInterest',    d.interestScore);
        setBar('barSkills',      'scoreSkills',      d.skillsScore);
        setBar('barWork',        'scoreWork',        d.workStyleScore);
    }, 300);

    // â”€â”€ Summary text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const summaryEl = document.getElementById('traitSummaryText');
    if (summaryEl) summaryEl.textContent = buildSummary(d);
}

function setBar(barId, scoreId, value) {
    const bar   = document.getElementById(barId);
    const score = document.getElementById(scoreId);
    const pct   = parseFloat(value) || 0;
    if (bar)   { bar.style.transition = 'width 0.8s ease'; bar.style.width = pct + '%'; }
    if (score) score.textContent = pct + '%';
}

function buildSummary(d) {
    const scores = [
        { name: 'Personality', val: parseFloat(d.personalityScore)  || 0 },
        { name: 'Skills',      val: parseFloat(d.skillsScore)       || 0 },
        { name: 'Interests',   val: parseFloat(d.interestScore)     || 0 },
        { name: 'Work Style',  val: parseFloat(d.workStyleScore)    || 0 }
    ].sort((a, b) => b.val - a.val);

    const top    = scores[0];
    const second = scores[1];
    const career = d.primaryCareer?.name  || 'the recommended career';
    const pct    = d.primaryCareer?.match_pct || 0;

    return `Your strongest area is ${top.name} (${top.val}%), followed by ${second.name} (${second.val}%). ` +
        `Based on this profile, ${career} is your best career match at ${pct}% compatibility. ` +
        `This reflects how well your personality, skills, interests, and work style align with the demands of this role.`;
}

function showNoResultsState() {
    // Replace the results layout with a prompt
    const layout = document.querySelector('.results-layout');
    if (!layout) return;
    layout.innerHTML = `
        <div style="text-align:center;padding:60px 20px;width:100%;">
            <div style="font-size:56px;margin-bottom:16px;">ðŸ“‹</div>
            <h4 style="font-weight:700;margin-bottom:8px;">No Results Yet</h4>
            <p style="color:#6b7280;margin-bottom:24px;">You haven't completed the assessment yet. Take the assessment to see your career recommendations.</p>
            <a href="../assessment-intro/intro.html"
               style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:10px;font-weight:600;text-decoration:none;">
                Take Assessment &rarr;
            </a>
        </div>
    `;
}
// PDF Generation
async function downloadPDF() {
    const originalContent = document.getElementById('reportContent');
    const btn = document.querySelector('.btn-download');
    
    if(!btn || !originalContent) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
    btn.disabled = true;
    
    // Create a pristine clone for html2pdf to process internally
    const clone = originalContent.cloneNode(true);
    const cloneBtn = clone.querySelector('.btn-download');
    if(cloneBtn) cloneBtn.remove();
    
    // Add the specific class for styling the PDF clone
    clone.classList.add('pdf-export-mode');
    
    const opt = {
        margin:       0.5,
        filename:     'Career_Assessment_Report.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 1000 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    try {
        await html2pdf().set(opt).from(clone).save();
    } catch (err) {
        console.error("PDF generation error:", err);
    }
    
    btn.innerHTML = originalText;
    btn.disabled = false;
}











