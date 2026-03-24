document.addEventListener('DOMContentLoaded', () => {
    const customerListBody = document.getElementById('customer-list-body');
    const emptyState = document.getElementById('empty-customers');

    async function renderCustomers() {
        const res = await window.GHTApi.request('users.php');
        const users = res.data || [];
        customerListBody.innerHTML = '';
        emptyState.style.display = users.length ? 'none' : 'block';

        users.forEach(user => {
            customerListBody.insertAdjacentHTML('beforeend', `<tr><td style="padding:1.2rem;border-bottom:1px solid #eee;"><strong>${user.name}</strong></td><td style="padding:1.2rem;border-bottom:1px solid #eee;">${user.email}</td><td style="padding:1.2rem;border-bottom:1px solid #eee;font-size:0.85rem;color:#666;">${user.created_at || 'N/A'}</td><td style="padding:1.2rem;border-bottom:1px solid #eee;"><span style="padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;text-transform:uppercase;background:${user.status === 'approved' ? '#e8f5e9' : (user.status === 'blocked' ? '#ffebee' : '#fff3e0')};color:${user.status === 'approved' ? '#2e7d32' : (user.status === 'blocked' ? '#c62828' : '#ef6c00')};">${user.status}</span></td><td style="padding:1.2rem;border-bottom:1px solid #eee;text-align:center;"><div style="display:flex;gap:8px;justify-content:center;">${user.status !== 'approved' ? `<button onclick="updateUserStatus('${user.email}','approved')" style="background:#2ecc71;color:#fff;border:none;padding:6px 12px;border-radius:5px;cursor:pointer;font-size:0.8rem;"><i class='fas fa-check'></i> Approve</button>` : `<button onclick="updateUserStatus('${user.email}','blocked')" style="background:#e74c3c;color:#fff;border:none;padding:6px 12px;border-radius:5px;cursor:pointer;font-size:0.8rem;"><i class='fas fa-ban'></i> Block</button>`}</div></td></tr>`);
        });
    }

    window.updateUserStatus = async (email, status) => {
        await window.GHTApi.request('users.php', { method: 'PATCH', body: JSON.stringify({ email, status }) });
        renderCustomers();
    };

    renderCustomers();
});
