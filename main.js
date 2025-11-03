import { MENU_ITEMS } from 'data';

// --- State Management ---
const APP_STATE = {
    cart: [],
    taxRate: 0.10
};

// --- DOM Elements ---
const DOMElements = {
    menuList: document.getElementById('menu-list'),
    cartItems: document.getElementById('cart-items'),
    subtotalEl: document.getElementById('subtotal'),
    taxEl: document.getElementById('tax'),
    totalEl: document.getElementById('total'),
    checkoutBtn: document.getElementById('checkout-button'),
    cartCountEl: document.getElementById('cart-count'),
    alertContainer: document.getElementById('alert-container'),
    cartSection: document.getElementById('cart-section'),
    cartToggleMobile: document.getElementById('cart-toggle-mobile'),
    cartOverlay: document.getElementById('cart-overlay'),
};

// --- Utility Functions ---

function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function findMenuItemById(id) {
    return MENU_ITEMS.find(item => item.id === id);
}

// --- Rendering Functions ---

function renderMenu() {
    DOMElements.menuList.innerHTML = MENU_ITEMS.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <div class="item-footer">
                    <span class="item-price">${formatPrice(item.price)}</span>
                    <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateCartDOM() {
    if (APP_STATE.cart.length === 0) {
        DOMElements.cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
        DOMElements.checkoutBtn.disabled = true;
        DOMElements.checkoutBtn.textContent = 'Proceed to Checkout';
        DOMElements.cartCountEl.textContent = 0;
    } else {
        const cartHtml = APP_STATE.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <span>${item.quantity} x ${formatPrice(item.price)}</span>
                </div>
                <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
                <button class="remove-btn" data-id="${item.id}">X</button>
            </div>
        `).join('');
        DOMElements.cartItems.innerHTML = cartHtml;
        DOMElements.checkoutBtn.disabled = false;
        DOMElements.cartCountEl.textContent = APP_STATE.cart.reduce((total, item) => total + item.quantity, 0);
    }
}

function updateSummary() {
    const subtotal = APP_STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * APP_STATE.taxRate;
    const total = subtotal + tax;

    DOMElements.subtotalEl.textContent = formatPrice(subtotal);
    DOMElements.taxEl.textContent = formatPrice(tax);
    DOMElements.totalEl.textContent = formatPrice(total);
}

function updateUI() {
    updateCartDOM();
    updateSummary();
}

// --- Interaction Handlers ---

function handleAddToCart(itemId) {
    const item = findMenuItemById(parseInt(itemId));

    if (!item) return;

    const existingCartItem = APP_STATE.cart.find(i => i.id === item.id);

    if (existingCartItem) {
        existingCartItem.quantity++;
    } else {
        APP_STATE.cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    updateUI();
    showAlert(`Added ${item.name} to cart.`, 'success');
}

function handleRemoveFromCart(itemId) {
    const id = parseInt(itemId);
    const itemIndex = APP_STATE.cart.findIndex(i => i.id === id);

    if (itemIndex > -1) {
        const item = APP_STATE.cart[itemIndex];

        if (item.quantity > 1) {
            item.quantity--;
            showAlert(`Decreased quantity of ${item.name}.`, 'info');
        } else {
            APP_STATE.cart.splice(itemIndex, 1);
            showAlert(`Removed ${item.name} from cart.`, 'info');
        }
    }
    updateUI();
}

function handleCheckout() {
    if (APP_STATE.cart.length === 0) {
        showAlert("Your cart is empty!", 'info');
        return;
    }

    DOMElements.checkoutBtn.disabled = true;
    DOMElements.checkoutBtn.textContent = 'Processing...';

    // Simulate checkout process delay
    setTimeout(() => {
        const total = DOMElements.totalEl.textContent;
        showAlert(`Order placed successfully! Total amount: ${total}`, 'success');

        // Clear cart
        APP_STATE.cart = [];
        updateUI();

        if (DOMElements.cartSection.classList.contains('active')) {
            toggleMobileCart(false);
        }
    }, 2000);
}

// --- Event Delegation ---

function setupEventListeners() {
    // Listen for Add to Cart clicks on the menu
    DOMElements.menuList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = e.target.dataset.id;
            handleAddToCart(id);
        }
    });

    // Listen for Remove item clicks on the cart (removes one quantity)
    DOMElements.cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const id = e.target.dataset.id;
            handleRemoveFromCart(id);
        }
    });

    // Checkout button
    DOMElements.checkoutBtn.addEventListener('click', handleCheckout);

    // Mobile Cart Toggle
    DOMElements.cartToggleMobile.addEventListener('click', () => toggleMobileCart(true));
    DOMElements.cartOverlay.addEventListener('click', () => toggleMobileCart(false));
}

// --- Mobile UI Helpers ---

function toggleMobileCart(show) {
    if (show) {
        DOMElements.cartSection.classList.add('active');
        DOMElements.cartOverlay.classList.add('active');
    } else {
        DOMElements.cartSection.classList.remove('active');
        DOMElements.cartOverlay.classList.remove('active');
    }
}

// --- Real-time Alerts ---

function showAlert(message, type = 'info', duration = 3000) {
    const alertEl = document.createElement('div');
    alertEl.className = `alert ${type}`;
    alertEl.textContent = message;

    DOMElements.alertContainer.appendChild(alertEl);

    // Trigger transition (must wait for element to be added to DOM)
    requestAnimationFrame(() => {
        alertEl.classList.add('show');
    });

    // Auto-dismiss
    setTimeout(() => {
        alertEl.classList.remove('show');
        // Remove element after transition completes
        alertEl.addEventListener('transitionend', () => {
            alertEl.remove();
        });
    }, duration);
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    updateUI();
    setupEventListeners();
});
