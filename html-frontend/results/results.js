// =============================================================
// results.js â€” My Results page
// Exact HTML IDs:
//   #topCareer, #topCareerDesc, #matchScore, #altCareersList
//   #scorePersonality, #scoreInterest, #scoreSkills, #scoreWork
//   #barPersonality, #barInterest, #barSkills, #barWork
//   #traitSummaryText
//   Topbar name: .user-chip span (no id)
// =============================================================

// Stores fetched results for PDF generation
let _resultsDataForPdf = null;
let _userDataForPdf = null;

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
    _userDataForPdf = user; // cache for PDF

    // â”€â”€ 2. Topbar name (no id â€” use .user-chip span) â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const chipSpan = document.querySelector('.user-chip span');
    if (chipSpan) chipSpan.textContent = user.full_name || 'User';

    // â”€â”€ 3. Load results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await loadResults();
    checkRedoStatus();
});

async function loadResults() {
    const res = await apiGet('/assessments/results');

    if (!res || !res.ok || !res.data.hasResults) {
        // No results yet â€” show prompt to take assessment
        showNoResultsState();
        return;
    }

    const d = res.data;
    _resultsDataForPdf = d; // cache for PDF

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
            <div style="font-size:56px;margin-bottom:16px;"><i class="bi bi-clipboard-x" style="color:#6366f1"></i></div>
            <h4 style="font-weight:700;margin-bottom:8px;">No Results Yet</h4>
            <p style="color:#6b7280;margin-bottom:24px;">You haven't completed the assessment yet. Take the assessment to see your career recommendations.</p>
            <a href="../assessment-intro/intro.html"
               style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:10px;font-weight:600;text-decoration:none;">
                Take Assessment &rarr;
            </a>
        </div>
    `;
}
// PDF Generation - Builds a dedicated A4 HTML report instead of cloning the webpage
async function downloadPDF() {
    const btn = document.querySelector('.btn-download');
    if (!btn) return;

    if (!_resultsDataForPdf) {
        alert('Results not loaded yet. Please wait a moment and try again.');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating PDF...';
    btn.disabled = true;

    try {
        const d = _resultsDataForPdf;
        const user = _userDataForPdf;
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

        // Build alternate careers rows
        const alts = (d.careerMatches || []).slice(1, 6);
        const altRows = alts.map((c, i) => `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${i + 1}. ${c.career_name || c.name}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${c.skill_domain || ''}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#6366f1;">${c.match_pct}%</td>
            </tr>
        `).join('');

        // Build profile bars
        const bars = [
            { label: 'Personality', val: parseFloat(d.personalityScore) || 0, color: '#7c3aed' },
            { label: 'Interest', val: parseFloat(d.interestScore) || 0, color: '#10b981' },
            { label: 'Skills', val: parseFloat(d.skillsScore) || 0, color: '#3b82f6' },
            { label: 'Work Style', val: parseFloat(d.workStyleScore) || 0, color: '#f59e0b' }
        ];

        const barRows = bars.map(b => `
            <div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-weight:600;font-size:13px;color:#374151;">${b.label}</span>
                    <span style="font-weight:700;font-size:13px;color:${b.color};">${b.val}%</span>
                </div>
                <div style="background:#e5e7eb;border-radius:6px;height:10px;overflow:hidden;">
                    <div style="background:${b.color};width:${b.val}%;height:100%;border-radius:6px;"></div>
                </div>
            </div>
        `).join('');

        const primary = d.primaryCareer || {};
        const primaryDesc = (d.careerMatches && d.careerMatches[0]?.description)
            || `Your profile matches best with ${primary.name}.`;
        const summary = typeof buildSummary === 'function' ? buildSummary(d) : '';

        // Build the full A4 HTML document
        const reportHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size:13px; color:#1f2937; background:#fff; }

  /* ── PAGE WRAPPER ── */
  .page { width:794px; padding:32px 40px; }

  /* ── COVER HEADER ── */
  .report-header { background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; padding:24px 32px; border-radius:12px; margin-bottom:20px; }
  .report-header h1 { font-size:24px; font-weight:700; margin-bottom:4px; }
  .report-header .sub { font-size:13px; opacity:0.85; }
  .header-meta { margin-top:14px; display:flex; gap:40px; flex-wrap:wrap; }
  .header-meta .meta-item label { font-size:10px; opacity:0.75; text-transform:uppercase; letter-spacing:0.5px; }
  .header-meta .meta-item p { font-size:14px; font-weight:600; margin-top:2px; }

  /* ── SECTION ── */
  .section { margin-bottom:16px; page-break-inside: avoid; }
  .section-title { font-size:14px; font-weight:700; color:#4f46e5; text-transform:uppercase; letter-spacing:0.5px; padding-bottom:6px; border-bottom:2px solid #e0e7ff; margin-bottom:10px; }

  /* ── TOP MATCH ── */
  .top-match-box { background:#f5f3ff; border:2px solid #c4b5fd; border-radius:10px; padding:16px 20px; page-break-inside: avoid; }
  .match-badge { display:inline-block; background:#4f46e5; color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; margin-bottom:10px; }
  .career-name { font-size:22px; font-weight:700; color:#1f2937; margin-bottom:8px; }
  .career-desc { font-size:13px; color:#4b5563; line-height:1.5; margin-bottom:10px; }
  .stats-row { display:flex; gap:24px; }
  .stat-box { background:#fff; border:1px solid #ddd6fe; border-radius:8px; padding:10px 18px; text-align:center; }
  .stat-val { font-size:22px; font-weight:800; color:#4f46e5; }
  .stat-label { font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; }

  /* ── TWO COLUMN ── */
  .two-col { display:flex; gap:20px; margin-bottom:16px; page-break-inside: avoid; }
  .col-left { flex:1.1; }
  .col-right { flex:0.9; }

  /* ── TABLE ── */
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead tr { background:#f3f4f6; }
  th { padding:8px 10px; text-align:left; font-weight:600; font-size:12px; color:#374151; }
  td { color:#4b5563; }

  /* ── SUMMARY BOX ── */
  .summary-box { background:#fffbeb; border:1px solid #fcd34d; border-radius:8px; padding:16px 20px; font-size:13px; color:#374151; line-height:1.7; page-break-inside: avoid; }

  /* ── FOOTER ── */
  .report-footer { margin-top:16px; border-top:1px solid #e5e7eb; padding-top:12px; display:flex; justify-content:space-between; font-size:11px; color:#9ca3af; }

  /* ── PAGE BREAK ── */
  .page-break { page-break-before: always; height:0; }
</style>
</head>
<body>
<div class="page">

  <!-- ═══════════ HEADER ═══════════ -->
  <div class="report-header">
    <h1>Career Assessment Report</h1>
    <div class="sub">Personalised Career Guidance by Reach India Trust</div>
    <div class="header-meta">
      <div class="meta-item"><label>Candidate Name</label><p>${user?.full_name || 'Candidate'}</p></div>
      <div class="meta-item"><label>Email</label><p>${user?.email || '—'}</p></div>
      <div class="meta-item"><label>Report Generated</label><p>${today}</p></div>
    </div>
  </div>

  <!-- ═══════════ TOP MATCH ═══════════ -->
  <div class="section">
    <div class="section-title">Primary Career Recommendation</div>
    <div class="top-match-box">
      <div class="match-badge">Top Match</div>
      <div class="career-name">${primary.name || '—'}</div>
      <div class="career-desc">${primaryDesc}</div>
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-val">${primary.match_pct || 0}%</div>
          <div class="stat-label">Match Score</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">High</div>
          <div class="stat-label">Demand</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══════════ TWO-COLUMN: ALTERNATES + PROFILE BREAKDOWN ═══════════ -->
  <div class="two-col">
    <div class="col-left">
      <div class="section">
        <div class="section-title">Other Good Career Options</div>
        <table>
          <thead>
            <tr>
              <th>Career</th>
              <th>Domain</th>
              <th style="text-align:right">Match</th>
            </tr>
          </thead>
          <tbody>
            ${altRows || '<tr><td colspan="3" style="padding:10px;color:#9ca3af;">No alternate careers found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    <div class="col-right">
      <div class="section">
        <div class="section-title">Profile Breakdown</div>
        ${barRows}
      </div>
    </div>
  </div>

  <!-- ═══════════ ASSESSMENT SUMMARY ═══════════ -->
  ${summary ? `
  <div class="section">
    <div class="section-title">Assessment Summary</div>
    <div class="summary-box">${summary}</div>
  </div>
  ` : ''}

  <!-- ═══════════ FOOTER ═══════════ -->
  <div class="report-footer">
    <span>Career Assessment System &mdash; Reach India Trust, Kolkata</span>
    <span>Generated: ${today} &nbsp;|&nbsp; Page 1</span>
  </div>

</div>
</body>
</html>
        `;

        // Create a hidden container, put our report in it, run html2pdf
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
        container.innerHTML = reportHtml;
        document.body.appendChild(container);

        const opt = {
            margin:      0,
            filename:    'Career_Assessment_Report.pdf',
            image:       { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            pagebreak: { mode: ['css', 'legacy'] },
            jsPDF:       { unit: 'px', format: 'a4', orientation: 'portrait', hotfixes: ['px_scaling'] }
        };

        await html2pdf().set(opt).from(container.querySelector('.page')).save();
        document.body.removeChild(container);

    } catch (err) {
        console.error('PDF generation error:', err);
        alert('Could not generate PDF. Please try again.');
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
}












async function checkRedoStatus() {
    try {
        const response = await apiGet('/assessments/redo-request/status');
        const btn = document.getElementById('btnGiveTestAgain');
        if (!btn) return;

        const { completedAttempts, latestRequest } = response?.data || {};
        
        // Max 3 attempts
        if (completedAttempts >= 3) {
            btn.style.display = 'none';
            return;
        }

        if (completedAttempts === 0) {
            btn.style.display = 'none';
            return;
        }

        if (latestRequest && latestRequest.status === 'PENDING') {
            btn.style.display = 'inline-block';
            btn.className = 'btn btn-secondary fw-medium';
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Request Pending';
        } else if (latestRequest && latestRequest.status === 'APPROVED' && !latestRequest.approval_used) {
            btn.style.display = 'inline-block';
            btn.className = 'btn btn-success fw-medium';
            btn.onclick = async () => {
                setLoading(btn, true);
                try {
                    const res = await apiPost('/assessments/start-new');
                    if (res && res.ok) {
                        // Clear frontend state (just to be thorough as requested)
                        localStorage.removeItem('cas_timer_start');
                        localStorage.removeItem('currentQuestionIndex');
                        sessionStorage.removeItem('assessmentState');
                        window.location.href = '../assessment/assessment.html';
                    } else {
                        const msg = res?.data?.message || 'Failed to start new attempt';
                        showToast(msg, 'error');
                        setLoading(btn, false);
                    }
                } catch (e) {
                    showToast('Network error', 'error');
                    setLoading(btn, false);
                }
            };
            btn.innerHTML = '<i class="bi bi-play-circle"></i> Start New Attempt';
        } else {
            btn.style.display = 'inline-block';
            btn.className = 'btn btn-warning fw-medium';
            btn.onclick = () => window.location.href = '../redo-request/redo-request.html';
            btn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Give Test Again';
        }
    } catch (error) {
        console.error('Error checking redo status:', error);
    }
}