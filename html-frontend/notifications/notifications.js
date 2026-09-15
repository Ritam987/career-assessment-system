/**
 * notifications/notifications.js — User notification page
 */
document.addEventListener('DOMContentLoaded', async () => {
    const user = await requireAuth();
    if (!user) return;

    // Show name
    document.querySelectorAll('.user-name, #headerName, #bannerName').forEach(el => el.textContent = user.full_name || user.email);

    loadNotifications();
});

async function loadNotifications() {
    try {
        const res = await apiGet('/assessments/notifications');
        const notifs = res && res.data && res.data.notifications ? res.data.notifications : [];

        // Update sidebar badge
        const badge = document.getElementById('sidebarBadge');
        if (badge) {
            const unread = notifs.filter(n => !n.is_read).length;
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'inline-block' : 'none';
        }

        renderNotifications(notifs);
    } catch(e) {
        console.error('Notification load error:', e);
    }
}

function renderNotifications(notifs) {
    const list = document.getElementById('notifList') || document.querySelector('.notif-list');
    if (!list) return;

    if (!notifs.length) {
        list.innerHTML = '<div class="text-center text-muted py-5"><i class="bi bi-bell-slash fs-1"></i><p class="mt-2">You are all caught up!</p></div>';
        return;
    }

    list.innerHTML = notifs.map(n => {
        let icon = 'bi-info-circle text-primary';
        if (n.type === 'REDO_APPROVED') icon = 'bi-check-circle text-success';
        if (n.type === 'REDO_REJECTED') icon = 'bi-x-circle text-danger';

        return `<div class="notif-card ${n.is_read ? '' : 'unread'} d-flex align-items-start gap-3 p-3 border-bottom" data-id="${n.id}">
            <i class="bi ${icon} fs-5 mt-1"></i>
            <div class="flex-grow-1">
                <div class="fw-semibold">${n.title}</div>
                <div class="text-muted small">${n.message}</div>
                <div class="text-muted" style="font-size:11px;margin-top:4px;">${new Date(n.created_at).toLocaleString('en-IN')}</div>
            </div>
            ${!n.is_read ? `<button class="btn btn-sm btn-outline-secondary" onclick="markOneRead(${n.id})">Mark read</button>` : ''}
        </div>`;
    }).join('');
}

window.markOneRead = async (id) => {
    try {
        await apiPatch('/assessments/notifications/' + id + '/read');
        const card = document.querySelector('.notif-card[data-id="' + id + '"]');
        if (card) { card.classList.remove('unread'); const btn = card.querySelector('button'); if (btn) btn.remove(); }
    } catch(e) { showToast('Error marking read', 'error'); }
};

window.markAllRead = async () => {
    try {
        await apiPatch('/assessments/notifications/read-all');
        loadNotifications();
    } catch(e) { showToast('Error', 'error'); }
};

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    const ov = document.getElementById('sidebarOverlay');
    if (ov) ov.classList.toggle('active');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    const ov = document.getElementById('sidebarOverlay');
    if (ov) ov.classList.remove('active');
}
async function logoutUser() {
    await apiPost('/auth/logout');
    localStorage.removeItem('cas_user');
    window.location.href = '/login/login.html';
}
