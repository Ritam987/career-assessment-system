const fs = require('fs');

let jsFile = 'html-frontend/admin/profile/profile.js';
let jsContent = `
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
                window.adminApi.showToast('Avatar updated successfully');
                loadProfile(); // Reload to reflect changes
            } catch (err) {
                window.adminApi.showToast(err.message || 'Failed to upload avatar', 'error');
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
                        el.innerHTML = \`<img src="\${p.profile_picture}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">\`;
                    } else {
                        el.innerHTML = (p.name || 'A').charAt(0).toUpperCase();
                    }
                }
            });
        }
    } catch (e) {
        window.adminApi.showToast('Failed to load profile', 'error');
    }
}

async function saveProfile() {
    const name = document.getElementById('pName').value.trim();
    const email = document.getElementById('pEmail').value.trim();
    
    if (!name || !email) {
        window.adminApi.showToast('Name and Email are required', 'error');
        return;
    }
    
    const btn = document.getElementById('btnSaveProfile');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
    
    try {
        await window.adminApi.put('/admin/profile', { name, email });
        window.adminApi.showToast('Profile updated successfully');
        loadProfile();
    } catch (e) {
        window.adminApi.showToast(e.message || 'Failed to update profile', 'error');
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
        window.adminApi.showToast('All password fields are required', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        window.adminApi.showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        window.adminApi.showToast('New password must be at least 8 characters', 'error');
        return;
    }
    
    const btn = document.getElementById('btnSavePassword');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';
    
    try {
        await window.adminApi.put('/admin/profile/password', { currentPassword, newPassword });
        window.adminApi.showToast('Password updated successfully');
        
        document.getElementById('pOldPass').value = '';
        document.getElementById('pNewPass').value = '';
        document.getElementById('pConfirmPass').value = '';
    } catch (e) {
        window.adminApi.showToast(e.message || 'Failed to update password', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-shield-lock me-1"></i> Update Password';
    }
}

window.logout = function() { window.adminApi.logout(); }
`;

fs.writeFileSync(jsFile, jsContent);
console.log("Wrote profile.js");
