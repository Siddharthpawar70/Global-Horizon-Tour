document.addEventListener('DOMContentLoaded', async () => {
    const refreshBtn = document.querySelector('.data-section button');
    if (refreshBtn) refreshBtn.addEventListener('click', () => window.location.reload());

    const [usersRes, bookingsRes, packagesRes] = await Promise.all([
        window.GHTApi.request('users.php').catch(() => ({ data: [] })),
        window.GHTApi.request('bookings.php').catch(() => ({ data: [] })),
        window.GHTApi.request('packages.php').catch(() => ({ data: [] }))
    ]);

    const users = usersRes.data || [];
    const allBookings = bookingsRes.data || [];
    const inventory = packagesRes.data || [];

    const regUsersVal = document.getElementById('reg-users-count');
    if (regUsersVal) regUsersVal.innerText = users.length.toLocaleString();

    const totalBookingsVal = document.querySelector('.stats-grid div:first-child .stat-value');
    if (totalBookingsVal) totalBookingsVal.innerText = allBookings.length;

    const revenueVal = document.querySelector('.stats-grid div:nth-child(2) .stat-value');
    if (revenueVal) {
        const totalRevenue = allBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
        revenueVal.innerText = '₹ ' + totalRevenue.toLocaleString();
    }

    const dashTableBody = document.querySelector('.data-table-container tbody');
    if (dashTableBody) {
        const recent = allBookings.slice(0, 5);
        dashTableBody.innerHTML = '';
        recent.forEach(b => {
            dashTableBody.insertAdjacentHTML('beforeend', `<tr><td>${b.booking_code}</td><td>${b.customer_name}</td><td>${b.destination}</td><td>${b.travel_date}</td><td>${b.currency_code} ${Number(b.total_amount).toLocaleString()}</td><td><span style="color:#27ae60;">${b.booking_status}</span></td></tr>`);
        });
    }

    const inventoryVal = document.querySelector('.stats-grid div:last-child .stat-value');
    if (inventoryVal) inventoryVal.innerText = inventory.length;
});
