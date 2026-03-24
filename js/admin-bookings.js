document.addEventListener('DOMContentLoaded', () => {
    const bookingBody = document.getElementById('admin-booking-body');
    const emptyState = document.getElementById('empty-bookings');

    async function renderBookings() {
        const res = await window.GHTApi.request('bookings.php');
        const bookings = res.data || [];
        bookingBody.innerHTML = '';
        emptyState.style.display = bookings.length ? 'none' : 'block';

        bookings.forEach(booking => {
            bookingBody.insertAdjacentHTML('beforeend', `<tr><td style="padding:1.2rem;border-bottom:1px solid #eee;"><strong>${booking.booking_code}</strong></td><td style="padding:1.2rem;border-bottom:1px solid #eee;"><div>${booking.customer_name}</div><div style="font-size:0.75rem;color:#888;">${booking.user_email}</div></td><td style="padding:1.2rem;border-bottom:1px solid #eee;">${booking.destination}</td><td style="padding:1.2rem;border-bottom:1px solid #eee;">${booking.travel_date}</td><td style="padding:1.2rem;border-bottom:1px solid #eee;font-weight:600;color:#2e7d32;">${booking.currency_code} ${Number(booking.total_amount).toLocaleString()}</td><td style="padding:1.2rem;border-bottom:1px solid #eee;text-align:center;"><button onclick="deleteBooking('${booking.booking_code}')" style="background:#ffebee;color:#d32f2f;border:none;padding:6px 12px;border-radius:5px;cursor:pointer;font-size:0.8rem;"><i class="fas fa-trash"></i> Cancel</button></td></tr>`);
        });
    }

    window.deleteBooking = async (code) => {
        if (!confirm('Cancel this booking?')) return;
        await window.GHTApi.request(`bookings.php?booking_code=${encodeURIComponent(code)}`, { method: 'DELETE' });
        renderBookings();
    };

    renderBookings();
});
