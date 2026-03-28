// ==================== CONFIGURATION ====================
const CONFIG = {
    API_URL: 'http://localhost:5000/api'
};

// ==================== PRODUCT DATA (Fallback) ====================
const FALLBACK_PRODUCTS = [
    {
        id: 1,
        name: "Floral Print Maxi Dress",
        price: 2499,
        originalPrice: 3999,
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
        category: "women",
        badge: "new"
    },
    {
        id: 2,
        name: "Women's Denim Jacket",
        price: 2999,
        originalPrice: 4499,
        image: "https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=600",
        category: "women",
        badge: null
    },
    {
        id: 3,
        name: "Printed Kurta Set",
        price: 2199,
        originalPrice: 3499,
        image: "https://images.unsplash.com/photo-1766994063823-ed214f883548?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJpbnRlZCUyMHdvbWVuJTIwa3VydGF8ZW58MHx8MHx8fDA%3D0",
        category: "women",
        badge: null
    },
    {
        id: 4,
        name: "Slim Fit Casual Shirt",
        price: 1599,
        originalPrice: 2499,
        image: "https://images.unsplash.com/photo-1666358083648-68aff30bfbbc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8U2xpbSUyMEZpdCUyMENhc3VhbCUyMFNoaXJ0fGVufDB8fDB8fHww",
        category: "men",
        badge: "sale"
    },
    {
        id: 5,
        name: "Men's Formal Shirt",
        price: 1899,
        originalPrice: 2899,
        image: "https://images.unsplash.com/photo-1714328564923-d4826427c991?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9ybWFsJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
        category: "men",
        badge: null
    },
    {
        id: 6,
        name: "Classic Sneakers",
        price: 3999,
        originalPrice: 5999,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
        category: "accessories",
        badge: "sale"
    },
    {
        id: 7,
        name: "Kids Party Wear Set",
        price: 1899,
        originalPrice: 2799,
        image: "https://plus.unsplash.com/premium_photo-1771860136848-b27e2787cf47?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a2lkcyUyMHBwYXJ0eSUyMHdlYXIlMjBzZXR8ZW58MHx8MHx8fDA%3D",
        category: "kids",
        badge: "new"
    },
    {
        id: 8,
        name: "Leather Crossbody Bag",
        price: 3499,
        originalPrice: 4999,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
        category: "accessories",
        badge: null
    }
];

// ==================== STATE ====================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';
let searchTerm = '';
let products = FALLBACK_PRODUCTS; // Start with fallback products

// ==================== DOM ELEMENTS ====================
const loginContainer = document.getElementById('loginContainer');
const mainWebsite = document.getElementById('mainWebsite');
const loginForm = document.getElementById('loginForm');
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const cartIcon = document.getElementById('cartIcon');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const categoryTitle = document.getElementById('categoryTitle');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const navLinks = document.querySelectorAll('.nav-link');
const categoryCards = document.querySelectorAll('.category-card');
const footerCategoryLinks = document.querySelectorAll('.footer-category-link');
const homeLogo = document.getElementById('homeLogo');
const shopNowBtn = document.getElementById('shopNowBtn');
const userIcon = document.getElementById('userIcon');
const wishlistIcon = document.getElementById('wishlistIcon');

// ==================== API FUNCTIONS ====================
async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = CONFIG.API_URL + endpoint;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const token = localStorage.getItem('token');
    if (token && requiresAuth) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadProductsFromBackend() {
    try {
        let url = '/products';
        const params = new URLSearchParams();
        
        if (currentFilter !== 'all') {
            params.append('category', currentFilter);
        }
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        
        const queryString = params.toString();
        if (queryString) {
            url += '?' + queryString;
        }
        
        const result = await apiCall(url, 'GET', null, false);
        if (result.success && result.data) {
            products = result.data;
        }
        renderProducts();
    } catch (error) {
        console.log('Using fallback products');
        products = FALLBACK_PRODUCTS;
        renderProducts();
    }
}

// ==================== RENDER FUNCTIONS ====================
function renderProducts() {
    if (!productsGrid) return;
    
    const filteredProducts = products.filter(product => {
        const matchesCategory = currentFilter === 'all' || product.category === currentFilter;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
            <div class="product-card">
                ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'new' ? 'New' : 'Sale'}</span>` : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-actions">
                        <button class="action-btn" onclick="addToWishlist(${product.id})">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="action-btn" onclick="quickView(${product.id})">
                            <i class="far fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        ₹${product.price}
                        ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                    </div>
                    ${discount > 0 ? `<span style="color: #e74c3c; font-size: 0.9rem;">${discount}% off</span>` : ''}
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align: center; color: #999; padding: 2rem;">Your cart is empty</div>';
            if (cartTotal) cartTotal.textContent = '₹0';
            return;
        }
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (cartTotal) cartTotal.textContent = `₹${totalPrice}`;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ==================== CART FUNCTIONS ====================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification('Item added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    showNotification('Item removed from cart');
}

function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        updateCartDisplay();
    }
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    showNotification('Cart cleared');
}

// ==================== UI FUNCTIONS ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function addToWishlist(productId) {
    showNotification('Added to wishlist!');
}

function quickView(productId) {
    const product = products.find(p => p.id === productId);
    showNotification(`Quick view: ${product.name}`);
}

// ==================== FILTER FUNCTIONS ====================
function setFilter(category) {
    currentFilter = category;
    loadProductsFromBackend();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            if (category === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setFilter('all');
                if (categoryTitle) categoryTitle.textContent = 'Trending Now';
            } else {
                setFilter(category);
                if (categoryTitle) categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1) + "'s Collection";
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            setFilter(category);
            if (categoryTitle) categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1) + "'s Collection";
        });
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setFilter(filter);
        });
    });
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            loadProductsFromBackend();
        });
    }
    
    // Cart icon
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }
    
    // Close cart
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }
    
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
            } else {
                showNotification('Checkout coming soon!');
            }
        });
    }
    
    // User icon
    if (userIcon) {
        userIcon.addEventListener('click', () => {
            showNotification('Profile section coming soon!');
        });
    }
    
    // Wishlist icon
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', () => {
            showNotification('Wishlist feature coming soon!');
        });
    }
    
    // Home logo
    if (homeLogo) {
        homeLogo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setFilter('all');
            if (categoryTitle) categoryTitle.textContent = 'Trending Now';
        });
    }
    
    // Shop now button
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ==================== LOGIN HANDLER ====================
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            // Try to login with backend
            const result = await apiCall('/auth/login', 'POST', { email, password }, false);
            
            if (result.token) {
                localStorage.setItem('token', result.token);
            }
            
            // Hide login, show main website
            loginContainer.style.display = 'none';
            mainWebsite.style.display = 'block';
            
            // Load products
            await loadProductsFromBackend();
            setupEventListeners();
            updateCartDisplay();
            
            showNotification(`Welcome back, ${result.user.name || 'User'}!`);
            
        } catch (error) {
            // Fallback: Allow any login for demo
            console.log('Using fallback login');
            loginContainer.style.display = 'none';
            mainWebsite.style.display = 'block';
            await loadProductsFromBackend();
            setupEventListeners();
            updateCartDisplay();
            showNotification('Welcome to StyleStreet!');
        }
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (for demo, just show login)
    updateCartDisplay();
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Make functions global for onclick handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.addToWishlist = addToWishlist;
window.quickView = quickView;