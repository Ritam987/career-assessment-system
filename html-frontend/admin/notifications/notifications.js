/**
 * admin/notifications/notifications.js
 */
document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);
    loadNotifications();
});

async function loadNotifications() {
    try {
        const data = await window.adminApi.get('/admin/notifications');
        const notifs = data && data.notifications ? data.notifications : [];
        renderNotifications(notifs);
    } catch(e) {
        window.adminApi.showToast(i18next.t('messages:failed_notifications'), 'error');
    }
}

function renderNotifications(notifs) {
    const list = document.getElementById('notifList') || document.querySelector('.notif-list');
    if (!list) return;

    if (notifs.length === 0) {
        list.innerHTML = '<div class="text-center text-muted py-5"><i class="bi bi-bell-slash fs-1"></i><p class="mt-2">No notifications yet.</p></div>';
        return;
    }

    list.innerHTML = notifs.map(n => {
        let actionBtn = '';
        if (n.type === 'REDO_REQUEST') {
            actionBtn = `<a href="../redo-requests/redo-requests.html?id=${n.related_id}" class="btn btn-sm btn-primary mt-2" onclick="markRead(${n.id})" data-i18n="common:view_request" data-i18n="common:view_request">View Request</a>`;
        }
        
        return `
        <div class="notif-card ${n.is_read ? '' : 'unread'} d-flex align-items-start gap-3 p-3 border-bottom" data-id="${n.id}">
            <i class="bi ${n.type === 'REDO_REQUEST' ? 'bi-arrow-repeat text-primary' : 'bi-info-circle text-secondary'} fs-5 mt-1"></i>
            <div class="flex-grow-1">
                <div class="fw-semibold">${n.title}</div>
                <div class="text-muted small">${n.message}</div>
                ${actionBtn}
                <div class="text-muted" style="font-size:11px;margin-top:4px;">${new Date(n.created_at).toLocaleString('en-IN')}</div>
            </div>
            ${!n.is_read ? `<button class="btn btn-sm btn-outline-secondary" onclick="markRead(${n.id})">Mark read</button>` : ''}
        </div>
        `;
    }).join('');

    if (window.translateAll) window.translateAll();
}

window.markRead = async (id) => {
    try {
        await window.adminApi.patch('/admin/notifications/' + id + '/read', {});
        const card = document.querySelector('.notif-card[data-id="' + id + '"]');
        if (card) { card.classList.remove('unread'); card.querySelector('button') && card.querySelector('button').remove(); }
    } catch(e) { window.adminApi.showToast(i18next.t('messages:error'), 'error'); }
};

window.markAllRead = async () => {
    try {
        await window.adminApi.patch('/admin/notifications/read-all', {});
        loadNotifications();
    } catch(e) { window.adminApi.showToast(i18next.t('messages:error'), 'error'); }
};

function logout() { window.adminApi.logout(); }
