// Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;

            // 2. Auth Simulation
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Authenticating...';

            setTimeout(() => {
                if (user) {
                    if (user.status === 'pending') {
                        alert('Your account is pending admin approval. Please wait for the administrator to approve your access.');
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'Login to Account';
                    } else if (user.status === 'blocked') {
                        alert('Your account has been blocked. Contact support for more info.');
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'Login to Account';
                    } else {
                        // Success
                        alert(`Welcome back, ${user.name}!`);
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        window.location.href = 'index.html';
                    }
                } else {
                    alert('Invalid email or password. Please try again.');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Login to Account';
                }
            }, 1000);
        });
    }
});
