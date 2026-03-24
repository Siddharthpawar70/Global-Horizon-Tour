(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('booking') || localStorage.getItem('latestBookingCode');
    const pending = params.get('pending') === '1';
    const body = document.getElementById('receipt-body');
    const statusEl = document.getElementById('pay-status');

    if (!code) {
        body.innerHTML = 'No booking found.';
        return;
    }

    try {
        const res = await window.GHTApi.request(`receipt.php?booking_code=${encodeURIComponent(code)}`);
        const b = res.booking;
        const p = res.payment || {};
        const displayStatus = pending ? 'Payment Pending' : (p.payment_status || b.booking_status || 'Unknown');
        statusEl.textContent = `Status: ${displayStatus}`;
        statusEl.style.color = displayStatus.toLowerCase().includes('success') || displayStatus.toLowerCase().includes('confirmed') ? '#2e7d32' : '#ef6c00';

        body.innerHTML = `
          <table style="width:100%;border-collapse:collapse;">
            <tr><td><strong>User</strong></td><td>${b.customer_name} (${b.user_email})</td></tr>
            <tr><td><strong>Package</strong></td><td>${b.destination}</td></tr>
            <tr><td><strong>Amount Paid</strong></td><td>${b.currency_code} ${Number(b.total_amount).toLocaleString()}</td></tr>
            <tr><td><strong>Transaction ID</strong></td><td>${p.transaction_id || 'Not generated yet'}</td></tr>
            <tr><td><strong>Date & Time</strong></td><td>${p.created_at || b.created_at}</td></tr>
            <tr><td><strong>Gateway</strong></td><td>${p.gateway || 'Razorpay'}</td></tr>
          </table>`;
    } catch (err) {
        body.innerHTML = `Unable to load receipt: ${err.message}`;
    }
})();
