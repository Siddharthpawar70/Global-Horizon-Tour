// Inventory & Prices Management Logic
document.addEventListener('DOMContentLoaded', () => {
    const inventoryBody = document.getElementById('inventory-body');
    const searchInput = document.getElementById('admin-search');
    const categoryFilter = document.getElementById('category-filter');
    const modal = document.getElementById('item-modal');
    const itemForm = document.getElementById('item-form');
    const addItemBtn = document.getElementById('add-item-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    let inventory = [];

    // 1. Initial Data Loading
    function loadInventory() {
        const customData = JSON.parse(localStorage.getItem('customInventory') || '[]');

        if (customData.length > 0) {
            inventory = customData;
        } else {
            // Initial Destinations (India & International)
            inventory = allDestinations.map((dest, index) => ({
                id: Date.now() + index,
                ...dest
            }));

            // Initial Packages (from packages.html)
            const initialPackages = [
                { id: Date.now() + 100, name: "Maldives Private Island Retreat", price: 245000, category: "Package", airport: "Velana Int'l (MLE)", railway: "N/A" },
                { id: Date.now() + 101, name: "European Wonders Tour", price: 175000, category: "Package", airport: "Paris CDG", railway: "EuroRail" },
                { id: Date.now() + 102, name: "Soul Journey - Bali", price: 65000, category: "Package", airport: "Ngurah Rai (DPS)", railway: "N/A" },
                { id: Date.now() + 103, name: "Masai Mara Safari", price: 195000, category: "Package", airport: "Nairobi (NBO)", railway: "N/A" },
                { id: Date.now() + 104, name: "Ganges Bliss", price: 45000, category: "Package", airport: "Varanasi (VNS)", railway: "Varanasi Jn" }
            ];

            inventory = [...initialPackages, ...inventory];
            saveToStorage();
        }
        renderInventory();
    }

    function saveToStorage() {
        localStorage.setItem('customInventory', JSON.stringify(inventory));
    }

    // 2. Rendering
    function renderInventory() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryVal = categoryFilter.value;

        const filtered = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm);
            const matchesCategory = categoryVal === 'all' || item.category === categoryVal;
            return matchesSearch && matchesCategory;
        });

        inventoryBody.innerHTML = '';

        if (filtered.length === 0) {
            inventoryBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No items found matching your criteria.</td></tr>';
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td><span class="tag ${item.category.toLowerCase()}">${item.category}</span></td>
                <td>${item.category === 'International' ? '$' : '₹'} ${item.price.toLocaleString()}</td>
                <td>${item.airport || 'N/A'}</td>
                <td>${item.railway || 'N/A'}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit-btn" onclick="editItem(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            inventoryBody.appendChild(tr);
        });
    }

    // 3. Modal Controls
    addItemBtn.onclick = () => {
        document.getElementById('modal-title').innerText = 'Add New Item';
        itemForm.reset();
        document.getElementById('item-id').value = '';
        modal.style.display = 'block';
    };

    closeModalBtns.forEach(btn => {
        btn.onclick = () => modal.style.display = 'none';
    });

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };

    // 4. Form Submission (Add/Edit)
    itemForm.onsubmit = (e) => {
        e.preventDefault();

        const id = document.getElementById('item-id').value;
        const newItem = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            airport: document.getElementById('itemAirport').value,
            railway: document.getElementById('itemRailway').value
        };

        if (id) {
            // Edit
            const index = inventory.findIndex(item => item.id == id);
            inventory[index] = newItem;
        } else {
            // Add
            inventory.unshift(newItem);
        }

        saveToStorage();
        renderInventory();
        modal.style.display = 'none';
        alert('Inventory updated successfully!');
    };

    // 5. Global Actions (Exposed to window for onclick)
    window.editItem = (id) => {
        const item = inventory.find(i => i.id == id);
        if (!item) return;

        document.getElementById('modal-title').innerText = 'Edit Item Details';
        document.getElementById('item-id').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemAirport').value = item.airport || '';
        document.getElementById('itemRailway').value = item.railway || '';

        modal.style.display = 'block';
    };

    window.deleteItem = (id) => {
        if (confirm('Are you sure you want to remove this item from the inventory?')) {
            inventory = inventory.filter(item => item.id != id);
            saveToStorage();
            renderInventory();
        }
    };

    // 6. Listeners
    searchInput.oninput = renderInventory;
    categoryFilter.onchange = renderInventory;

    loadInventory();
});
