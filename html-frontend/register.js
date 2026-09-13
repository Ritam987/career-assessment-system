let pendingGoogleToken = null;

document.addEventListener('DOMContentLoaded', () => {
    
    initGoogleLogin(); // Initialize Google Sign-In

    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isAdmin   = document.getElementById('roleAdmin')?.checked;
        const submitBtn = form.querySelector('button[type="submit"]');

        setLoading(submitBtn, true);

        try {
            let res;

            if (isAdmin) {
                // ... Admin untouched ...
                const name       = form.querySelector('[name="full_name"]')?.value.trim();
                const email      = form.querySelector('[name="email"]')?.value.trim();
                const password   = form.querySelector('[name="password"]')?.value;
                const company_id = document.getElementById('companyInput')?.value.trim();

                if (!name || !email || !password) {
                    showToast('Please fill in your name, email, and password.', 'error');
                    setLoading(submitBtn, false);
                    return;
                }
                if (!company_id) {
                    showToast('Company ID is required for admin registration.', 'error');
                    setLoading(submitBtn, false);
                    return;
                }

                res = await apiPost('/admin/register', { name, email, password, company_id });

                if (res && res.ok) {
                    showToast('Admin account created! Redirecting to login...', 'success');
                    setTimeout(() => { window.location.href = 'login/login.html'; }, 1500);
                } else {
                    showToast(res?.data?.message || 'Admin registration failed.', 'error');
                    setLoading(submitBtn, false);
                }

            } else {
                // ── Student Registration ────────────────────────────
                const full_name       = form.querySelector('[name="full_name"]')?.value.trim();
                const email           = form.querySelector('[name="email"]')?.value.trim();
                const password        = form.querySelector('[name="password"]')?.value;
                const phone_number    = document.getElementById('phoneInput')?.value.trim()  || '';
                const education_level = document.getElementById('eduInput')?.value            || '';
                const ageVal          = document.getElementById('ageInput')?.value            || '';

                if (!education_level) {
                    showToast('Please select your education level.', 'error');
                    setLoading(submitBtn, false);
                    return;
                }

                // If Google Registration
                if (pendingGoogleToken) {
                    res = await apiPost('/auth/google-register', {
                        token: pendingGoogleToken,
                        education_level,
                        phone_number: phone_number || null,
                        age: ageVal ? parseInt(ageVal) : null
                    });
                } else {
                    // Normal Registration
                    if (!full_name || !email) {
                        showToast('Please enter your full name and email.', 'error');
                        setLoading(submitBtn, false);
                        return;
                    }
                    if (!password || password.length < 6) {
                        showToast('Password must be at least 6 characters.', 'error');
                        setLoading(submitBtn, false);
                        return;
                    }

                    res = await apiPost('/auth/register', {
                        full_name, email, password,
                        phone_number: phone_number || null,
                        education_level: education_level || null,
                        age: ageVal ? parseInt(ageVal) : null
                    });
                }

                if (res && res.ok) {
                    showToast('Account created! Redirecting...', 'success');
                    if (pendingGoogleToken) {
                        localStorage.setItem('cas_user', JSON.stringify(res.data.user));
                        setTimeout(() => window.location.href = 'dashboard/dashboard.html', 1500);
                    } else {
                        setTimeout(() => window.location.href = 'login/login.html', 1500);
                    }
                } else {
                    showToast(res?.data?.message || 'Registration failed. Please try again.', 'error');
                    setLoading(submitBtn, false);
                }
            }

        } catch (err) {
            console.error('Register error:', err);
            showToast('Could not connect to server. Is the backend running?', 'error');
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
                // Populate the form and ask for missing details
                const nameInput = document.querySelector('[name="full_name"]');
                const emailInput = document.querySelector('[name="email"]');
                const pwdGroup = document.getElementById('passwordCol');
                
                if(nameInput) { nameInput.value = result.data.google_info.name; nameInput.readOnly = true; }
                if(emailInput) { emailInput.value = result.data.google_info.email; emailInput.readOnly = true; }
                if(pwdGroup) { pwdGroup.style.display = 'none'; } // Hide password since they use Google
                
                // Set the hidden required inputs to be optional since they use Google
                const pwdInput = document.getElementById('pwd');
                if(pwdInput) pwdInput.removeAttribute('required');
                
                // Hide the Google button container so they don't click it again
                container.style.display = 'none';
                const divLine = document.querySelector('.reg-divider');
                if (divLine) divLine.style.display = 'none';

                pendingGoogleToken = response.credential;
                showToast('Google linked! Please enter your Education Level below to finish.', 'info');
                document.getElementById('eduInput')?.focus();

            } else if (result && result.ok) {
                // If they already existed, they are now logged in!
                showToast('Google login successful!', 'success');
                localStorage.setItem('cas_user', JSON.stringify(result.data.user));
                setTimeout(() => window.location.href = 'dashboard/dashboard.html', 1000);
            } else {
                showToast(result?.data?.message || 'Google login failed.', 'error');
            }
        };

        const renderGoogleButton = () => {
            if (typeof google === 'undefined' || !google.accounts) {
                setTimeout(renderGoogleButton, 100); // Retry if not loaded
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
