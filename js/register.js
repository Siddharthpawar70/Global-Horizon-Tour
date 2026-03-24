document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const name = this.querySelector('input[placeholder="John Doe"]').value.trim();
        const email = this.querySelector('input[type="email"]').value.trim();
        const password = this.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
        const terms = document.getElementById('terms');
        const countryCode = document.getElementById('country-select')?.value || 'IN';

        if (password !== confirmPassword) return alert('Passwords do not match!');
        if (!terms.checked) return alert('You must agree to the Terms of Service.');

        const settings = window.GHTApi.countrySettings[countryCode] || { currency: 'INR', language: 'en' };

        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating Account...';

        try {
            const res = await window.GHTApi.request('register.php', {
                method: 'POST',
                body: JSON.stringify({ name, email, password, countryCode, languageCode: settings.language })
            });
            localStorage.setItem('preferredCountry', countryCode);
            localStorage.setItem('preferredCurrency', settings.currency);
            localStorage.setItem('preferredLanguage', settings.language);
            alert(`${res.message}. You can now login.`);
            window.location.href = 'login.html';
        } catch (error) {
            alert(`Registration failed: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.innerText = 'Create My Account';
        }
    });
});
