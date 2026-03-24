/**
 * currency.js - Handles currency switching, localStorage saving, and dynamic price updating across the DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    const currencySwitcher = document.getElementById('currency-switcher');
    
    // Hardcoded conversion rates for simplicity
    const rates = {
        INR: 1,
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0094
    };

    const symbols = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£'
    };

    // Initialize currency from localStorage
    let currentCurrency = localStorage.getItem('ght_currency') || 'INR';
    
    if (currencySwitcher) {
        currencySwitcher.value = currentCurrency;
        
        // Listen for changes
        currencySwitcher.addEventListener('change', (e) => {
            currentCurrency = e.target.value;
            localStorage.setItem('ght_currency', currentCurrency);
            updatePricesOnPage();
        });
    }

    // Process all prices in the DOM
    function updatePricesOnPage() {
        const rate = rates[currentCurrency];
        const symbol = symbols[currentCurrency];
        
        // Look for elements with data-base-price or parse text content
        // We'll primarily target elements with classes .price, .price-tag, .pkg-price
        const priceElements = document.querySelectorAll('.price, .price-tag, .pkg-price, [data-price]');
        
        priceElements.forEach(el => {
            // If it doesn't have a base price yet, store the original INR price
            if (!el.hasAttribute('data-base-price')) {
                // Try to extract numbers from "₹40,000" or similar
                let text = el.textContent || '';
                let numStr = text.replace(/[^0-9.]/g, ''); // Extract only numbers
                if (numStr) {
                    el.setAttribute('data-base-price', numStr);
                } else {
                    return; // Skip if no number found
                }
            }
            
            let basePrice = parseFloat(el.getAttribute('data-base-price'));
            if (!isNaN(basePrice)) {
                let newPrice = Math.round(basePrice * rate);
                
                // Format price with commas
                let formattedStr = new Intl.NumberFormat('en-IN').format(newPrice);
                
                // Keep the text context intact if possible (e.g. "From ₹40,000 / person")
                // For simplicity, just replace the inner content if it's purely a price
                // If it contains "From", we recreate it.
                if (el.textContent.includes('From')) {
                    el.innerHTML = `From <span style="font-weight:700;">${symbol}${formattedStr}</span>`;
                } else if (el.textContent.includes('/')) {
                    el.innerText = `${symbol}${formattedStr} / person`;
                } else {
                    el.innerText = `${symbol}${formattedStr}`;
                }
            }
        });
    }

    // Run once on load to convert any static prices already in the HTML
    // Small delay to let other components render their base prices
    setTimeout(updatePricesOnPage, 500);
    
    // Expose window.updatePricesOnPage so dynamically loaded content can trigger it
    window.updatePricesOnPage = updatePricesOnPage;
});
