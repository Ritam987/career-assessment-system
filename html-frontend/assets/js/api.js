/**
 * api.js — Shared API utility for all user-side pages
 * Include this before any page-specific JS:
 *   <script src="/assets/js/api.js"></script>
 */

const API = '/api';

// ── Core fetch wrapper ─────────────────────────────────────────
async function apiFetch(method, endpoint, body = null) {
    const options = {
        method,
        credentials: 'include',   // sends the JWT cookie automatically
        headers: {}
    };
    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    const res = await fetch(API + endpoint, options);
    const data = await res.json().catch(() => ({}));

    // Auto-redirect to login if session expired
    if (res.status === 401) {
        localStorage.removeItem('cas_user');
        window.location.href = '/login/login.html';
        return;
    }
    return { ok: res.ok, status: res.status, data };
}

const apiGet  = (endpoint)        => apiFetch('GET',  endpoint);
const apiPost = (endpoint, body)  => apiFetch('POST', endpoint, body);
const apiPut  = (endpoint, body)  => apiFetch('PUT',  endpoint, body);

// ── Auth guard: run on protected pages ────────────────────────
async function requireAuth() {
    const res = await apiGet('/auth/profile');
    if (!res || !res.ok) {
        localStorage.removeItem('cas_user');
        window.location.href = '/login/login.html';
        return null;
    }
    // Cache user info locally for quick display
    localStorage.setItem('cas_user', JSON.stringify(res.data.user));
    return res.data.user;
}

// ── Get cached user (from localStorage) ───────────────────────
function getCachedUser() {
    try { return JSON.parse(localStorage.getItem('cas_user') || 'null'); }
    catch (e) { return null; }
}

// ── Toast notification ─────────────────────────────────────────
function showToast(message, type = 'success') {
    // Remove existing toast
    document.querySelectorAll('.cas-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'cas-toast';
    toast.style.cssText = `
        position:fixed; top:20px; right:20px; z-index:9999;
        padding:14px 20px; border-radius:10px; font-size:14px;
        font-weight:500; max-width:340px; box-shadow:0 4px 20px rgba(0,0,0,0.15);
        animation: slideIn .3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = '@keyframes slideIn { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }';
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ── Button loading state ───────────────────────────────────────
function setLoading(btn, loading, originalText) {
    if (loading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Please wait...';
    } else {
        btn.disabled = false;
        btn.innerHTML = originalText || btn.dataset.originalText || 'Submit';
    }
}
