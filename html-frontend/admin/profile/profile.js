
/**
 * admin/profile/profile.js
 */

document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    
    // Sidebar/Topbar names
    document.querySelectorAll('.admin-name, .u-name').forEach(el => el.textContent = admin.name);
    
    loadProfile();

    document.getElementById('btnSaveProfile').addEventListener('click', saveProfile);
    document.getElementById('btnSavePassword').addEventListener('click', savePassword);
    
    // Avatar Upload
    document.getElementById('avatarUpload').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64Str = ev.target.result;
            try {
                await window.adminApi.post('/admin/profile/avatar', { avatar: base64Str });
                window.adminApi.showToast(i18next.t('admin:profile.update_success'));
                loadProfile(); // Reload to reflect changes
            } catch (err) {
                window.adminApi.showToast(err.message || i18next.t('messages:failed_avatar_upload'), 'error');
            }
        };
        reader.readAsDataURL(file);
    });
});

async function loadProfile() {
    try {
        const data = await window.adminApi.get('/admin/profile');
        if (data && data.profile) {
            const p = data.profile;
            document.getElementById('pName').value = p.name || '';
            document.getElementById('pEmail').value = p.email || '';
            document.getElementById('pRole').value = p.role || '';
            
            document.getElementById('hdrName').textContent = p.name || 'Admin';
            document.getElementById('hdrRole').textContent = p.role || 'Super Admin';
            
            const avatarImg = document.getElementById('profileAvatarDisplay');
            const avatarFallback = document.getElementById('profileAvatarFallback');
            
            if (p.profile_picture) {
                avatarImg.src = p.profile_picture;
                avatarImg.style.display = 'block';
                avatarFallback.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarFallback.style.display = 'flex';
                avatarFallback.textContent = (p.name || 'A').charAt(0).toUpperCase();
            }
            
            // Also update topbar mini avatar
            document.querySelectorAll('.user-avatar').forEach(el => {
                if (el.id !== 'profileAvatarFallback') {
                    if (p.profile_picture) {
                        el.innerHTML = `<img src="${p.profile_picture}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                    } else {
                        el.innerHTML = (p.name || 'A').charAt(0).toUpperCase();
                    }
                }
            });
        }
    } catch (e) {
        window.adminApi.showToast(i18next.t('common:error'), 'error');
    }
}

async function saveProfile() {
    const name = document.getElementById('pName').value.trim();
    const email = document.getElementById('pEmail').value.trim();
    
    if (!name || !email) {
        window.adminApi.showToast(i18next.t('validation:name_email_required'), 'error');
        return;
    }
    
    const btn = document.getElementById('btnSaveProfile');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
    
    try {
        await window.adminApi.put('/admin/profile', { name, email });
        window.adminApi.showToast(i18next.t('admin:profile.update_success'));
        loadProfile();
    } catch (e) {
        window.adminApi.showToast(e.message || i18next.t('messages:failed_profile_update'), 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check2 me-1"></i> Save Changes';
    }
}

async function savePassword() {
    const currentPassword = document.getElementById('pOldPass').value;
    const newPassword = document.getElementById('pNewPass').value;
    const confirmPassword = document.getElementById('pConfirmPass').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        window.adminApi.showToast(i18next.t('validation:all_passwords_required'), 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        window.adminApi.showToast(i18next.t('admin:profile.password_mismatch'), 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        window.adminApi.showToast(i18next.t('validation:password_min_length'), 'error');
        return;
    }
    
    const btn = document.getElementById('btnSavePassword');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';
    
    try {
        await window.adminApi.put('/admin/profile/password', { currentPassword, newPassword });
        window.adminApi.showToast(i18next.t('admin:profile.password_success'));
        
        document.getElementById('pOldPass').value = '';
        document.getElementById('pNewPass').value = '';
        document.getElementById('pConfirmPass').value = '';
    } catch (e) {
        window.adminApi.showToast(e.message || i18next.t('messages:failed_password_update'), 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-shield-lock me-1"></i> Update Password';
    }
}

window.logout = function() { window.adminApi.logout(); }
