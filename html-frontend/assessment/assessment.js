// =============================================================
// assessment.js — Full real-API assessment engine
// HTML IDs: #questionCounter, #questionProgress, #questionText
//           #bookmarkBtn, #bookmarkIcon, #optionsList .option-row
//           #prevBtn, #nextBtn, #overallPct, #overallFill
//           #completedCount, #timerDisplay, #exitModal
//           #grid-personality, #grid-interests, #grid-skills, #grid-workstyle
//           #chevron-personality/interests/skills/workstyle
//           #count-personality/interests/skills/workstyle
// =============================================================

// ── Sidebar ───────────────────────────────────────────────────
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}
async function logoutUser() {
    await apiPost('/auth/logout');
    localStorage.removeItem('cas_user');
    window.location.href = '/login/login.html';
}

// ── Category → grid key mapping (DB name → HTML id suffix) ───
const catKey = {
    'Personality': 'personality',
    'Interests':   'interests',
    'Skills':      'skills',
    'Work Style':  'workstyle'
};

// ── State ─────────────────────────────────────────────────────
let allQuestions  = [];
let answeredMap   = {};
let bookmarked    = new Set();
let currentIndex  = 0;
let timerInterval = null;
let startTime     = null;
let isSaving      = false;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const user = await requireAuth();
    if (!user) return;

    // Timer: restore across refresh
    const saved = localStorage.getItem('cas_timer_start');
    startTime   = saved ? parseInt(saved) : Date.now();
    localStorage.setItem('cas_timer_start', startTime);
    startTimer();

    // Wire option rows
    document.querySelectorAll('#optionsList .option-row').forEach((row, idx) => {
        row.addEventListener('click', () => handleOptionClick(idx));
    });

    await loadQuestions();
});

// ── Timer ─────────────────────────────────────────────────────
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        const el = document.getElementById('timerDisplay');
        if (el) el.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// ── Load questions from API ───────────────────────────────────
async function loadQuestions() {
    try {
        const res = await apiGet('/assessments/questions');
        if (!res || !res.ok) {
            showToast('No active assessment. Starting from intro...', 'error');
            setTimeout(() => { window.location.href = '../assessment-intro/intro.html'; }, 2000);
            return;
        }
        allQuestions = res.data.questions || [];
        answeredMap  = res.data.answeredMap || {};

        if (allQuestions.length === 0) {
            showToast('No questions found. Please contact support.', 'error');
            return;
        }

        // Resume from first unanswered
        const firstUnanswered = allQuestions.findIndex(q => !answeredMap[q.id]);
        currentIndex = firstUnanswered >= 0 ? firstUnanswered : 0;

        buildAllGrids();
        renderQuestion(currentIndex);

    } catch (err) {
        showToast('Failed to load questions. Please refresh.', 'error');
    }
}

// ── Build ALL 4 category grids once at load time ──────────────
function buildAllGrids() {
    const groups = {};
    allQuestions.forEach((q, globalIdx) => {
        const key = catKey[q.category_name] || 'personality';
        if (!groups[key]) groups[key] = [];
        groups[key].push({ q, globalIdx });
    });

    Object.entries(groups).forEach(([key, items]) => {
        const grid     = document.getElementById(`grid-${key}`);
        const countEl  = document.getElementById(`count-${key}`);
        if (!grid) return;

        grid.innerHTML = '';
        if (countEl) countEl.textContent = `(${items.length})`;

        items.forEach(({ q, globalIdx }, localIdx) => {
            const btn = document.createElement('button');
            btn.textContent = localIdx + 1;
            btn.className   = 'q-num';
            btn.title       = `Question ${globalIdx + 1}`;
            btn.dataset.qid = q.id;
            btn.dataset.idx = globalIdx;
            btn.addEventListener('click', () => renderQuestion(globalIdx));
            grid.appendChild(btn);
        });
    });
}

