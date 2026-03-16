// Registration Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = this.querySelector('input[placeholder="John Doe"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelectorAll('input[type="password"]')[0].value;
            const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
            const terms = document.getElementById('terms');

            // 1. Basic Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match! Please try again.');
                return;
            }

            if (!terms.checked) {
                alert('You must agree to the Terms of Service.');
                return;
            }

            // 2. Registration Simulation
            const newUser = {
                name: name,
                email: email,
                password: password,
                status: 'pending', // Requires admin approval
                registeredAt: new Date().toLocaleString()
            };

            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

            // Check if user already exists
            if (users.find(u => u.email === email)) {
                alert('An account with this email already exists.');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Create My Account';
                return;
            }

            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));

            // UI Feedback
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Creating Account...';

            setTimeout(() => {
                alert(`Registration successful! Your account for ${email} is pending admin approval. You will be able to login once approved.`);

                // Track registration count for Dashboard
                const currentCount = parseInt(localStorage.getItem('registrationCount') || '0');
                localStorage.setItem('registrationCount', currentCount + 1);

                window.location.href = 'login.html';
            }, 1200);
        });
    }

    // Password strength indicator (Visual enhancement)
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            if (this.value.length > 0 && this.value.length < 6) {
                this.style.borderColor = '#e74c3c'; // Weak
            } else if (this.value.length >= 6) {
                this.style.borderColor = '#2ecc71'; // Good
            } else {
                this.style.borderColor = '';
            }
        });
    }
});
