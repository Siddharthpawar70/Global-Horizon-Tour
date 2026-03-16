// Admin Bookings Management Logic
document.addEventListener('DOMContentLoaded', () => {
    const bookingBody = document.getElementById('admin-booking-body');
    const emptyState = document.getElementById('empty-bookings');

    function renderBookings() {
        const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');

        bookingBody.innerHTML = '';

        if (bookings.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        bookings.forEach((booking, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee;"><strong>${booking.id}</strong></td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee;">
                    <div>${booking.name}</div>
                    <div style="font-size: 0.75rem; color: #888;">${booking.email}</div>
                </td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee;">${booking.dest}</td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee; font-size: 0.85rem;">${booking.date}</td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee; font-weight: 600; color: #2e7d32;">
                    ₹ ${booking.total.toLocaleString()}
                </td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee; text-align: center;">
                    <button onclick="deleteBooking('${booking.id}')" style="background: #ffebee; color: #d32f2f; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i> Cancel
                    </button>
                </td>
            `;
            bookingBody.appendChild(tr);
        });
    }

    window.deleteBooking = (id) => {
        if (confirm('Are you sure you want to cancel this booking? This will remove it from the system.')) {
            let bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
            bookings = bookings.filter(b => b.id !== id);
            localStorage.setItem('allBookings', JSON.stringify(bookings));
            renderBookings();
            alert(`Booking ${id} has been cancelled.`);
        }
    };

    renderBookings();
});
