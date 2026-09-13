document.addEventListener('DOMContentLoaded', () => {
    
    // Toggle Password Visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if(togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('bi-eye');
            togglePassword.classList.toggle('bi-eye-slash');
        });
    }

    // Initialize Google Login
    initGoogleLogin();

    // Regular Email/Password Login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
            showToast('Please enter your email and password.', 'error');
            return;
        }

        setLoading(submitBtn, true);

        try {
            const res = await apiPost('/auth/login', { email, password });

            if (res && res.ok) {
                localStorage.setItem('cas_user', JSON.stringify(res.data.user));
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 800);
            } else {
                showToast(res?.data?.message || 'Login failed. Please check your credentials.', 'error');
                setLoading(submitBtn, false);
            }

        } catch (err) {
            showToast('Could not connect to the server. Please try again.', 'error');
            setLoading(submitBtn, false);
        }
    });
});

// ── Google Login Logic ───────────────────────────────────────
async function initGoogleLogin() {
    try {
        const res = await apiGet('/auth/google-client-id');
        const clientId = res?.data?.clientId;
        
        const container = document.getElementById('google-btn-container');
        if (!container) return;

        if (!clientId || clientId.startsWith('YOUR_GOOGLE')) {
            container.innerHTML = `<button type="button" class="btn btn-google w-100 rounded-3 shadow-sm py-2" onclick="alert('Google Login is not configured.\\nPlease configure GOOGLE_CLIENT_ID in the backend .env file.')" style="border: 1px solid #ccc; background: white;"><i class="bi bi-google text-danger me-2"></i>Sign in with Google (Not Configured)</button>`;
            return;
        }

        window.handleGoogleLogin = async function(response) {
            const result = await apiPost('/auth/google', { token: response.credential });
            
            if (result && result.status === 202 && result.data.needs_info) {
                showToast('Account not found. Redirecting to registration...', 'info');
                setTimeout(() => window.location.href = '../register.html', 1500);
            } else if (result && result.ok) {
                showToast('Google login successful!', 'success');
                localStorage.setItem('cas_user', JSON.stringify(result.data.user));
                setTimeout(() => window.location.href = '../dashboard/dashboard.html', 1000);
            } else {
                showToast(result?.data?.message || 'Google login failed.', 'error');
            }
        };

        const renderGoogleButton = () => {
            if (typeof google === 'undefined' || !google.accounts) {
                setTimeout(renderGoogleButton, 100);
                return;
            }
            google.accounts.id.initialize({
                client_id: clientId,
                callback: window.handleGoogleLogin
            });
            
            google.accounts.id.renderButton(
                container,
                { theme: "outline", size: "large", width: container.offsetWidth || 300 }
            );
        };
        renderGoogleButton();

    } catch(err) {
        console.error("Google Auth Init Error:", err);
    }
}
