/**
 * admin/categories/categories.js
 */

document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);

    loadCategories();
});

async function loadCategories() {
    try {
        const data = await window.adminApi.get('/admin/categories');
        const categories = data && data.categories ? data.categories : [];
        renderTable(categories);
    } catch (e) {
        window.adminApi.showToast(''+i18next.t('common:error')+'', 'error');
    }
}

function renderTable(categories) {
    const tbody = document.querySelector('#categoriesTable tbody');
    if (!tbody) return;

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">'+i18next.t('admin:categories.no_categories')+'</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(c => `
        <tr>
            <td class="fw-semibold text-muted">#${c.id}</td>
            <td class="fw-semibold text-primary">${c.name}</td>
            <td class="text-muted">${c.description || 'No description provided.'}</td>
        </tr>
    `).join('');

    if (window.translateAll) window.translateAll();
}

window.logout = function() { window.adminApi.logout(); }
