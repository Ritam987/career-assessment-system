// =============================================================
// settings.js — Settings page logic (Change Password, etc.)
// =============================================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}
function changeLanguage(lang) {
    localStorage.setItem('cas_lang', lang);
    const prefLang = document.getElementById('prefLang');
    const langSelect = document.getElementById('langSelect');
    if (prefLang) prefLang.value = lang;
    if (langSelect) langSelect.value = lang;
    showToast('Language updated (simulated)', 'success');
}

async function logoutUser() {
    await apiPost('/auth/logout');
    localStorage.removeItem('cas_user');
    window.location.href = '/login/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {

    // Wire the logout buttons
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logoutUser();
        });
    });

    // ── Auth guard ───────────────────────────────────────────
    const user = await requireAuth();
    if (!user) return;

    // ── Fill topbar chip ──────────────────────────────────────
    const headerNameEl = document.getElementById('headerName');
    if (headerNameEl) headerNameEl.textContent = user.full_name || 'User';

    // ── Sync language select ──────────────────────────────────
    const savedLang = localStorage.getItem('cas_lang') || 'en';
    const prefLang = document.getElementById('prefLang');
    const langSelect = document.getElementById('langSelect');
    if (prefLang) prefLang.value = savedLang;
    if (langSelect) langSelect.value = savedLang;
});

// ── Change Password Logic ────────────────────────────────────
async function changePassword() {
    const curPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const cnfPass = document.getElementById('confirmPassword').value;

    if (!curPass || !newPass || !cnfPass) {
        showToast('Please fill in all password fields.', 'error');
        return;
    }
    if (newPass.length < 6) {
        showToast('New password must be at least 6 characters.', 'error');
        return;
    }
    if (newPass !== cnfPass) {
        showToast('New passwords do not match.', 'error');
        return;
    }

    const btn = document.getElementById('btnChangePassword');
    setLoading(btn, true);

    const res = await apiPut('/auth/change-password', {
        current_password: curPass,
        new_password: newPass
    });

    if (res && res.ok) {
        showToast('Password changed successfully!', 'success');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } else {
        showToast(res?.data?.message || 'Failed to change password.', 'error');
    }

    setLoading(btn, false, 'Update Password');
}
