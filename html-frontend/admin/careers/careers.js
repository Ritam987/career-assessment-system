/**
 * admin/careers/careers.js
 */

let allCareers = [];
let careerModal;

document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);

    careerModal = new bootstrap.Modal(document.getElementById('careerModal'));
    loadCareers();
});

async function loadCareers() {
    try {
        const data = await window.adminApi.get('/admin/careers');
        allCareers = data && data.careers ? data.careers : [];
        renderTable();
    } catch (e) {
        window.adminApi.showToast('Failed to load careers', 'error');
    }
}

function renderTable() {
    const tbody = document.querySelector('#careersTable tbody');
    if (!tbody) return;

    if (allCareers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No careers found.</td></tr>';
        return;
    }

    tbody.innerHTML = allCareers.map((c, i) => `
        <tr>
            <td>${c.id}</td>
            <td class="fw-semibold text-primary">${c.career_name}</td>
            <td><span class="badge bg-light text-dark border">${c.skill_domain || 'N/A'}</span></td>
            <td>${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-light text-primary me-1" onclick="openEditModal(${c.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-light text-danger" onclick="deleteCareer(${c.id})"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddModal() {
    document.getElementById('careerForm').reset();
    document.getElementById('cId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Career';
    careerModal.show();
}

function openEditModal(id) {
    const c = allCareers.find(x => x.id === id);
    if (!c) return;

    document.getElementById('cId').value = c.id;
    document.getElementById('cName').value = c.career_name;
    document.getElementById('cDomain').value = c.skill_domain || '';
    document.getElementById('cDesc').value = c.description || '';
    document.getElementById('cCourse').value = c.course_training || '';
    
    // JSON arrays might be stored as string or actual arrays depending on DB driver
    const traits = typeof c.required_traits === 'string' ? c.required_traits : JSON.stringify(c.required_traits || []);
    const roles = typeof c.job_roles === 'string' ? c.job_roles : JSON.stringify(c.job_roles || []);
    
    document.getElementById('cTraits').value = traits !== '[]' ? traits : '';
    document.getElementById('cRoles').value = roles !== '[]' ? roles : '';

    document.getElementById('modalTitle').textContent = 'Edit Career';
    careerModal.show();
}

async function saveCareer() {
    const id = document.getElementById('cId').value;
    const btn = document.getElementById('btnSaveCareer');
    
    let traits = [];
    let roles = [];
    try {
        const tVal = document.getElementById('cTraits').value.trim();
        const rVal = document.getElementById('cRoles').value.trim();
        if (tVal) traits = JSON.parse(tVal);
        if (rVal) roles = JSON.parse(rVal);
    } catch(e) {
        window.adminApi.showToast('Invalid JSON format for Traits or Roles', 'error');
        return;
    }

    const payload = {
        career_name: document.getElementById('cName').value.trim(),
        skill_domain: document.getElementById('cDomain').value.trim(),
        description: document.getElementById('cDesc').value.trim(),
        course_training: document.getElementById('cCourse').value.trim(),
        required_traits: traits,
        job_roles: roles
    };

    if (!payload.career_name) {
        window.adminApi.showToast('Career name is required', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

    try {
        if (id) {
            await window.adminApi.put('/admin/careers/' + id, payload);
            window.adminApi.showToast('Career updated successfully');
        } else {
            await window.adminApi.post('/admin/careers', payload);
            window.adminApi.showToast('Career added successfully');
        }
        careerModal.hide();
        loadCareers();
    } catch (e) {
        window.adminApi.showToast(e.message || 'Failed to save career', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Career';
    }
}

async function deleteCareer(id) {
    if (!confirm('Are you sure you want to delete this career profile?')) return;
    
    try {
        await window.adminApi.delete('/admin/careers/' + id);
        window.adminApi.showToast('Career deleted');
        loadCareers();
    } catch (e) {
        window.adminApi.showToast('Failed to delete career', 'error');
    }
}

window.logout = function() { window.adminApi.logout(); }
