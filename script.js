// ===========================
// DESIMITHAAS - JAVASCRIPT
// ===========================

// Initialize cart array (would be stored in localStorage or backend in production)
let cart = [];

// DOM Elements
const searchInput = document.querySelector('.search-bar input');
const cartIcon = document.querySelector('.cart-icon');
const buyButtons = document.querySelectorAll('.btn-buy');
const addToCartButtons = document.querySelectorAll('.btn-add-cart');
const shopNowBtn = document.querySelector('.hero-buttons .btn-primary');
const startShoppingBtn = document.querySelector('.cta-section .btn-light');
const navLinks = document.querySelectorAll('.nav-link');

// ===========================
// EVENT LISTENERS
// ===========================

// Active navigation link based on current page
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    initializeEventListeners();
});

function setActiveNavLink() {
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

function initializeEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearch);
    }

    // Cart icon click
    if (cartIcon) {
        cartIcon.addEventListener('click', viewCart);
    }

    // Buy Now buttons
    buyButtons.forEach(btn => {
        btn.addEventListener('click', handleBuyNow);
    });

    // Add to Cart buttons
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    // Shop Now button
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', scrollToProducts);
    }

    // Start Shopping button
    if (startShoppingBtn) {
        startShoppingBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

// ===========================
// SEARCH FUNCTIONALITY
// ===========================

function handleSearch(e) {
    if (e.key === 'Enter') {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            // In production, this would send a request to the backend
            console.log('Searching for:', searchTerm);
            // For now, redirect to products page with search parameter
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }
}

// ===========================
// CART FUNCTIONALITY
// ===========================

function handleAddToCart(e) {
    const productCard = e.target.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    
    const product = {
        id: Date.now(),
        name: productName,
        price: productPrice
    };
    
    addToCart(product);
    showNotification(`${productName} added to cart!`, 'success');
}

function handleBuyNow(e) {
    const productCard = e.target.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    
    // In production, this would redirect to checkout
    showNotification(`Proceeding to checkout for ${productName}`, 'info');
    setTimeout(() => {
        // window.location.href = 'checkout.html';
    }, 1500);
}

function addToCart(product) {
    cart.push(product);
    updateCartIcon();
    // Store in localStorage for persistence
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartIcon() {
    if (cart.length > 0) {
        const cartCount = document.createElement('span');
        cartCount.className = 'cart-count';
        cartCount.textContent = cart.length;
        cartCount.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        `;
        
        const existingCount = cartIcon.querySelector('.cart-count');
        if (existingCount) {
            existingCount.remove();
        }
        
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(cartCount);
    }
}

function viewCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'info');
        return;
    }
    
    // In production, this would open a cart modal or redirect to cart page
    console.log('Cart contents:', cart);
    alert(`Items in cart: ${cart.length}\n\n${cart.map(item => `${item.name} - ${item.price}`).join('\n')}`);
}

// ===========================
// NAVIGATION
// ===========================

function scrollToProducts() {
    const bestsellersSection = document.querySelector('.bestsellers');
    if (bestsellersSection) {
        bestsellersSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = 'products.html';
    }
}

function handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');
    
    // Check if it's an internal link
    if (href.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(href);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===========================
// ANIMATIONS
// ===========================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===========================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all product cards and feature cards
document.addEventListener('DOMContentLoaded', () => {
    const elementsToObserve = document.querySelectorAll('.product-card, .feature-card, .testimonial-card');
    elementsToObserve.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
});

// ===========================
// PRODUCT FILTERING (for future use)
// ===========================

function filterProducts(category) {
    // This function can be expanded when you add more products
    console.log('Filtering products by category:', category);
}

// ===========================
// LOCAL STORAGE MANAGEMENT
// ===========================

function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
            updateCartIcon();
        } catch (e) {
            console.error('Error loading cart:', e);
        }
    }
}

function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartIcon();
}

// Load cart on page load
window.addEventListener('load', loadCartFromStorage);

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(price);
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const paramObject = {};
    for (let [key, value] of params) {
        paramObject[key] = value;
    }
    return paramObject;
}

// ===========================
// EXPORT FUNCTIONS FOR OTHER PAGES
// ===========================

window.CartManager = {
    addToCart,
    viewCart,
    clearCart,
    getCart: () => cart,
    getCartCount: () => cart.length
};

window.Utils = {
    formatPrice,
    getUrlParams,
    showNotification,
    filterProducts
};
