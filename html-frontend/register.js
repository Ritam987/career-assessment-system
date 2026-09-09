document.addEventListener('DOMContentLoaded', () => {

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
                // ── Admin Registration ──────────────────────────────
                // Use querySelector with name attribute (no IDs on these inputs)
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
                    setTimeout(() => { window.location.href = '/login/login.html'; }, 1500);
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

                if (!full_name) {
                    showToast('Please enter your full name.', 'error');
                    setLoading(submitBtn, false);
                    return;
                }
                if (!email) {
                    showToast('Please enter your email address.', 'error');
                    setLoading(submitBtn, false);
                    return;
                }
                if (!password || password.length < 6) {
                    showToast('Password must be at least 6 characters.', 'error');
                    setLoading(submitBtn, false);
                    return;
                }

                const payload = {
                    full_name,
                    email,
                    password,
                    phone_number:    phone_number   || null,
                    education_level: education_level || null,
                    age:             ageVal ? parseInt(ageVal) : null
                };

                res = await apiPost('/auth/register', payload);

                if (res && res.ok) {
                    showToast('Account created! Redirecting to login...', 'success');
                    setTimeout(() => { window.location.href = '/login/login.html'; }, 1500);
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
