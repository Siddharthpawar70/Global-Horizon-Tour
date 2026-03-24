window.GHTApi = (() => {
    const BASE = 'backend/api';

    async function request(path, options = {}) {
        const response = await fetch(`${BASE}/${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        let data = {};
        try {
            data = await response.json();
        } catch (_) {
            data = { success: false, message: 'Invalid JSON response from server' };
        }
        if (!response.ok || data.success === false) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    return {
        request,
        currencyRates: {
            INR: 1,
            USD: 0.012,
            EUR: 0.011,
            GBP: 0.0095
        },
        currencySymbols: {
            INR: '₹',
            USD: '$',
            EUR: '€',
            GBP: '£'
        },
        countrySettings: {
            IN: { currency: 'INR', language: 'en' },
            US: { currency: 'USD', language: 'en' },
            FR: { currency: 'EUR', language: 'fr' },
            DE: { currency: 'EUR', language: 'de' },
            GB: { currency: 'GBP', language: 'en' },
            ES: { currency: 'EUR', language: 'es' }
        },
        translations: {
            en: { bookNow: 'Book now', paymentMethod: 'Payment Method', confirmBooking: 'Confirm Booking' },
            fr: { bookNow: 'Réserver', paymentMethod: 'Méthode de paiement', confirmBooking: 'Confirmer la réservation' },
            de: { bookNow: 'Jetzt buchen', paymentMethod: 'Zahlungsmethode', confirmBooking: 'Buchung bestätigen' },
            es: { bookNow: 'Reservar ahora', paymentMethod: 'Método de pago', confirmBooking: 'Confirmar reserva' }
        }
    };
})();
