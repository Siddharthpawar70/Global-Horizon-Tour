// Destinations Page Price Sync Logic
document.addEventListener('DOMContentLoaded', () => {
    const customInventory = JSON.parse(localStorage.getItem('customInventory') || '[]');
    const sourceData = (typeof allDestinations !== 'undefined') ? allDestinations : [];

    // Helper to find data by title
    function findData(title) {
        if (!title) return null;
        // Check Admin Overrides First
        let match = customInventory.find(inv => 
            title.toLowerCase().includes(inv.name.toLowerCase()) || 
            inv.name.toLowerCase().includes(title.toLowerCase())
        );
        if (match) return match;

        // Check Hardcoded Data Second
        match = sourceData.find(d => 
            title.toLowerCase().includes(d.name.toLowerCase()) || 
            d.name.toLowerCase().includes(title.toLowerCase())
        );
        return match;
    }

    // 1. Update prices in modals (Details View)
    const priceValues = document.querySelectorAll('.sidebar-price .value');
    priceValues.forEach(val => {
        const container = val.closest('.modal-body');
        if (container) {
            const title = container.querySelector('.banner-text h1')?.innerText;
            const data = findData(title);
            if (data) {
                const symbol = data.category === 'International' ? '$' : '₹';
                val.innerText = `${symbol} ${data.price.toLocaleString()} /- `;
            }
        }
    });

    // 2. Update prices in main card grid (Gallery View)
    // Looking for tags like <span class="price"> or within h3/p if they mention price
    const cards = document.querySelectorAll('.card, .destination-card, .item');
    cards.forEach(card => {
        const title = card.querySelector('h3, h1')?.innerText;
        const data = findData(title);
        if (data) {
            // Some cards might not show price directly, but if they do, update it
            const priceEl = card.querySelector('.price, .item-price, .value');
            if (priceEl) {
                const symbol = data.category === 'International' ? '$' : '₹';
                priceEl.innerText = `${symbol} ${data.price.toLocaleString()} `;
            }
        }
    });
});
