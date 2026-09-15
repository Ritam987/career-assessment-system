/**
 * admin/users/users.js
 */
document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;

    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);

    try {
        const data = await window.adminApi.get('/admin/users');
        const users = data && data.users ? data.users : [];
        renderUsers(users);
    } catch(e) {
        console.error('Failed to load users:', e.message);
        window.adminApi.showToast('Failed to load users', 'error');
    }
});

function renderUsers(users) {
    const tbody = document.querySelector('#usersTable tbody') || document.querySelector('tbody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No users registered yet.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:.8rem;">${(u.full_name || u.email).charAt(0).toUpperCase()}</div>
                    <span class="fw-semibold">${u.full_name || '—'}</span>
                </div>
            </td>
            <td>${u.email}</td>
            <td><span class="badge bg-light text-dark border">${u.education_level || 'N/A'}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
            <td><span class="badge bg-success-subtle text-success border border-success-subtle">Active</span></td>
        </tr>
    `).join('');
}

function logout() { window.adminApi.logout(); }
