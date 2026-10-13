// ===========================
// DESIMITHAAS - CLIENT SCRIPT
// Premium Heritage Experience
// ===========================

// Cart state (stored in localStorage)
let cart = [];

// DOM References
let cartIcon = null;
let searchInput = null;

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    cartIcon = document.querySelector('.cart-icon');
    searchInput = document.querySelector('.search-bar input');

    loadCartFromStorage();
    setupNavigation();
    setupCartDrawer();
    setupUserSession();
    setupProductActions();
    setupProductFilters();
    setupPagination();
    setupScrollAnimations();
    setupSearch();
});

// ===========================
// NAVIGATION
// ===========================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===========================
// SEARCH FUNCTIONALITY
// ===========================
function setupSearch() {
    if (!searchInput) return;

    // Check if we arrived with a search query
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('search');
    if (initialQuery && window.location.pathname.includes('products.html')) {
        searchInput.value = initialQuery;
        // filter on load
        setTimeout(() => filterProductsBySearch(initialQuery), 100);
    }

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const term = searchInput.value.trim();
            if (window.location.pathname.includes('products.html')) {
                filterProductsBySearch(term);
            } else {
                window.location.href = `products.html?search=${encodeURIComponent(term)}`;
            }
        }
    });

    if (window.location.pathname.includes('products.html')) {
        searchInput.addEventListener('input', (e) => {
            filterProductsBySearch(e.target.value.trim());
        });
    }
}

function filterProductsBySearch(term) {
    const cards = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    const lower = term.toLowerCase();

    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
        if (!term || title.includes(lower) || desc.includes(lower)) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${visibleCount} products${term ? ` for "${term}"` : ''}`;
    }
}

// ===========================
// CART DRAWER SYSTEM
// ===========================
function setupCartDrawer() {
    // Create Cart Drawer HTML if it doesn't already exist
    if (!document.getElementById('cartDrawerOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'cartDrawerOverlay';
        overlay.className = 'cart-drawer-overlay';
        
        const drawer = document.createElement('div');
        drawer.id = 'cartDrawer';
        drawer.className = 'cart-drawer';
        drawer.innerHTML = `
            <div class="cart-drawer-header">
                <h3><span>🛍️</span> Your Sweet Cart</h3>
                <button class="cart-close-btn" id="closeCartBtn" aria-label="Close cart">&times;</button>
            </div>
            <div class="cart-drawer-items" id="cartDrawerItems">
                <!-- Rendered dynamically -->
            </div>
            <div class="cart-drawer-footer" id="cartDrawerFooter">
                <div class="cart-subtotal-row">
                    <span>Subtotal</span>
                    <strong id="cartSubtotal">₹0</strong>
                </div>
                <div class="cart-delivery-badge" id="cartDeliveryMsg">
                    🚚 Add ₹500+ for Free Express Delivery
                </div>
                <button class="btn btn-primary" id="checkoutBtn" style="width: 100%;">
                    Proceed to Checkout →
                </button>
                <button id="clearCartBtn" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 13px; text-decoration: underline; margin-top: 4px;">
                    Clear Cart
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        // Overlay & close triggers
        overlay.addEventListener('click', closeCartDrawer);
        document.getElementById('closeCartBtn').addEventListener('click', closeCartDrawer);

        // Checkout & Clear triggers
        document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
        document.getElementById('clearCartBtn').addEventListener('click', () => {
            clearCart();
            showNotification('Cart has been cleared', 'info');
        });
    }

    // Cart Icon Click listener
    if (cartIcon) {
        cartIcon.addEventListener('click', openCartDrawer);
    }
}

function openCartDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay && drawer) {
        renderCartItems();
        overlay.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay && drawer) {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function renderCartItems() {
    const container = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const deliveryMsg = document.getElementById('cartDeliveryMsg');
    const footer = document.getElementById('cartDrawerFooter');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <div class="icon">🍪</div>
                <h4 style="color: var(--cream); font-size: 18px; margin: 0;">Your Cart is Empty</h4>
                <p style="font-size: 14px; margin: 0;">Fill it with authentic, fresh handcrafted Thekua and sweet gifts!</p>
                <button class="btn btn-primary" onclick="window.location.href='products.html'; closeCartDrawer();" style="margin-top: 10px;">
                    Explore Sweets 🛒
                </button>
            </div>
        `;
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = 'flex';

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        const itemPrice = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0;
        const lineTotal = itemPrice * (item.quantity || 1);
        total += lineTotal;

        return `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <h4>${escapeHtml(item.name)}</h4>
                    <span>₹${itemPrice} &times; ${item.quantity || 1} = ₹${lineTotal}</span>
                </div>
                <div class="cart-item-qty">
                    <button class="cart-qty-btn" onclick="updateItemQuantity(${index}, -1)">&minus;</button>
                    <span class="cart-qty-val">${item.quantity || 1}</span>
                    <button class="cart-qty-btn" onclick="updateItemQuantity(${index}, 1)">&#43;</button>
                </div>
                <button class="cart-item-remove" onclick="removeCartItem(${index})" title="Remove item">&times;</button>
            </div>
        `;
    }).join('');

    if (subtotalEl) {
        subtotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    if (deliveryMsg) {
        if (total >= 500) {
            deliveryMsg.innerHTML = '🎉 <strong>Free Delivery Unlocked!</strong> Pan India';
            deliveryMsg.style.borderColor = 'rgba(107, 203, 119, 0.4)';
        } else {
            const diff = 500 - total;
            deliveryMsg.innerHTML = `🚚 Add <strong>₹${diff}</strong> more for Free Delivery`;
            deliveryMsg.style.borderColor = 'rgba(212, 168, 83, 0.3)';
        }
    }
}

window.updateItemQuantity = function(index, delta) {
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        renderCartItems();
        updateCartBadge();
    }
};

window.removeCartItem = function(index) {
    if (cart[index]) {
        const name = cart[index].name;
        cart.splice(index, 1);
        saveCart();
        renderCartItems();
        updateCartBadge();
        showNotification(`Removed ${name} from cart`, 'info');
    }
};

function handleCheckout() {
    showNotification('Order checkout initiated! Redirecting to secure gateway...', 'success');
    setTimeout(() => {
        closeCartDrawer();
    }, 1500);
}

// ===========================
// PRODUCT INTERACTIONS
// ===========================
function setupProductActions() {
    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    // Buy now buttons
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', handleBuyNow);
    });
}

function handleAddToCart(e) {
    const card = e.target.closest('.product-card');
    if (!card) return;

    const name = card.querySelector('h3')?.textContent || 'Handcrafted Sweet';
    const price = card.querySelector('.product-price')?.textContent || '₹299';
    
    // Check if item already in cart
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            id: Date.now(),
            name,
            price,
            quantity: 1
        });
    }

    saveCart();
    updateCartBadge();
    showNotification(`Added ${name} to cart!`, 'success');
}

function handleBuyNow(e) {
    handleAddToCart(e);
    openCartDrawer();
}

function saveCart() {
    localStorage.setItem('desi_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem('desi_cart') || localStorage.getItem('cart');
        if (stored) {
            cart = JSON.parse(stored);
        }
    } catch (err) {
        cart = [];
    }
    updateCartBadge();
}

function clearCart() {
    cart = [];
    saveCart();
    renderCartItems();
    updateCartBadge();
}

function updateCartBadge() {
    if (!cartIcon) return;

    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    let countBadge = cartIcon.querySelector('.cart-count');

    if (totalCount > 0) {
        if (!countBadge) {
            countBadge = document.createElement('span');
            countBadge.className = 'cart-count';
            cartIcon.style.position = 'relative';
            cartIcon.appendChild(countBadge);
        }
        countBadge.textContent = totalCount;
        countBadge.style.cssText = `
            position: absolute;
            top: -6px;
            right: -6px;
            background: linear-gradient(135deg, var(--gold), var(--amber));
            color: #0E0B07;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        `;
    } else if (countBadge) {
        countBadge.remove();
    }
}

// ===========================
// PRODUCT FILTERING & SORTING
// ===========================
function setupProductFilters() {
    const applyBtn = document.getElementById('applyFiltersBtn');
    const resetBtn = document.getElementById('resetFiltersBtn');
    const sortSelect = document.getElementById('sortSelect');

    if (applyBtn) {
        applyBtn.addEventListener('click', applyProductFilters);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('.products-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (sortSelect) sortSelect.value = '';
            applyProductFilters();
            showNotification('Filters reset to all products', 'info');
        });
    }

    // Auto-apply on checkbox change
    document.querySelectorAll('.products-sidebar input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', applyProductFilters);
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', applyProductSorting);
    }
}

function applyProductFilters() {
    const cards = document.querySelectorAll('.product-card');
    const categoryCheckboxes = Array.from(document.querySelectorAll('.filter-group:nth-of-type(1) input[type="checkbox"]:checked')).map(cb => cb.value);
    const priceCheckboxes = Array.from(document.querySelectorAll('.filter-group:nth-of-type(2) input[type="checkbox"]:checked')).map(cb => cb.value);

    let count = 0;

    cards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const price = parseInt(card.getAttribute('data-price') || '0', 10);

        // Category match
        let matchesCategory = true;
        if (categoryCheckboxes.length > 0) {
            matchesCategory = categoryCheckboxes.some(c => cat.includes(c));
        }

        // Price match
        let matchesPrice = true;
        if (priceCheckboxes.length > 0) {
            matchesPrice = priceCheckboxes.some(range => {
                if (range === 'under-300') return price < 300;
                if (range === '300-600') return price >= 300 && price <= 600;
                if (range === '600-1000') return price > 600 && price <= 1000;
                if (range === 'above-1000') return price > 1000;
                return true;
            });
        }

        if (matchesCategory && matchesPrice) {
            card.style.display = '';
            count++;
        } else {
            card.style.display = 'none';
        }
    });

    const resultsCount = document.getElementById('resultsCount');
    const pagination = document.getElementById('productsPagination');

    if (categoryCheckboxes.length > 0 || priceCheckboxes.length > 0) {
        if (pagination) pagination.style.display = 'none';
        if (resultsCount) {
            resultsCount.textContent = `Showing ${count} filtered product${count === 1 ? '' : 's'}`;
        }
    } else {
        if (pagination) {
            pagination.style.display = 'flex';
            // re-apply active pagination page
            const activePageBtn = pagination.querySelector('.page-btn.active');
            const pageMode = activePageBtn ? activePageBtn.getAttribute('data-page') : '1';
            cards.forEach((card, index) => {
                if (pageMode === 'all') {
                    card.style.display = '';
                } else if (pageMode === '1') {
                    card.style.display = (index < 6) ? '' : 'none';
                } else if (pageMode === '2') {
                    card.style.display = (index >= 6 && index < 12) ? '' : 'none';
                }
            });
        }
        if (resultsCount) {
            resultsCount.textContent = `Showing ${count} products`;
        }
    }
}

