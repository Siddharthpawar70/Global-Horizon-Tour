// Admin Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const toggleAdminPassword = document.getElementById('toggleAdminPassword');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminError = document.getElementById('adminError');

    // Toggle Password Visibility
    if (toggleAdminPassword) {
        toggleAdminPassword.addEventListener('click', function () {
            const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            adminPasswordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            adminError.style.display = 'none';

            const adminId = document.getElementById('adminId').value;
            const password = adminPasswordInput.value;

            // 1. Role-Based Login Simulation (Hardcoded)
            // Separate admin credentials as requested
            const hardcodedAdmin = {
                id: 'admin@globalhorizons.com',
                user: 'admin',
                pass: 'admin123'
            };

            const submitBtn = this.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Verifying Credentials...';

            setTimeout(() => {
                if ((adminId === hardcodedAdmin.id || adminId === hardcodedAdmin.user) && password === hardcodedAdmin.pass) {
                    // Success
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    localStorage.setItem('adminSession', JSON.stringify({
                        name: 'Super Administrator',
                        email: hardcodedAdmin.id,
                        role: 'MASTER_ACCESS',
                        loginTime: new Date().toLocaleString()
                    }));
                    window.location.href = 'admin.html';
                } else {
                    adminError.innerText = 'Invalid admin credentials';
                    adminError.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Secure Login';
                }
            }, 1000);
        });
    }
});
