(async () => {
    const ticketList = document.getElementById('ticket-list');
    const code = localStorage.getItem('latestBookingCode') || new URLSearchParams(window.location.search).get('booking');

    if (!code) {
        document.getElementById('no-booking').style.display = 'block';
        document.getElementById('ticket-area').style.display = 'none';
        return;
    }

    try {
        const res = await window.GHTApi.request(`receipt.php?booking_code=${encodeURIComponent(code)}`);
        const b = res.booking;
        const p = res.payment || {};

        document.getElementById('no-booking').style.display = 'none';
        document.getElementById('ticket-area').style.display = 'block';

        if (document.getElementById('conf-email')) document.getElementById('conf-email').textContent = b.user_email || '-';
        if (document.getElementById('conf-mobile')) document.getElementById('conf-mobile').textContent = b.mobile || '-';

        ticketList.innerHTML = `<div class="ticket-card" style="flex-direction:column;padding:2rem;"><div class="ticket-header" style="text-align:center;border-bottom:2px dashed #eee;padding-bottom:1.5rem;margin-bottom:1.5rem;"><h2 style="font-size:2rem;color:var(--primary);">Ticket Information</h2><div style="color:#666;margin-top:5px;">Booking ID: <strong>${b.booking_code}</strong></div></div><div class="ticket-grid" style="grid-template-columns:1fr 1fr;gap:2rem;"><div><span class="label">Name</span><span class="value">${b.customer_name}</span></div><div><span class="label">Mobile Number</span><span class="value">${b.mobile}</span></div><div><span class="label">Email</span><span class="value">${b.user_email || '-'}</span></div><div><span class="label">Travelers</span><span class="value">${b.travelers}</span></div><div><span class="label">From</span><span class="value">${b.source_location}</span></div><div><span class="label">To</span><span class="value">${b.destination}</span></div><div><span class="label">Travel Date</span><span class="value">${b.travel_date}</span></div><div><span class="label">Mode</span><span class="value">${b.travel_mode}</span></div><div><span class="label">Payment Method</span><span class="value">${b.payment_method}</span></div><div><span class="label">Amount</span><span class="value" style="color:var(--accent);font-size:1.2rem;">${b.currency_code} ${Number(b.total_amount).toLocaleString()}</span></div><div><span class="label">Transaction ID</span><span class="value">${p.transaction_id || '-'}</span></div><div><span class="label">Status</span><span class="value" style="color:#27ae60;">${b.booking_status}</span></div></div></div>`;
    } catch {
        document.getElementById('no-booking').style.display = 'block';
        document.getElementById('ticket-area').style.display = 'none';
    }
})();
