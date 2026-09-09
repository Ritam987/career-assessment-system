// =============================================================
// profile.js — My Profile page
// Exact HTML IDs:
//   #headerName (topbar chip)
//   #profileName, #profileEmail, #profileJoined (avatar card)
//   #dispName, #dispEmail, #dispAge, #dispField, #dispGoal (display)
//   #editName, #editEmail, #editAge, #editField, #editGoal (edit inputs)
//   #saveRow (save/cancel row)
//   Logout anchor: .logout-btn
// Note: #dispField = education_level,  #dispGoal = not in DB
//       #editField = info-input for edu, #editGoal not saved to DB
// =============================================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}
function changeLanguage(lang) { localStorage.setItem('cas_lang', lang); }
async function logoutUser() {
    await apiPost('/auth/logout');
    localStorage.removeItem('cas_user');
    window.location.href = '/login/login.html';
}

// ── Show profile photo in avatar circle ───────────────────────
function showProfilePhoto(url) {
    const img  = document.getElementById('avatarImg');
    const icon = document.getElementById('avatarIcon');
    if (!img) return;
    if (url) {
        img.src          = url;
        img.style.display = 'block';
        if (icon) icon.style.display = 'none';
    } else {
        img.style.display  = 'none';
        if (icon) icon.style.display = '';
    }
}

// ── Handle camera button → file selected ─────────────────────
async function handlePhotoSelect(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // Show instant preview before upload
    const reader = new FileReader();
    reader.onload = (e) => showProfilePhoto(e.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    const camBtn = document.querySelector('.camera-btn');
    if (camBtn) { camBtn.disabled = true; camBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>'; }

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await fetch('/api/auth/profile/photo', {
            method: 'POST',
            credentials: 'include',
            body: formData  // NO Content-Type header — browser sets multipart boundary
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Profile photo updated!', 'success');
            showProfilePhoto(data.photoUrl);
            // Update cached user
            const cached = getCachedUser();
            if (cached) { cached.profile_picture = data.photoUrl; localStorage.setItem('cas_user', JSON.stringify(cached)); }
        } else {
            showToast(data.message || 'Upload failed.', 'error');
        }
    } catch (err) {
        showToast('Upload failed. Check connection.', 'error');
    } finally {
        if (camBtn) { camBtn.disabled = false; camBtn.innerHTML = '<i class="bi bi-camera-fill"></i>'; }
        input.value = ''; // Reset so same file can be re-selected
    }
}


// Wire the logout button (it's an <a> tag — intercept it)
document.addEventListener('DOMContentLoaded', async () => {

    // Intercept logout anchor
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logoutUser();
        });
    }

    // ── 1. Auth guard ────────────────────────────────────────
    const user = await requireAuth();
    if (!user) return;

    // ── 2. Populate all fields ───────────────────────────────
    populateProfile(user);
});

// ─────────────────────────────────────────────────────────────
// Populate all display + edit fields from user object
// ─────────────────────────────────────────────────────────────
function populateProfile(user) {
    // Topbar chip
    const headerNameEl = document.getElementById('headerName');
    if (headerNameEl) headerNameEl.textContent = user.full_name || 'User';

    // Show existing profile photo (or default icon)
    showProfilePhoto(user.profile_picture || null);

    // Avatar card
    const profileNameEl   = document.getElementById('profileName');
    const profileEmailEl  = document.getElementById('profileEmail');
    const profileJoinedEl = document.getElementById('profileJoined');
    if (profileNameEl)  profileNameEl.textContent  = user.full_name || '—';
    if (profileEmailEl) profileEmailEl.textContent = user.email     || '—';
    if (profileJoinedEl && user.created_at) {
        const joined = new Date(user.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        profileJoinedEl.textContent = `Joined on ${joined}`;
    }

    // Display spans
    setText('dispName',  user.full_name       || '—');
    setText('dispEmail', user.email            || '—');
    setText('dispAge',   user.age              || '—');
    setText('dispField', user.education_level  || '—');  // education_level shown as Preferred Field
    setText('dispGoal',  user.phone_number     || '—');  // phone shown in Career Goal slot

    // Edit inputs (pre-filled)
    setVal('editName',  user.full_name      || '');
    setVal('editEmail', user.email          || '');
    setVal('editAge',   user.age            || '');
    setVal('editField', user.education_level || '');
    setVal('editGoal',  user.phone_number   || '');   // phone in editGoal slot
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setVal(id, val)  { const el = document.getElementById(id); if (el) el.value = val; }

// ─────────────────────────────────────────────────────────────
// Toggle edit mode
// ─────────────────────────────────────────────────────────────
function toggleEdit() {
    // Hide display spans, show edit inputs
    ['dispName','dispEmail','dispAge','dispField','dispGoal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });
    ['editName','editEmail','editAge','editField','editGoal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('d-none');
    });
    const saveRow = document.getElementById('saveRow');
    if (saveRow) saveRow.classList.remove('d-none');
}

// ─────────────────────────────────────────────────────────────
// Cancel edit
// ─────────────────────────────────────────────────────────────
function cancelEdit() {
    ['dispName','dispEmail','dispAge','dispField','dispGoal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('d-none');
    });
    ['editName','editEmail','editAge','editField','editGoal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });
    const saveRow = document.getElementById('saveRow');
    if (saveRow) saveRow.classList.add('d-none');
}

// ─────────────────────────────────────────────────────────────
// Save profile changes
// ─────────────────────────────────────────────────────────────
async function saveProfile() {
    const full_name       = document.getElementById('editName')?.value.trim();
    const education_level = document.getElementById('editField')?.value.trim();
    const phone_number    = document.getElementById('editGoal')?.value.trim();
    const age             = document.getElementById('editAge')?.value;

    if (!full_name) {
        showToast('Full name cannot be empty.', 'error');
        return;
    }

    const saveBtn = document.querySelector('#saveRow .save-btn');
    if (saveBtn) setLoading(saveBtn, true);

    const res = await apiPut('/auth/profile', {
        full_name,
        education_level: education_level || null,
        phone_number:    phone_number    || null,
        age:             age ? parseInt(age) : null
    });

    if (res && res.ok) {
        // Re-fetch from server to get fresh data
        const profileRes = await apiGet('/auth/profile');
        if (profileRes && profileRes.ok) {
            localStorage.setItem('cas_user', JSON.stringify(profileRes.data.user));
            populateProfile(profileRes.data.user);
        }
        cancelEdit();
        showToast('Profile updated successfully!', 'success');
    } else {
        showToast(res?.data?.message || 'Failed to update profile.', 'error');
    }

    if (saveBtn) setLoading(saveBtn, false);
}
