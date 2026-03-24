document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = this.querySelector('input[type="email"]').value.trim();
        const password = this.querySelector('input[type="password"]').value;
        const submitBtn = this.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.innerText = 'Authenticating...';

        try {
            const res = await window.GHTApi.request('login.php', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            const user = res.user;
            if (user.status === 'pending') throw new Error('Your account is pending admin approval.');
            if (user.status === 'blocked') throw new Error('Your account has been blocked.');

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('preferredLanguage', user.language_code || 'en');
            alert(`Welcome back, ${user.name}!`);
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message || 'Invalid email or password.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Login to Account';
        }
    });
});
