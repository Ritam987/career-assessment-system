/**
 * admin-api.js — Admin API wrapper
 * MUST be loaded before any page-specific admin JS.
 * Automatically sends admin_token cookie via credentials:'include'
 */

const API_BASE = '/api';
const ADMIN_LOGIN_URL = '/login/login.html';

async function adminFetch(endpoint, options = {}) {
    try {
        const res = await fetch(API_BASE + endpoint, {
            ...options,
            credentials: 'include',   // <-- critical: sends admin_token cookie
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                ...options.headers
            }
        });

        // Session expired or not an admin
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('cas_admin');
            window.location.href = ADMIN_LOGIN_URL + '?expired=1';
            return null;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        showAdminToast(error.message || 'Network error', 'error');
        throw error;
    }
}

// Convenience wrappers
const adminGet    = (ep)       => adminFetch(ep, { method: 'GET' });
const adminPost   = (ep, body) => adminFetch(ep, { method: 'POST',  body: JSON.stringify(body) });
const adminPut    = (ep, body) => adminFetch(ep, { method: 'PUT',   body: JSON.stringify(body) });
const adminPatch  = (ep, body) => adminFetch(ep, { method: 'PATCH', body: JSON.stringify(body) });
const adminDelete = (ep)       => adminFetch(ep, { method: 'DELETE' });

// Auth guard – call on every protected admin page
async function requireAdminAuth() {
    const data = await adminGet('/admin/profile');
    if (!data) return null; // redirect already triggered
    const admin = data.admin;
    localStorage.setItem('cas_admin', JSON.stringify(admin));
    return admin;
}

function getCachedAdmin() {
    try { return JSON.parse(localStorage.getItem('cas_admin') || 'null'); }
    catch(e) { return null; }
}

// Logout
async function logoutAdmin() {
    try { await adminPost('/admin/logout', {}); } catch(e) {}
    localStorage.removeItem('cas_admin');
    window.location.href = ADMIN_LOGIN_URL;
}

// Toast
function showAdminToast(message, type = 'success') {
    document.querySelectorAll('.admin-toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.style.cssText =
        'position:fixed;top:20px;right:20px;z-index:99999;' +
        'padding:12px 22px;border-radius:8px;font-size:14px;font-weight:500;' +
        'max-width:340px;box-shadow:0 4px 16px rgba(0,0,0,0.15);color:#fff;' +
        'background:' + (type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981') + ';' +
        'animation:slideIn .3s ease;';
    toast.textContent = message;
    const style = document.createElement('style');
    style.textContent = '@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Expose on window
window.adminApi = {
    fetch:          adminFetch,
    get:            adminGet,
    post:           adminPost,
    put:            adminPut,
    patch:          adminPatch,
    delete:         adminDelete,
    requireAuth:    requireAdminAuth,
    getCachedAdmin: getCachedAdmin,
    logout:         logoutAdmin,
    showToast:      showAdminToast
};