// ── Update grid button states (answered/current/bookmarked) ───
function updateGridStates() {
    Object.values(catKey).forEach(key => {
        const grid = document.getElementById(`grid-${key}`);
        if (!grid) return;
        grid.querySelectorAll('.q-num').forEach(btn => {
            const qid     = parseInt(btn.dataset.qid);
            const idx     = parseInt(btn.dataset.idx);
            btn.className = 'q-num';
            if (answeredMap[qid])    btn.classList.add('answered');
            if (bookmarked.has(qid)) btn.classList.add('bookmarked');
            if (idx === currentIndex) {
                btn.classList.remove('answered');
                btn.classList.add('current');
            }
        });
    });
}

// ── Open the category section for the current question ────────
function openCategorySection(categoryName) {
    const activeKey = catKey[categoryName] || 'personality';

    Object.entries(catKey).forEach(([, key]) => {
        const grid    = document.getElementById(`grid-${key}`);
        const chevron = document.getElementById(`chevron-${key}`);
        if (key === activeKey) {
            // Expand
            if (grid)    grid.style.display    = '';
            if (chevron) chevron.className      = 'bi bi-chevron-up';
        } else {
            // Collapse
            if (grid)    grid.style.display    = 'none';
            if (chevron) chevron.className      = 'bi bi-chevron-down';
        }
    });
}

// ── Manual toggle when user clicks a category header ─────────
function toggleCatGrid(key) {
    const grid    = document.getElementById(`grid-${key}`);
    const chevron = document.getElementById(`chevron-${key}`);
    if (!grid) return;
    const isOpen = grid.style.display !== 'none';
    grid.style.display    = isOpen ? 'none' : '';
    if (chevron) chevron.className = isOpen ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
}

// ── Render a question by index ────────────────────────────────
function renderQuestion(index) {
    if (index < 0 || index >= allQuestions.length) return;
    currentIndex = index;

    const q      = allQuestions[index];
    const total  = allQuestions.length;
    const opts   = [q.option_a, q.option_b, q.option_c, q.option_d];
    const optKeys = ['A', 'B', 'C', 'D'];

    // Question text & counter
    const counterEl  = document.getElementById('questionCounter');
    const progressEl = document.getElementById('questionProgress');
    const textEl     = document.getElementById('questionText');
    if (counterEl)  counterEl.textContent  = `Question ${index + 1} of ${total}`;
    if (progressEl) progressEl.style.width = `${((index + 1) / total) * 100}%`;
    if (textEl)     textEl.textContent     = q.question_text;

    // Category label above question
    const sectionLabel = document.querySelector('.q-section-label');
    if (sectionLabel) sectionLabel.textContent = `${q.category_name} Assessment`;

    // Bookmark
    const isBookmarked = bookmarked.has(q.id);
    const bookmarkIcon = document.getElementById('bookmarkIcon');
    const bookmarkBtn  = document.getElementById('bookmarkBtn');
    if (bookmarkIcon) bookmarkIcon.className = isBookmarked ? 'bi bi-bookmark-fill' : 'bi bi-bookmark';
    if (bookmarkBtn)  bookmarkBtn.classList.toggle('active', isBookmarked);

    // Option labels and selection state
    const rows = document.querySelectorAll('#optionsList .option-row');
    rows.forEach((row, i) => {
        const labelEl = row.querySelector('.option-label');
        const radioEl = row.querySelector('input[type="radio"]');
        if (labelEl) labelEl.textContent = opts[i] || optKeys[i];
        if (radioEl) radioEl.value       = optKeys[i];
        row.classList.remove('selected');
        if (radioEl) radioEl.checked = false;
        if (answeredMap[q.id] === optKeys[i]) {
            row.classList.add('selected');
            if (radioEl) radioEl.checked = true;
        }
    });

    // Category tab highlight
    updateCategoryTab(q.category_name);

    // Auto-open the right category section in the right panel
    openCategorySection(q.category_name);

    // Update grid button states
    updateGridStates();

    // Update overall progress bar
    updateOverallProgress();

    // Prev / Next buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) {
        if (index === total - 1) {
            nextBtn.innerHTML  = 'Submit <i class="bi bi-check2-circle"></i>';
            nextBtn.style.background = '#10b981';
        } else {
            nextBtn.innerHTML  = 'Next <i class="bi bi-arrow-right"></i>';
            nextBtn.style.background = '';
        }
    }
}

