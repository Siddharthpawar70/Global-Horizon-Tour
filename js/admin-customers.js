// Admin Customers Approval Logic
document.addEventListener('DOMContentLoaded', () => {
    const customerListBody = document.getElementById('customer-list-body');
    const emptyState = document.getElementById('empty-customers');

    function renderCustomers() {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

        customerListBody.innerHTML = '';

        if (users.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee;"><strong>${user.name}</strong></td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee;">${user.email}</td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee; font-size: 0.85rem; color: #666;">${user.registeredAt || 'N/A'}</td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee;">
                    <span style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; 
                        background: ${user.status === 'approved' ? '#e8f5e9' : (user.status === 'blocked' ? '#ffebee' : '#fff3e0')}; 
                        color: ${user.status === 'approved' ? '#2e7d32' : (user.status === 'blocked' ? '#c62828' : '#ef6c00')};">
                        ${user.status}
                    </span>
                </td>
                <td style="padding: 1.2rem; border-bottom: 1px solid #eee; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        ${user.status !== 'approved' ?
                    `<button onclick="updateUserStatus('${user.email}', 'approved')" style="background: #2ecc71; color: #fff; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;"><i class="fas fa-check"></i> Approve</button>` :
                    `<button onclick="updateUserStatus('${user.email}', 'blocked')" style="background: #e74c3c; color: #fff; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;"><i class="fas fa-ban"></i> Block</button>`
                }
                    </div>
                </td>
            `;
            customerListBody.appendChild(tr);
        });
    }

    window.updateUserStatus = (email, newStatus) => {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex !== -1) {
            users[userIndex].status = newStatus;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            renderCustomers();
            alert(`User ${email} has been ${newStatus}.`);
        }
    };

    renderCustomers();
});
