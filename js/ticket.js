const bookingData = JSON.parse(localStorage.getItem('latestBooking'));
const ticketList = document.getElementById('ticket-list'); // This is the container

if (!bookingData) {
    document.getElementById('no-booking').style.display = 'block';
    document.getElementById('ticket-area').style.display = 'none';
} else {
    // Hide no booking message, show ticket area
    document.getElementById('no-booking').style.display = 'none';
    document.getElementById('ticket-area').style.display = 'block';

    // Update the success message area if present
    if (document.getElementById('conf-email')) document.getElementById('conf-email').textContent = bookingData.email || '-';
    if (document.getElementById('conf-mobile')) document.getElementById('conf-mobile').textContent = bookingData.mobile || '-';

    // Format Date
    const travelDate = new Date(bookingData.date);
    const formattedDate = travelDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Mode formatting
    const modeDisplay = bookingData.mode.charAt(0).toUpperCase() + bookingData.mode.slice(1);

    // Construct the Ticket HTML
    const ticketHTML = `
        <div class="ticket-card" style="flex-direction: column; padding: 2rem;">
            <div class="ticket-header" style="text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
                <h2 style="font-size: 2rem; color: var(--primary);">Ticket Information (Demo)</h2>
                <div style="color: #666; margin-top: 5px;">Booking ID: <strong>${bookingData.id}</strong></div>
            </div>

            <div class="ticket-grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
                <!-- Row 1 -->
                <div><span class="label">Name</span><span class="value">${bookingData.name}</span></div>
                <div><span class="label">Mobile Number</span><span class="value">${bookingData.mobile}</span></div>

                <!-- Row 2 -->
                <div><span class="label">Email</span><span class="value">${bookingData.email || '-'}</span></div>
                 <div><span class="label">Number of Travelers</span><span class="value">${bookingData.travelers}</span></div>

                <!-- Row 3 -->
                <div><span class="label">From</span><span class="value">${bookingData.from}</span></div>
                <div><span class="label">To</span><span class="value">${bookingData.dest}</span></div>

                <!-- Row 4 -->
                <div><span class="label">Travel Date</span><span class="value">${formattedDate}</span></div>
                <div><span class="label">Travel Mode</span><span class="value">${modeDisplay}</span></div>

                <!-- Row 5 -->
                <div><span class="label">Vehicle / Airline</span><span class="value">${bookingData.details || '-'}</span></div>
                <div><span class="label">Payment Method</span><span class="value">${bookingData.payment}</span></div>
                
                 <!-- Row 6 -->
                <div><span class="label">Estimated Price</span><span class="value" style="color: var(--accent); font-size: 1.2rem;">₹ ${bookingData.total ? bookingData.total.toLocaleString() : '0'}</span></div>
                <div><span class="label">Booking Status</span><span class="value" style="color: #27ae60;">Confirmed (Demo)</span></div>
            </div>

            <div style="margin-top: 2rem; text-align: center;">
                <div class="barcode"></div>
                <small>This is a computer generated invalid ticket for demonstration.</small>
            </div>
        </div>
    `;

    ticketList.innerHTML = ticketHTML;
}