// ── Category tab highlight (top of quiz area) ─────────────────
function updateCategoryTab(categoryName) {
    const tabMap = {
        'Personality': 'personality',
        'Interests':   'interest',
        'Skills':      'skills',
        'Work Style':  'workpref'
    };
    const active = tabMap[categoryName];
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('locked');
        if (tab.dataset.cat === active) {
            tab.classList.add('active');
            tab.classList.remove('locked');
        }
    });
}

// ── Overall progress bar ──────────────────────────────────────
function updateOverallProgress() {
    const answeredCount = Object.keys(answeredMap).length;
    const total         = allQuestions.length;
    const pct           = Math.round((answeredCount / total) * 100);

    const overallPct  = document.getElementById('overallPct');
    const overallFill = document.getElementById('overallFill');
    const countEl     = document.getElementById('completedCount');
    if (overallPct)  overallPct.textContent  = pct + '%';
    if (overallFill) overallFill.style.width = pct + '%';
    if (countEl)     countEl.textContent     = `${answeredCount} / ${total}`;
}

// ── Option click handler ──────────────────────────────────────
async function handleOptionClick(optionIndex) {
    const q      = allQuestions[currentIndex];
    const option = ['A', 'B', 'C', 'D'][optionIndex];
    if (!q || !option) return;

    // Update UI immediately
    document.querySelectorAll('#optionsList .option-row').forEach((row, i) => {
        row.classList.toggle('selected', i === optionIndex);
        const radio = row.querySelector('input[type="radio"]');
        if (radio) radio.checked = (i === optionIndex);
    });

    answeredMap[q.id] = option;
    updateGridStates();
    updateOverallProgress();

    // Save to backend (non-blocking)
    if (!isSaving) {
        isSaving = true;
        apiPost('/assessments/submit-answer', { questionId: q.id, selectedOption: option })
            .catch(() => showToast('Answer not saved — check connection.', 'error'))
            .finally(() => { isSaving = false; });
    }
}

// ── Navigation ────────────────────────────────────────────────
function nextQuestion() {
    if (currentIndex < allQuestions.length - 1) {
        renderQuestion(currentIndex + 1);
    } else {
        submitAssessment();
    }
}
function prevQuestion() {
    if (currentIndex > 0) renderQuestion(currentIndex - 1);
}

// ── Bookmark ──────────────────────────────────────────────────
function toggleBookmark() {
    const q = allQuestions[currentIndex];
    if (!q) return;
    if (bookmarked.has(q.id)) bookmarked.delete(q.id);
    else bookmarked.add(q.id);
    renderQuestion(currentIndex);
}
function markReview() { toggleBookmark(); }

// ── Save & Exit (replaces Exit) ───────────────────────────────
function saveAndExit() {
    // Progress is already auto-saved on every answer — just navigate away
    showToast('Progress saved! Returning to dashboard...', 'success');
    setTimeout(() => { window.location.href = '../dashboard/dashboard.html'; }, 1000);
}

// ── Kept for compatibility but no longer called by UI ─────────
function confirmExit()   { saveAndExit(); }
function closeExitModal(){ }
function proceedExit()   { window.location.href = '../dashboard/dashboard.html'; }

// ── Submit assessment ─────────────────────────────────────────
async function submitAssessment() {
    const answered = Object.keys(answeredMap).length;
    const total    = allQuestions.length;

    if (answered < total) {
        const ok = confirm(
            `You have ${total - answered} unanswered question(s) out of ${total}.\n\nUnanswered questions will score 0.\n\nSubmit anyway?`
        );
        if (!ok) return;
    }

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) setLoading(nextBtn, true);

    const res = await apiPost('/assessments/complete');
    if (res && res.ok) {
        clearInterval(timerInterval);
        localStorage.removeItem('cas_timer_start');
        showToast('Assessment submitted! Calculating your results...', 'success');
        setTimeout(() => { window.location.href = '../results/results.html'; }, 1800);
    } else {
        showToast(res?.data?.message || 'Could not submit. Please try again.', 'error');
        if (nextBtn) setLoading(nextBtn, false);
    }
}
