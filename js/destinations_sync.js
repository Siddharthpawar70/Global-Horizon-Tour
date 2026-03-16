// Destinations Page Price Sync Logic
document.addEventListener('DOMContentLoaded', () => {
    const customInventory = JSON.parse(localStorage.getItem('customInventory'));

    if (customInventory && customInventory.length > 0) {
        // Update prices in modals
        const priceValues = document.querySelectorAll('.sidebar-price .value');
        priceValues.forEach(val => {
            const container = val.closest('.modal-body');
            if (container) {
                const title = container.querySelector('.banner-text h1')?.innerText;
                if (title) {
                    const match = customInventory.find(inv =>
                        title.toLowerCase().includes(inv.name.toLowerCase()) ||
                        inv.name.toLowerCase().includes(title.toLowerCase())
                    );

                    if (match) {
                        const symbol = match.category === 'International' ? '$' : '₹';
                        val.innerText = `${symbol} ${match.price.toLocaleString()} /-`;
                    }
                }
            }
        });

        // Update prices on the main card list if they exist
        const cards = document.querySelectorAll('.destination-card, .item');
        cards.forEach(card => {
            const title = card.querySelector('h3, h1')?.innerText;
            if (title) {
                const match = customInventory.find(inv =>
                    title.toLowerCase().includes(inv.name.toLowerCase()) ||
                    inv.name.toLowerCase().includes(title.toLowerCase())
                );

                if (match) {
                    // Look for price elements on the card (if any)
                    const priceEl = card.querySelector('.price, .item-price');
                    if (priceEl) {
                        const symbol = match.category === 'International' ? '$' : '₹';
                        priceEl.innerText = `${symbol} ${match.price.toLocaleString()}`;
                    }
                }
            }
        });
    }
});
