// ===================================================
// Notifications Page — Mock Data & Logic
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

// ─── Mock Notifications Data ────────────────────────
// Backend dev: replace this array with GET /api/notifications
const mockNotifications = [
    {
        id: 1,
        type: "assessment",
        icon: "bi-clipboard-check-fill",
        iconClass: "icon-purple",
        title: "Assessment Reminder",
        message: "You have not completed your Personality Assessment yet. Resume where you left off.",
        time: "2 minutes ago",
        tag: "Assessment",
        tagClass: "tag-assessment",
        read: false
    },
    {
        id: 2,
        type: "result",
        icon: "bi-bar-chart-fill",
        iconClass: "icon-green",
        title: "Your Results are Ready!",
        message: "Your Career Assessment report has been generated. View your personalized career recommendations now.",
        time: "1 hour ago",
        tag: "Result",
        tagClass: "tag-result",
        read: false
    },
    {
        id: 3,
        type: "profile",
        icon: "bi-person-fill",
        iconClass: "icon-blue",
        title: "Profile Incomplete",
        message: "Your profile is missing some information. Complete your profile to get better career recommendations.",
        time: "3 hours ago",
        tag: "Profile",
        tagClass: "tag-profile",
        read: false
    },
    {
        id: 4,
        type: "system",
        icon: "bi-shield-check-fill",
        iconClass: "icon-orange",
        title: "Welcome to Career Assessment!",
        message: "Thank you for joining Reach India Trust's Career Assessment System. Start your assessment to discover the best career for you.",
        time: "Yesterday",
        tag: "System",
        tagClass: "tag-system",
        read: true
    },
    {
        id: 5,
        type: "reminder",
        icon: "bi-bell-fill",
        iconClass: "icon-orange",
        title: "Weekly Progress Reminder",
        message: "Don't forget! Completing your assessment brings you one step closer to your dream career.",
        time: "2 days ago",
        tag: "Reminder",
        tagClass: "tag-reminder",
        read: true
    },
    {
        id: 6,
        type: "system",
        icon: "bi-check-circle-fill",
        iconClass: "icon-green",
        title: "Account Verified Successfully",
        message: "Your account has been verified. You now have full access to all features of the Career Assessment System.",
        time: "3 days ago",
        tag: "System",
        tagClass: "tag-system",
        read: true
    }
];

let currentFilter = "all";

// ─── Render Notifications ───────────────────────────
function renderNotifications(filter) {
    const list = document.getElementById("notifList");
    const empty = document.getElementById("emptyState");

    const filtered = mockNotifications.filter(n => {
        if (filter === "unread") return !n.read;
        if (filter === "read")   return n.read;
        return true;
    });

    if (filtered.length === 0) {
        list.innerHTML = "";
        empty.classList.remove("d-none");
        return;
    }
    empty.classList.add("d-none");

    list.innerHTML = filtered.map(n => `
        <div class="notif-card ${n.read ? '' : 'unread'}" id="notif-${n.id}" onclick="markRead(${n.id})">
            ${!n.read ? '<div class="unread-dot"></div>' : ''}
            <div class="notif-icon-box ${n.iconClass}">
                <i class="bi ${n.icon}"></i>
            </div>
            <div class="notif-body">
                <p class="notif-title">${n.title}</p>
                <p class="notif-message">${n.message}</p>
                <div class="notif-meta">
                    <span class="notif-time"><i class="bi bi-clock"></i> ${n.time}</span>
                    <span class="notif-tag ${n.tagClass}">${n.tag}</span>
                </div>
            </div>
            <div class="notif-action">
                <button class="btn-view" onclick="event.stopPropagation()">View</button>
                <button class="btn-dismiss" onclick="event.stopPropagation(); dismissNotif(${n.id})">Dismiss</button>
            </div>
        </div>
    `).join("");

    updateCounts();
}

// ─── Mark Single as Read ────────────────────────────
function markRead(id) {
    const notif = mockNotifications.find(n => n.id === id);
    if (notif) notif.read = true;
    renderNotifications(currentFilter);
}

// ─── Dismiss Notification ───────────────────────────
function dismissNotif(id) {
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index > -1) mockNotifications.splice(index, 1);
    renderNotifications(currentFilter);
}

// ─── Mark All as Read ───────────────────────────────
function markAllRead() {
    mockNotifications.forEach(n => n.read = true);
    renderNotifications(currentFilter);
}

// ─── Filter Tabs ────────────────────────────────────
function filterNotifs(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    renderNotifications(filter);
}

// ─── Update Counts ──────────────────────────────────
function updateCounts() {
    const unread = mockNotifications.filter(n => !n.read).length;
    const read   = mockNotifications.filter(n => n.read).length;

    document.getElementById("countAll").textContent    = mockNotifications.length;
    document.getElementById("countUnread").textContent = unread;
    document.getElementById("countRead").textContent   = read;

    // Sidebar badge
    const badge = document.getElementById("sidebarBadge");
    if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }

    // Topbar dot
    const dot = document.getElementById("topbarDot");
    dot.style.display = unread > 0 ? "block" : "none";
}

// ─── Init ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    renderNotifications("all");
});
