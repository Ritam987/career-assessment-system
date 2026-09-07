// ===================================================
// Assessment Page — Mock Data & Interactive Logic
// ===================================================

// Sidebar toggle
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
}

// ─── Mock Questions Data ────────────────────────────
// Backend dev: replace this array with a real API call
const mockQuestions = [
    "I enjoy solving difficult problems.",
    "I prefer working in a team rather than alone.",
    "I like helping others with their tasks.",
    "I enjoy learning new skills regularly.",
    "I am comfortable speaking in front of people.",
    "I prefer routine work over creative tasks.",
    "I enjoy organizing and planning things.",
    "I like working with my hands.",
    "I enjoy reading and researching new topics.",
    "I feel energized when meeting new people.",
    "I prefer working outdoors over indoors.",
    "I enjoy working with numbers and calculations.",
    "I like coming up with new ideas.",
    "I prefer to follow instructions rather than lead.",
    "I enjoy caring for others (children, elderly, etc.).",
    "I am patient when things move slowly.",
    "I like working with technology and computers.",
    "I enjoy physical and active work.",
    "I prefer detailed and precise tasks.",
    "I enjoy artistic or creative activities."
];

const answers = new Array(20).fill(null);
const bookmarks = new Array(20).fill(false);
let currentQ = 3; // 0-indexed, start at question 4

// ─── Timer ─────────────────────────────────────────
let totalSeconds = 405; // start at 6:45 for demo
setInterval(() => {
    totalSeconds++;
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    document.getElementById("timerDisplay").textContent = `00:${m}:${s}`;
}, 1000);

// ─── Build Question Number Grid ─────────────────────
function buildGrid() {
    const grid = document.getElementById("personalityGrid");
    grid.innerHTML = "";
    for (let i = 0; i < 20; i++) {
        const btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.className = "q-num";
        if (answers[i] !== null) btn.classList.add("answered");
        if (bookmarks[i])        btn.classList.add("bookmarked");
        if (i === currentQ)      { btn.classList.remove("answered"); btn.classList.add("current"); }
        btn.onclick = () => goToQuestion(i);
        grid.appendChild(btn);
    }
}

// ─── Load Question ──────────────────────────────────
function loadQuestion(index) {
    currentQ = index;
    const total = mockQuestions.length;

    document.getElementById("questionText").textContent    = mockQuestions[index];
    document.getElementById("questionCounter").textContent = `Question ${index + 1} of ${total}`;
    document.getElementById("questionProgress").style.width = ((index + 1) / total * 100) + "%";

    // Bookmark button state
    const bookmarkBtn  = document.getElementById("bookmarkBtn");
    const bookmarkIcon = document.getElementById("bookmarkIcon");
    if (bookmarks[index]) {
        bookmarkBtn.classList.add("active");
        bookmarkIcon.className = "bi bi-bookmark-fill";
    } else {
        bookmarkBtn.classList.remove("active");
        bookmarkIcon.className = "bi bi-bookmark";
    }

    // Reset options
    const rows = document.querySelectorAll(".option-row");
    rows.forEach(row => {
        row.classList.remove("selected");
        const radio = row.querySelector("input[type=radio]");
        radio.checked = false;
    });

    // Restore saved answer
    if (answers[index] !== null) {
        rows.forEach(row => {
            const radio = row.querySelector("input[type=radio]");
            if (parseInt(radio.value) === answers[index]) {
                row.classList.add("selected");
                radio.checked = true;
            }
        });
    }

    // Update Next/Submit button
    const nextBtn = document.getElementById("nextBtn");
    if (index === total - 1) {
        nextBtn.innerHTML = 'Submit Assessment <i class="bi bi-check2-circle"></i>';
        nextBtn.classList.add("btn-submit");
    } else {
        nextBtn.innerHTML = 'Next <i class="bi bi-arrow-right"></i>';
        nextBtn.classList.remove("btn-submit");
    }

    // Disable previous on first
    document.getElementById("prevBtn").disabled = index === 0;

    // Update overall progress
    const answered = answers.filter(a => a !== null).length;
    const pct = Math.round(answered / 80 * 100);
    document.getElementById("overallPct").textContent    = pct + "%";
    document.getElementById("overallFill").style.width   = pct + "%";
    document.getElementById("completedCount").textContent = `${answered} / 80`;

    buildGrid();
}

function goToQuestion(index) { loadQuestion(index); }

// ─── Option Click ────────────────────────────────────
document.querySelectorAll(".option-row").forEach(row => {
    row.addEventListener("click", () => {
        document.querySelectorAll(".option-row").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
        const radio = row.querySelector("input[type=radio]");
        radio.checked = true;
        answers[currentQ] = parseInt(radio.value);
        buildGrid();
        updateProgress();
    });
});

function updateProgress() {
    const answered = answers.filter(a => a !== null).length;
    const pct = Math.round(answered / 80 * 100);
    document.getElementById("overallPct").textContent    = pct + "%";
    document.getElementById("overallFill").style.width   = pct + "%";
    document.getElementById("completedCount").textContent = `${answered} / 80`;
}

// ─── Custom Exit Modal ──────────────────────────────
function confirmExit() {
    document.getElementById("exitModal").classList.add("show");
}

function closeExitModal() {
    document.getElementById("exitModal").classList.remove("show");
}

function proceedExit() {
    window.location.href = "../dashboard/dashboard.html";
}

// ─── Navigation ──────────────────────────────────────
function nextQuestion() {
    if (currentQ < mockQuestions.length - 1) loadQuestion(currentQ + 1);
    else window.location.href = "../assessment-complete/complete.html";
}
function prevQuestion() {
    if (currentQ > 0) loadQuestion(currentQ - 1);
}

// ─── Bookmark ────────────────────────────────────────
function toggleBookmark() {
    bookmarks[currentQ] = !bookmarks[currentQ];
    const bookmarkBtn  = document.getElementById("bookmarkBtn");
    const bookmarkIcon = document.getElementById("bookmarkIcon");
    if (bookmarks[currentQ]) {
        bookmarkBtn.classList.add("active");
        bookmarkIcon.className = "bi bi-bookmark-fill";
    } else {
        bookmarkBtn.classList.remove("active");
        bookmarkIcon.className = "bi bi-bookmark";
    }
    buildGrid();
}

function markReview() { toggleBookmark(); }

// ─── Init ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Pre-fill some answered questions for demo
    answers[0] = 5; answers[1] = 4; answers[2] = 3;
    loadQuestion(currentQ);
});
