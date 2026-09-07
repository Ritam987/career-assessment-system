// ===================================================
// Help & Support Page — Logic
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

// ─── FAQ Accordion ──────────────────────────────────
function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = btn.classList.contains("open");

    // Close all open FAQs
    document.querySelectorAll(".faq-q").forEach(q => q.classList.remove("open"));
    document.querySelectorAll(".faq-a").forEach(a => a.classList.remove("open"));

    // Open clicked one (if it wasn't already open)
    if (!isOpen) {
        btn.classList.add("open");
        answer.classList.add("open");
    }
}

// ─── Contact Form Submit ─────────────────────────────
// Backend dev: replace this with POST /api/support/message
function submitForm(event) {
    event.preventDefault();

    const btn = document.querySelector(".submit-btn");
    btn.textContent = "Sending...";
    btn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        document.getElementById("supportForm").reset();
        document.getElementById("successMsg").classList.remove("d-none");
        btn.innerHTML = '<i class="bi bi-send-fill me-2"></i> Send Message';
        btn.disabled = false;

        // Hide success message after 5 seconds
        setTimeout(() => {
            document.getElementById("successMsg").classList.add("d-none");
        }, 5000);
    }, 1000);
}
