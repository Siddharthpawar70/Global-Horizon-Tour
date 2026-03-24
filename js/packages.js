document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await window.GHTApi.request('packages.php');
        const inventory = res.data || [];
        document.querySelectorAll('.package-item').forEach(item => {
            const packageName = item.querySelector('h2')?.innerText || '';
            const match = inventory.find(inv => packageName.includes(inv.name) || inv.name.includes(packageName));
            if (match) {
                const el = item.querySelector('.price-value');
                if (el) {
                    const suffix = el.innerText.includes('/') ? ` / ${el.innerText.split('/')[1].trim()}` : '';
                    el.innerText = `₹ ${Number(match.price_inr).toLocaleString()}${suffix}`;
                }
            }
        });
    } catch {
        // Keep static prices if backend unavailable
    }

    const customBtn = document.getElementById('show-custom-btn');
    const customForm = document.getElementById('custom-plan-form');
    if (customBtn && customForm) {
        customBtn.addEventListener('click', () => {
            const isVisible = customForm.style.display === 'block';
            customForm.style.display = isVisible ? 'none' : 'block';
            customBtn.innerText = isVisible ? 'Plan My Custom Trip' : 'Close Customizer';
        });
    }
});
