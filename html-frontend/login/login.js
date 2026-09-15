/**
 * login.js - Handles student and admin login + Google auth
 */

document.addEventListener('DOMContentLoaded', () => {
    // Show expired message if redirected here
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired')) {
        showToast('Session expired. Please log in again.', 'error');
    }

    initGoogleLogin();

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const isAdmin  = document.getElementById('roleAdmin').checked;
        const btn      = document.getElementById('loginBtn');

        if (!email || !password) {
            showToast('Please enter your email and password.', 'error');
            return;
        }

        setLoading(btn, true);
        try {
            const endpoint = isAdmin ? '/admin/login' : '/auth/login';
            const res = await apiFetch('POST', endpoint, { email, password });

            if (res && res.ok) {
                if (isAdmin) {
                    localStorage.setItem('cas_admin', JSON.stringify(res.data.admin));
                    showToast('Admin login successful! Redirecting...', 'success');
                    setTimeout(() => { window.location.href = '/admin/dashboard/dashboard.html'; }, 800);
                } else {
                    localStorage.setItem('cas_user', JSON.stringify(res.data.user));
                    showToast('Login successful! Redirecting...', 'success');
                    setTimeout(() => { window.location.href = '/dashboard/dashboard.html'; }, 800);
                }
            } else {
                showToast(res && res.data && res.data.message ? res.data.message : 'Login failed. Please check your credentials.', 'error');
                setLoading(btn, false);
            }
        } catch (err) {
            showToast('Could not connect to the server.', 'error');
            setLoading(btn, false);
        }
    });
});

// ── Google Login ──────────────────────────────────────────────
async function initGoogleLogin() {
    const container = document.getElementById('google-btn-container');
    if (!container) return;

    try {
        const res = await apiFetch('GET', '/auth/google-client-id');
        const clientId = res && res.data && res.data.clientId;

        if (!clientId || clientId.startsWith('YOUR_GOOGLE')) {
            container.innerHTML = '';
            return;
        }

        window.handleGoogleLogin = async function(response) {
            const isAdmin = document.getElementById('roleAdmin').checked;
            // Admin Google login goes to /admin/google; student goes to /auth/google
            const endpoint = isAdmin ? '/admin/google' : '/auth/google';
            const result = await apiFetch('POST', endpoint, { token: response.credential });

            if (!result) return; // redirect already happened

            if (result.status === 202 && result.data && result.data.needs_info) {
                // Student needs extra info — only relevant for student path
                showToast('Account not found. Redirecting to registration...', 'info');
                setTimeout(() => { window.location.href = '/register.html'; }, 1500);
                return;
            }

            if (result.ok) {
                if (isAdmin) {
                    localStorage.setItem('cas_admin', JSON.stringify(result.data.admin));
                    showToast('Admin Google login successful!', 'success');
                    setTimeout(() => { window.location.href = '/admin/dashboard/dashboard.html'; }, 800);
                } else {
                    localStorage.setItem('cas_user', JSON.stringify(result.data.user));
                    showToast('Google login successful!', 'success');
                    setTimeout(() => { window.location.href = '/dashboard/dashboard.html'; }, 800);
                }
            } else {
                const msg = result.data && result.data.message ? result.data.message : 'Google login failed.';
                showToast(msg, 'error');
            }
        };

        const render = () => {
            if (typeof google === 'undefined' || !google.accounts) {
                setTimeout(render, 200);
                return;
            }
            google.accounts.id.initialize({ client_id: clientId, callback: window.handleGoogleLogin });
            google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: container.offsetWidth || 300 });
        };
        render();

    } catch(err) {
        console.error('Google init error:', err);
    }
}
