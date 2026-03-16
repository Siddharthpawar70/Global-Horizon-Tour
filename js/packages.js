// Packages Page Dynamic Logic
document.addEventListener('DOMContentLoaded', () => {
    // Sync prices from custom inventory (admin changes)
    const customInventory = JSON.parse(localStorage.getItem('customInventory'));

    if (customInventory && customInventory.length > 0) {
        const packageItems = document.querySelectorAll('.package-item');

        packageItems.forEach(item => {
            const packageName = item.querySelector('h2').innerText;
            // Find match in inventory (ignoring minor suffix differences if any)
            const match = customInventory.find(inv => packageName.includes(inv.name) || inv.name.includes(packageName));

            if (match) {
                const priceValueEl = item.querySelector('.price-value');
                if (priceValueEl) {
                    const priceSymbol = match.category === 'International' ? '$' : '₹';
                    // Extract original suffix (e.g. " / Couple", " / Person")
                    const originalText = priceValueEl.innerText;
                    const suffix = originalText.includes('/') ? ' / ' + originalText.split('/')[1].trim() : '';

                    priceValueEl.innerText = `${priceSymbol} ${match.price.toLocaleString()}${suffix}`;
                }
            }
        });
    }

    // Customization Form Toggle (Existing feature usually has this)
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
