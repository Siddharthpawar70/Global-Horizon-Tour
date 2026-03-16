document.addEventListener('DOMContentLoaded', () => {
    // Stage 0: Auth Check
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('You must be logged in to make a booking.');
        window.location.href = 'login.html';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Stage 1: Populate Destinations
    const destSelect = document.getElementById('booking-dest');
    if (destSelect) {
        // Fetch from custom inventory (admin changes) or fallback to hardcoded data
        const customInventory = JSON.parse(localStorage.getItem('customInventory'));
        const dataSource = (customInventory && customInventory.length > 0) ? customInventory : (typeof allDestinations !== 'undefined' ? allDestinations : []);

        if (dataSource.length > 0) {
            const categories = [...new Set(dataSource.map(d => d.category))];
            categories.forEach(cat => {
                const group = document.createElement('optgroup');
                group.label = cat === 'India' ? 'Explore India' : (cat === 'International' ? 'International Getaways' : 'Exclusive Packages');
                const filtered = dataSource.filter(d => d.category === cat);
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                filtered.forEach(dest => {
                    const opt = document.createElement('option');
                    opt.value = dest.name;
                    opt.dataset.price = dest.price;
                    const priceSymbol = dest.category === 'International' ? '$' : '₹';
                    opt.textContent = `${dest.name} (${priceSymbol} ${dest.price.toLocaleString()}/-)`;
                    group.appendChild(opt);
                });
                destSelect.appendChild(group);
            });
        }
    }

    // Stage 2: Constants and State
    let currentStep = 1;
    let activeMode = 'flight';
    let selectedVehicleId = 'bc1';

    const vehicleData = [
        { id: 'bc1', name: 'Standard Sedan', type: 'Car', price: 2000 },
        { id: 'suv1', name: 'Toyota Innova', type: 'Car', price: 3500 },
        { id: 'bus1', name: 'Mini Bus (12 Seater)', type: 'Bus', price: 8000 },
        { id: 'bus2', name: 'Luxury Coach', type: 'Bus', price: 15000 }
    ];

    // UI Elements
    const steps = document.querySelectorAll('.form-section');
    const indicators = document.querySelectorAll('.step-item');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const bookingForm = document.getElementById('mainBookingForm');
    const modeOptions = document.querySelectorAll('.mode-option');
    const modeDetailsUI = document.getElementById('mode-details-ui');
    const adultInput = document.getElementById('adult-count');
    const childInput = document.getElementById('child-count');

    function updateModeUI() {
        if (activeMode === 'flight') {
            let html = `
            <div class="grid" style="grid-template-columns: 1fr;">
                 <div class="form-group">
                    <label>Preferred Airline</label>
                    <select class="form-control">
                        <option>IndiGo</option>
                        <option>Air India</option>
                        <option>Emirates</option>
                        <option>Vistara</option>
                    </select>
                 </div>
            </div>`;
            modeDetailsUI.innerHTML = html;
        } else if (activeMode === 'train') {
            modeDetailsUI.innerHTML = `<div class="form-group"><p style="color: #666; padding: 10px; background: #eee; border-radius: 8px;">We will automatically book the best available train for your route.</p></div>`;
        } else if (activeMode === 'car') {
            let html = `
            <div class="form-group">
                <label>Select Vehicle</label>
                <select id="vehicle-select" class="form-control">`;
            vehicleData.forEach(v => {
                html += `<option value="${v.id}" ${selectedVehicleId === v.id ? 'selected' : ''}>${v.name} (+₹${v.price})</option>`;
            });
            html += `</select></div>`;
            modeDetailsUI.innerHTML = html;

            const vSelect = document.getElementById('vehicle-select');
            if (vSelect) {
                vSelect.addEventListener('change', function () {
                    selectedVehicleId = this.value;
                    updateSummary(); // Update summary if vehicle changes
                });
            }
        }
    }

    function updateSummary() {
        const name = document.getElementById('cust-name') ? document.getElementById('cust-name').value : '-';
        const destSelect = document.getElementById('booking-dest');
        const selectedDest = destSelect.options[destSelect.selectedIndex];
        const date = document.getElementById('booking-date').value;
        const adults = parseInt(adultInput.value) || 1;
        const kids = parseInt(childInput.value) || 0;
        const totalPax = adults + kids;

        // Price Calculation (Dummy/Estimated)
        const basePrice = selectedDest && selectedDest.dataset.price ? parseInt(selectedDest.dataset.price) : 0;
        let transportCost = 0;

        if (activeMode === 'flight') transportCost = 5000 * totalPax;
        else if (activeMode === 'train') transportCost = 1500 * totalPax;
        else if (activeMode === 'car') {
            const v = vehicleData.find(v => v.id === selectedVehicleId);
            transportCost = v ? v.price : 2000;
        }

        // Basic Math
        const totalCost = (basePrice * adults) + (basePrice * 0.5 * kids) + transportCost;

        // Update UI
        if (document.getElementById('sum-name')) document.getElementById('sum-name').innerText = name || '-';
        if (document.getElementById('sum-route')) document.getElementById('sum-route').innerText = destSelect.value ? `To ${destSelect.value}` : '-';
        if (document.getElementById('sum-date')) document.getElementById('sum-date').innerText = date || '-';
        if (document.getElementById('sum-mode')) document.getElementById('sum-mode').innerText = activeMode.charAt(0).toUpperCase() + activeMode.slice(1);
        if (document.getElementById('sum-travelers')) document.getElementById('sum-travelers').innerText = `${adults} Adult(s), ${kids} Child(ren)`;
        if (document.getElementById('sum-total')) document.getElementById('sum-total').innerText = '₹ ' + totalCost.toLocaleString();

        return { total: totalCost };
    }

    function renderSteps() {
        if (!steps || steps.length === 0) return;

        steps.forEach((s, i) => {
            if (i === currentStep - 1) {
                s.style.display = 'block';
                s.classList.add('active');
            } else {
                s.style.display = 'none';
                s.classList.remove('active');
            }
        });

        indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentStep - 1));

        if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'block' : 'none';

        if (currentStep === 3) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'block';
            updateSummary(); // Update summary when reaching step 3
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    // Event Listeners
    modeOptions.forEach(opt => {
        opt.addEventListener('click', function () {
            if (this.querySelector('input')) return; // Ignore clicks on radio buttons in step 3
            if (currentStep === 3) return; // Don't switch mode in step 3 via visual clicks unless intended (design is distinct)

            modeOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            activeMode = this.dataset.mode;
            updateModeUI();
        });
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (currentStep === 1) {
            if (!document.getElementById('cust-name').value || !document.getElementById('cust-phone').value) {
                alert('Please fill in your name and mobile number.');
                return;
            }
        }
        if (currentStep === 2) {
            if (!document.getElementById('booking-from').value || !document.getElementById('booking-dest').value || !document.getElementById('booking-date').value) {
                alert('Please provide all trip details.');
                return;
            }
        }
        currentStep++;
        renderSteps();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        currentStep--;
        renderSteps();
    });

    if (bookingForm) bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const summary = updateSummary();
        const bookingID = 'GHT' + Math.floor(Math.random() * 99999 + 10000);

        // Capture specific mode details
        let specificDetails = '';
        if (activeMode === 'flight') {
            const airlineSelect = modeDetailsUI.querySelector('select'); // The first select is airline
            specificDetails = airlineSelect ? airlineSelect.value : 'Any Airline';
        } else if (activeMode === 'car') {
            const v = vehicleData.find(v => v.id === selectedVehicleId);
            specificDetails = v ? v.name : 'Standard Car';
        } else if (activeMode === 'train') {
            specificDetails = 'Best Available Train';
        }

        // Capture Payment Method
        let paymentMethod = 'UPI';
        const checkedPay = document.querySelector('input[name="pay"]:checked');
        if (checkedPay) paymentMethod = checkedPay.value.toUpperCase();

        const bookingData = {
            id: bookingID,
            name: document.getElementById('cust-name').value,
            mobile: document.getElementById('cust-phone').value,
            email: document.getElementById('cust-email') ? document.getElementById('cust-email').value : '',
            from: document.getElementById('booking-from').value,
            dest: document.getElementById('booking-dest').value,
            date: document.getElementById('booking-date').value,
            mode: activeMode,
            details: specificDetails, // Car name or Airline
            travelers: (parseInt(document.getElementById('adult-count').value) || 1) + (parseInt(document.getElementById('child-count').value) || 0),
            total: summary.total,
            payment: paymentMethod
        };

        localStorage.setItem('latestBooking', JSON.stringify(bookingData));

        // Save to User's History
        const currentUserId = currentUser.email;
        if (currentUserId) {
            const histories = JSON.parse(localStorage.getItem('bookingHistories') || '{}');
            if (!histories[currentUserId]) histories[currentUserId] = [];
            histories[currentUserId].unshift(bookingData);
            localStorage.setItem('bookingHistories', JSON.stringify(histories));
        }

        // Save to Global Admin List
        const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
        allBookings.unshift(bookingData);
        localStorage.setItem('allBookings', JSON.stringify(allBookings));

        // Redirect to ticket page
        window.location.href = 'ticket.html';
    });

    // Initialize
    updateModeUI();
    // Ensure correct step on load
    renderSteps();
});
