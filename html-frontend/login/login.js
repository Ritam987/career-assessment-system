document.addEventListener('DOMContentLoaded', () => {

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

            if (res.ok) {
                // Cache user info for quick display on dashboard
                localStorage.setItem('cas_user', JSON.stringify(res.data.user));
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard/dashboard.html';
                }, 800);
            } else {
                showToast(res.data.message || 'Login failed. Please check your credentials.', 'error');
                setLoading(submitBtn, false);
            }

        } catch (err) {
            showToast('Could not connect to the server. Please try again.', 'error');
            setLoading(submitBtn, false);
        }
    });
});
