document.addEventListener('DOMContentLoaded', () => {
    const inventoryBody = document.getElementById('inventory-body');
    const searchInput = document.getElementById('admin-search');
    const categoryFilter = document.getElementById('category-filter');
    const modal = document.getElementById('item-modal');
    const itemForm = document.getElementById('item-form');
    const addItemBtn = document.getElementById('add-item-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    let inventory = [];

    async function loadInventory() {
        const res = await window.GHTApi.request('packages.php');
        inventory = res.data || [];
        renderInventory();
    }

    function renderInventory() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryVal = categoryFilter.value;
        const filtered = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.category.toLowerCase().includes(searchTerm);
            const matchesCategory = categoryVal === 'all' || item.category === categoryVal;
            return matchesSearch && matchesCategory;
        });
        inventoryBody.innerHTML = filtered.length ? '' : '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No items found.</td></tr>';
        filtered.forEach(item => {
            inventoryBody.insertAdjacentHTML('beforeend', `<tr><td><strong>${item.name}</strong></td><td><span class="tag ${item.category.toLowerCase()}">${item.category}</span></td><td>₹ ${Number(item.price_inr).toLocaleString()}</td><td>${item.airport || 'N/A'}</td><td>${item.railway || 'N/A'}</td><td><div class="action-btns"><button class="action-btn edit-btn" onclick="editItem(${item.id})"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i></button></div></td></tr>`);
        });
    }

    addItemBtn.onclick = () => { itemForm.reset(); document.getElementById('item-id').value = ''; modal.style.display = 'block'; };
    closeModalBtns.forEach(btn => btn.onclick = () => modal.style.display = 'none');
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    itemForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('item-id').value;
        const payload = {
            id: Number(id),
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            price_inr: parseFloat(document.getElementById('itemPrice').value),
            airport: document.getElementById('itemAirport').value,
            railway: document.getElementById('itemRailway').value
        };
        await window.GHTApi.request('packages.php', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
        modal.style.display = 'none';
        await loadInventory();
        alert('Inventory updated successfully!');
    };

    window.editItem = (id) => {
        const item = inventory.find(i => Number(i.id) === Number(id));
        if (!item) return;
        document.getElementById('item-id').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price_inr;
        document.getElementById('itemAirport').value = item.airport || '';
        document.getElementById('itemRailway').value = item.railway || '';
        modal.style.display = 'block';
    };

    window.deleteItem = async (id) => {
        if (!confirm('Delete this item?')) return;
        await window.GHTApi.request(`packages.php?id=${id}`, { method: 'DELETE' });
        await loadInventory();
    };

    searchInput.oninput = renderInventory;
    categoryFilter.onchange = renderInventory;
    loadInventory();
});
