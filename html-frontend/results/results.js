// ===================================================
// Results Page — Mock Data & Logic
// ===================================================

// Sidebar toggle for mobile
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
}

// ─── Mock Results Data ──────────────────────────────
// Backend dev: replace this object with GET /api/results/me
const mockResults = {
    topCareer: {
        title: "Software Developer",
        description: "You have a strong logical mindset and enjoy working with technology. Software Development is highly recommended for your skillset.",
        score: "92%",
        demand: "High"
    },
    alternateCareers: [
        { title: "Data Analyst", category: "Information Technology", score: "85%" },
        { title: "IT Support Specialist", category: "Information Technology", score: "78%" },
        { title: "Digital Marketer", category: "Marketing", score: "72%" }
    ],
    traitScores: {
        personality: 85,
        interest: 70,
        skills: 90,
        workPreference: 78
    },
    summaryText: "You show a strong inclination towards analytical tasks and problem-solving. You prefer structured environments where you can apply technical skills independently."
};

// ─── Render Data ────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // 1. Populate Top Career
    document.getElementById("topCareer").textContent = mockResults.topCareer.title;
    document.getElementById("topCareerDesc").textContent = mockResults.topCareer.description;
    document.getElementById("matchScore").textContent = mockResults.topCareer.score;

    // 2. Populate Alternate Careers List
    const altList = document.getElementById("altCareersList");
    altList.innerHTML = mockResults.alternateCareers.map(career => `
        <div class="alt-card">
            <div class="alt-info">
                <h6>${career.title}</h6>
                <p>${career.category}</p>
            </div>
            <div class="alt-score">${career.score}</div>
        </div>
    `).join("");

    // 3. Populate Trait Scores
    // Animate bars on load
    setTimeout(() => {
        document.getElementById("barPersonality").style.width = mockResults.traitScores.personality + "%";
        document.getElementById("scorePersonality").textContent = mockResults.traitScores.personality + "%";
        
        document.getElementById("barInterest").style.width = mockResults.traitScores.interest + "%";
        document.getElementById("scoreInterest").textContent = mockResults.traitScores.interest + "%";
        
        document.getElementById("barSkills").style.width = mockResults.traitScores.skills + "%";
        document.getElementById("scoreSkills").textContent = mockResults.traitScores.skills + "%";
        
        document.getElementById("barWork").style.width = mockResults.traitScores.workPreference + "%";
        document.getElementById("scoreWork").textContent = mockResults.traitScores.workPreference + "%";
    }, 100);

    // 4. Populate Summary
    document.getElementById("traitSummaryText").textContent = mockResults.summaryText;
});
