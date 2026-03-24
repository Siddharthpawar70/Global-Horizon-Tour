document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('You must be logged in to make a booking.');
        window.location.href = 'login.html';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const rates = window.GHTApi.currencyRates;
    const symbols = window.GHTApi.currencySymbols;
    const translations = window.GHTApi.translations;

    let currentStep = 1;
    let activeMode = 'flight';
    let selectedVehicleId = 'bc1';
    let selectedCurrency = localStorage.getItem('preferredCurrency') || 'INR';
    let selectedLanguage = localStorage.getItem('preferredLanguage') || 'en';

    const vehicleData = [
        { id: 'bc1', name: 'Standard Sedan', type: 'Car', price: 2000 },
        { id: 'suv1', name: 'Toyota Innova', type: 'Car', price: 3500 },
        { id: 'bus1', name: 'Mini Bus (12 Seater)', type: 'Bus', price: 8000 },
        { id: 'bus2', name: 'Luxury Coach', type: 'Bus', price: 15000 }
    ];

    const steps = document.querySelectorAll('.form-section');
    const indicators = document.querySelectorAll('.step-item');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const bookingForm = document.getElementById('mainBookingForm');
    const modeOptions = document.querySelectorAll('.mode-option[data-mode]');
    const modeDetailsUI = document.getElementById('mode-specific-content');
    const adultInput = document.getElementById('adult-count');
    const childInput = document.getElementById('child-count');
    const currencySelect = document.getElementById('currency-select');
    const countrySelect = document.getElementById('country-select');

    function applyLanguage() {
        const t = translations[selectedLanguage] || translations.en;
        const bookingDrop = document.querySelector('.dropbtn');
        const payLabel = document.getElementById('payment-label');
        if (bookingDrop) bookingDrop.innerHTML = `${t.bookNow} <i class="fas fa-caret-down"></i>`;
        if (payLabel) payLabel.textContent = t.paymentMethod;
        if (submitBtn) submitBtn.textContent = t.confirmBooking;
    }

    async function loadDestinations() {
        const destSelect = document.getElementById('booking-dest');
        if (!destSelect) return;
        try {
            const res = await window.GHTApi.request('packages.php');
            const dataSource = res.data || [];
            const categories = [...new Set(dataSource.map(d => d.category))];
            categories.forEach(cat => {
                const group = document.createElement('optgroup');
                group.label = cat;
                dataSource.filter(d => d.category === cat).forEach(dest => {
                    const opt = document.createElement('option');
                    opt.value = dest.name;
                    opt.dataset.priceInr = Number(dest.price_inr);
                    const cPrice = Number(dest.price_inr) * (rates[selectedCurrency] || 1);
                    opt.textContent = `${dest.name} (${symbols[selectedCurrency]} ${Math.round(cPrice).toLocaleString()})`;
                    group.appendChild(opt);
                });
                destSelect.appendChild(group);
            });
        } catch {
            alert('Unable to load destinations from backend.');
        }
    }

    function updateModeUI() {
        if (activeMode === 'flight') {
            modeDetailsUI.innerHTML = '<div class="form-group"><label>Preferred Airline</label><select class="form-control"><option>IndiGo</option><option>Air India</option><option>Emirates</option><option>Vistara</option></select></div>';
        } else if (activeMode === 'train') {
            modeDetailsUI.innerHTML = '<div class="form-group"><p style="color:#666;padding:10px;background:#eee;border-radius:8px;">We will book the best available train for your route.</p></div>';
        } else {
            modeDetailsUI.innerHTML = `<div class="form-group"><label>Select Vehicle</label><select id="vehicle-select" class="form-control">${vehicleData.map(v => `<option value="${v.id}">${v.name} (+₹${v.price})</option>`).join('')}</select></div>`;
            document.getElementById('vehicle-select').addEventListener('change', function () { selectedVehicleId = this.value; updateSummary(); });
        }
    }

    function updateSummary() {
        const destSelect = document.getElementById('booking-dest');
        const selectedDest = destSelect.options[destSelect.selectedIndex];
        const adults = parseInt(adultInput.value) || 1;
        const kids = parseInt(childInput.value) || 0;
        const baseInr = selectedDest ? Number(selectedDest.dataset.priceInr || 0) : 0;
        const totalPax = adults + kids;
        let transportInr = activeMode === 'flight' ? 5000 * totalPax : activeMode === 'train' ? 1500 * totalPax : (vehicleData.find(v => v.id === selectedVehicleId)?.price || 2000);

        const totalInr = (baseInr * adults) + (baseInr * 0.5 * kids) + transportInr;
        const total = totalInr * (rates[selectedCurrency] || 1);

        document.getElementById('sum-total').innerText = `${symbols[selectedCurrency]} ${Math.round(total).toLocaleString()}`;
        document.getElementById('sum-name').innerText = document.getElementById('cust-name').value || '-';
        document.getElementById('sum-route').innerText = destSelect.value ? `To ${destSelect.value}` : '-';
        document.getElementById('sum-date').innerText = document.getElementById('booking-date').value || '-';
        document.getElementById('sum-mode').innerText = activeMode.charAt(0).toUpperCase() + activeMode.slice(1);
        document.getElementById('sum-travelers').innerText = `${adults} Adult(s), ${kids} Child(ren)`;

        return { total, totalInr };
    }

    function renderSteps() {
        steps.forEach((s, i) => s.style.display = i === currentStep - 1 ? 'block' : 'none');
        indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentStep - 1));
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep === 3 ? 'none' : 'block';
        submitBtn.style.display = currentStep === 3 ? 'block' : 'none';
        if (currentStep === 3) updateSummary();
    }

    async function processPayment(bookingCode, amount) {
        const method = document.querySelector('input[name="pay"]:checked')?.value?.toUpperCase() || 'UPI';
        const status = method === 'CASH' ? 'pending' : 'success';
        const res = await window.GHTApi.request('payment.php', {
            method: 'POST',
            body: JSON.stringify({ booking_code: bookingCode, amount, currency_code: selectedCurrency, gateway: 'Razorpay', status })
        });
        return { ...res.payment, method };
    }

    modeOptions.forEach(opt => opt.addEventListener('click', function () {
        modeOptions.forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        activeMode = this.dataset.mode;
        updateModeUI();
        updateSummary();
    }));

    [adultInput, childInput].forEach(el => el?.addEventListener('input', updateSummary));
    document.getElementById('booking-dest')?.addEventListener('change', updateSummary);

    currencySelect?.addEventListener('change', () => {
        selectedCurrency = currencySelect.value;
        localStorage.setItem('preferredCurrency', selectedCurrency);
        window.location.reload();
    });

    countrySelect?.addEventListener('change', () => {
        const c = window.GHTApi.countrySettings[countrySelect.value] || { currency: 'INR', language: 'en' };
        selectedCurrency = c.currency;
        selectedLanguage = c.language;
        localStorage.setItem('preferredCountry', countrySelect.value);
        localStorage.setItem('preferredCurrency', c.currency);
        localStorage.setItem('preferredLanguage', c.language);
        applyLanguage();
        window.location.reload();
    });

    nextBtn?.addEventListener('click', () => { currentStep++; renderSteps(); });
    prevBtn?.addEventListener('click', () => { currentStep--; renderSteps(); });

    bookingForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        try {
            const summary = updateSummary();
            const modeDetail = activeMode === 'flight' ? (modeDetailsUI.querySelector('select')?.value || 'Any Airline') : activeMode === 'train' ? 'Best Available Train' : (vehicleData.find(v => v.id === selectedVehicleId)?.name || 'Standard Car');
            const bookingRes = await window.GHTApi.request('bookings.php', {
                method: 'POST',
                body: JSON.stringify({
                    user_email: currentUser.email,
                    customer_name: document.getElementById('cust-name').value,
                    mobile: document.getElementById('cust-phone').value,
                    destination: document.getElementById('booking-dest').value,
                    source_location: document.getElementById('booking-from').value,
                    travel_date: document.getElementById('booking-date').value,
                    travel_mode: activeMode,
                    travel_details: modeDetail,
                    travelers: (parseInt(adultInput.value) || 1) + (parseInt(childInput.value) || 0),
                    currency_code: selectedCurrency,
                    fx_rate: rates[selectedCurrency] || 1,
                    total_amount: summary.total,
                    payment_method: document.querySelector('input[name="pay"]:checked')?.value || 'upi'
                })
            });

            const payment = await processPayment(bookingRes.booking_code, summary.total);
            localStorage.setItem('latestBookingCode', bookingRes.booking_code);
            localStorage.setItem('latestPayment', JSON.stringify(payment));
            if (payment.status === 'failed') return alert('Payment failed. Please retry.');
            window.location.href = payment.status === 'pending' ? `receipt.html?booking=${bookingRes.booking_code}&pending=1` : `receipt.html?booking=${bookingRes.booking_code}`;
        } catch (error) {
            alert(`Booking failed: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        }
    });

    currencySelect && (currencySelect.value = selectedCurrency);
    const country = localStorage.getItem('preferredCountry') || 'IN';
    countrySelect && (countrySelect.value = country);

    applyLanguage();
    updateModeUI();
    renderSteps();
    loadDestinations();
});
