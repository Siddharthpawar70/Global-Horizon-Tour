// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Refresh Button Interaction
    const refreshBtn = document.querySelector('.data-section button');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
                alert('Dashboard data has been synchronized with the latest database records.');
            }, 1000);
        });
    }

    // 2. Sidebar Navigation Highlighting
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
            }
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 3. Stats Data Population
    const regUsersVal = document.getElementById('reg-users-count');
    if (regUsersVal) {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        regUsersVal.innerText = users.length.toLocaleString();
    }

    // 6. Booking Statistics
    const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');

    // Update Total Bookings
    const totalBookingsVal = document.querySelector('.stats-grid div:first-child .stat-value');
    if (totalBookingsVal) {
        totalBookingsVal.innerText = allBookings.length;
    }

    // Update Revenue
    const revenueVal = document.querySelector('.stats-grid div:nth-child(2) .stat-value');
    if (revenueVal) {
        const totalRevenue = allBookings.reduce((sum, b) => sum + (b.total || 0), 0);
        revenueVal.innerText = '₹ ' + totalRevenue.toLocaleString();
    }

    // Update Recent Bookings Table on Dashboard
    const dashTableBody = document.querySelector('.data-table-container tbody');
    if (dashTableBody) {
        const recent = allBookings.slice(0, 5); // Latest 5
        if (recent.length > 0) {
            document.querySelector('.empty-state').style.display = 'none';
            dashTableBody.innerHTML = '';
            recent.forEach(b => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${b.id}</td>
                    <td>${b.name}</td>
                    <td>${b.dest}</td>
                    <td>${b.date}</td>
                    <td>₹ ${b.total.toLocaleString()}</td>
                    <td><span style="color: #27ae60;">Confirmed</span></td>
                `;
                dashTableBody.appendChild(tr);
            });
        }
    }

    // 5. Inventory Data Statistics
    const inventoryVal = document.querySelector('.stats-grid div:last-child .stat-value');
    if (inventoryVal) {
        const customInventory = JSON.parse(localStorage.getItem('customInventory') || '[]');
        if (customInventory.length > 0) {
            inventoryVal.innerText = customInventory.length;
        }
    }

    // 4. Logout Confirmation
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn && logoutBtn.innerText === 'Logout') {
        logoutBtn.addEventListener('click', (e) => {
            if (!confirm('Are you sure you want to log out from the admin session?')) {
                e.preventDefault();
            }
        });
    }
});