function applyProductSorting() {
    const grid = document.getElementById('productsGrid');
    const sortSelect = document.getElementById('sortSelect');
    if (!grid || !sortSelect) return;

    const cards = Array.from(grid.querySelectorAll('.product-card'));
    const val = sortSelect.value;

    cards.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price') || '0', 10);
        const priceB = parseInt(b.getAttribute('data-price') || '0', 10);
        const ratingA = parseFloat(a.getAttribute('data-rating') || '0');
        const ratingB = parseFloat(b.getAttribute('data-rating') || '0');
        const reviewsA = parseInt(a.getAttribute('data-reviews') || '0', 10);
        const reviewsB = parseInt(b.getAttribute('data-reviews') || '0', 10);

        if (val === 'price-low') return priceA - priceB;
        if (val === 'price-high') return priceB - priceA;
        if (val === 'rating') return ratingB - ratingA;
        if (val === 'popularity') return reviewsB - reviewsA;
        return 0;
    });

    cards.forEach(card => grid.appendChild(card));
}

// ===========================
// USER AUTH STATE
// ===========================
function setupUserSession() {
    const session = localStorage.getItem('desi_user');
    if (session) {
        try {
            const user = JSON.parse(session);
            const displayName = user.name ? user.name.split(' ')[0] : 'Member';
            document.querySelectorAll('.btn-login').forEach(btn => {
                btn.innerHTML = `Hi, ${escapeHtml(displayName)} 👤`;
                btn.setAttribute('href', 'login.html');
                btn.setAttribute('title', `Signed in as ${user.name || user.email}`);
            });
        } catch (e) {
            localStorage.removeItem('desi_user');
        }
    }
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '!' : '✦';
    notification.innerHTML = `<span style="color: var(--gold); font-weight: bold; margin-right: 8px;">${icon}</span> ${escapeHtml(message)}`;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: #1A1510;
        border: 1px solid ${type === 'success' ? 'rgba(107, 203, 119, 0.4)' : type === 'error' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(212, 168, 83, 0.4)'};
        color: #F5EBD8;
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        transform: translateY(30px);
        opacity: 0;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
    `;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateY(30px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 350);
    }, 3200);
}

// ===========================
// PRODUCT PAGINATION
// ===========================
function setupPagination() {
    const paginationContainer = document.getElementById('productsPagination');
    if (!paginationContainer) return;

    const cards = Array.from(document.querySelectorAll('.product-card'));
    const buttons = paginationContainer.querySelectorAll('.page-btn');
    const pageSize = 6;
    let currentMode = '1';

    function displayPage(mode) {
        currentMode = mode;
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-page') === mode);
        });

        cards.forEach((card, index) => {
            if (mode === 'all') {
                card.style.display = '';
            } else if (mode === '1') {
                card.style.display = (index < pageSize) ? '' : 'none';
            } else if (mode === '2') {
                card.style.display = (index >= pageSize && index < pageSize * 2) ? '' : 'none';
            }
        });

        const resultsEl = document.getElementById('resultsCount');
        if (resultsEl) {
            if (mode === 'all') {
                resultsEl.textContent = `Showing all ${cards.length} products`;
            } else {
                const count = Math.min(pageSize, cards.length);
                resultsEl.textContent = `Showing ${count} of ${cards.length} products (Page ${mode})`;
            }
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageMode = btn.getAttribute('data-page');
            displayPage(pageMode);
            const toolbar = document.querySelector('.products-toolbar');
            if (toolbar) {
                toolbar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });

    // Initialize with Page 1
    displayPage('1');
}

// ===========================
// SCROLL REVEAL OBSERVER
// ===========================
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Helper utility
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// Global exports
window.CartManager = {
    addToCart: handleAddToCart,
    openCart: openCartDrawer,
    closeCart: closeCartDrawer,
    clearCart,
    getCart: () => cart
};

window.Utils = {
    showNotification,
    openLoginModal
};
