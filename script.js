const products = [
    {
        id: 1,
        name: 'Ray-Ban Meta Aviator',
        category: 'Gen 2',
        type: 'sunglasses',
        filter: 'gen2 aviator',
        price: 329,
        description: 'Classic aviator style with advanced Meta AI technology. Features 12MP camera, premium audio, and all-day battery life.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio']
    },
    {
        id: 2,
        name: 'Ray-Ban Meta Wayfarer',
        category: 'Gen 2',
        type: 'sunglasses',
        filter: 'gen2 wayfarer',
        price: 329,
        description: 'Iconic wayfarer design meets cutting-edge smart technology. Capture moments and stay connected hands-free.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio']
    },
    {
        id: 3,
        name: 'Ray-Ban Meta Round',
        category: 'Gen 2',
        type: 'sunglasses',
        filter: 'gen2 round',
        price: 329,
        description: 'Timeless round frames with modern smart features. Perfect blend of style and innovation.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio']
    },
    {
        id: 4,
        name: 'Ray-Ban Meta Aviator Gen 1',
        category: 'Gen 1',
        type: 'sunglasses',
        filter: 'gen1 aviator',
        price: 299,
        description: 'Original Meta glasses with aviator styling. Experience smart eyewear with proven technology.',
        features: ['5MP Camera', 'Meta AI', '6hr Battery', 'Open-ear Audio']
    },
    {
        id: 5,
        name: 'Ray-Ban Meta Wayfarer Gen 1',
        category: 'Gen 1',
        type: 'sunglasses',
        filter: 'gen1 wayfarer',
        price: 299,
        description: 'Classic wayfarer design with first-generation Meta AI capabilities.',
        features: ['5MP Camera', 'Meta AI', '6hr Battery', 'Open-ear Audio']
    },
    {
        id: 6,
        name: 'Ray-Ban Meta Round Gen 1',
        category: 'Gen 1',
        type: 'sunglasses',
        filter: 'gen1 round',
        price: 299,
        description: 'Round frames with Gen 1 smart features. Stylish and functional.',
        features: ['5MP Camera', 'Meta AI', '6hr Battery', 'Open-ear Audio']
    },
    {
        id: 7,
        name: 'Ray-Ban Meta Aviator - Clear Lens',
        category: 'Gen 2',
        type: 'eyeglasses',
        filter: 'gen2 aviator',
        price: 329,
        description: 'Classic aviator style with clear prescription-ready lenses. Features 12MP camera, premium audio, and all-day battery life.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio', 'Clear Lenses']
    },
    {
        id: 8,
        name: 'Ray-Ban Meta Wayfarer - Clear Lens',
        category: 'Gen 2',
        type: 'eyeglasses',
        filter: 'gen2 wayfarer',
        price: 329,
        description: 'Iconic wayfarer design with clear lenses. Perfect for prescription eyewear with smart technology.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio', 'Clear Lenses']
    },
    {
        id: 9,
        name: 'Ray-Ban Meta Round - Clear Lens',
        category: 'Gen 2',
        type: 'eyeglasses',
        filter: 'gen2 round',
        price: 329,
        description: 'Timeless round frames with clear lenses. Smart features meet classic style.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio', 'Clear Lenses']
    },
    {
        id: 10,
        name: 'Ray-Ban Meta Aviator Classic',
        category: 'Aviator',
        type: 'sunglasses',
        filter: 'aviator',
        price: 349,
        description: 'Premium aviator frames with enhanced features and premium materials.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio', 'Polarized Lenses']
    },
    {
        id: 11,
        name: 'Ray-Ban Meta Wayfarer Classic',
        category: 'Wayfarer',
        type: 'sunglasses',
        filter: 'wayfarer',
        price: 349,
        description: 'Iconic wayfarer design with premium smart features and superior build quality.',
        features: ['12MP Camera', 'Meta AI', '8hr Battery', 'Premium Audio', 'Polarized Lenses']
    },
    {
        id: 12,
        name: 'Ray-Ban Meta Skyler Shiny Black',
        category: 'Gen 1',
        type: 'eyeglasses',
        filter: 'gen1',
        price: 299,
        description: 'Skyler frame with shiny black finish and clear lenses. Gen 1 smart technology.',
        features: ['5MP Camera', 'Meta AI', '6hr Battery', 'Open-ear Audio', 'Clear Lenses']
    }
];

let cart = [];
let currentFilter = 'all';

function init() {
    renderProducts();
    setupEventListeners();
}

function setupEventListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderProducts();
        });
    });

    const shopNowBtn = document.querySelector('.btn-primary');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const showcaseItems = document.querySelectorAll('.showcase-item');
    showcaseItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
                window.location.href = page;
            }
        });
    });

    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const productList = window.currentProducts || products;
    const filteredProducts = currentFilter === 'all' 
        ? productList 
        : productList.filter(p => p.filter.includes(currentFilter));

    grid.innerHTML = filteredProducts.map(product => {
        const lensType = product.type === 'eyeglasses' ? 'clear' : 
                        product.name.toLowerCase().includes('green') ? 'green' : 'gradient';
        return `
        <div class="product-card" onclick="openModal(${product.id})">
            <div class="product-image">
                <div class="product-glasses-container">
                    <div class="product-glasses ${lensType}-lens">
                        <div class="product-frame"></div>
                        <div class="product-camera-dot"></div>
                        <div class="product-temple-logo">RAY-BAN</div>
                    </div>
                    <div class="product-reflection"></div>
                </div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    }).join('');
}

function getGradientColor(id) {
    const gradients = [
        '#667eea 0%, #764ba2 100%',
        '#f093fb 0%, #f5576c 100%',
        '#4facfe 0%, #00f2fe 100%',
        '#43e97b 0%, #38f9d7 100%',
        '#fa709a 0%, #fee140 100%',
        '#30cfd0 0%, #330867 100%',
        '#a8edea 0%, #fed6e3 100%',
        '#ff9a9e 0%, #fecfef 100%'
    ];
    return gradients[(id - 1) % gradients.length];
}

function openModal(productId) {
    const productList = window.currentProducts || products;
    const product = productList.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    const lensType = product.type === 'eyeglasses' ? 'clear' : 
                    product.name.toLowerCase().includes('green') ? 'green' : 'gradient';

    modalBody.innerHTML = `
        <div class="modal-image">
            <div class="modal-glasses-container">
                <div class="modal-glasses ${lensType}-lens">
                    <div class="product-frame"></div>
                    <div class="product-camera-dot"></div>
                    <div class="product-temple-logo">RAY-BAN</div>
                </div>
                <div class="product-reflection"></div>
            </div>
        </div>
        <div class="modal-info">
            <h2>${product.name}</h2>
            <div class="price">$${product.price}</div>
            <div class="description">${product.description}</div>
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">Features:</h3>
                <ul style="list-style: none; padding: 0;">
                    ${product.features.map(f => `<li style="padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">✓ ${f}</li>`).join('')}
                </ul>
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="addToCart(${product.id}); closeModal();">
                Add to Cart
            </button>
        </div>
    `;

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function addToCart(productId) {
    const productList = window.currentProducts || products;
    const product = productList.find(p => p.id === productId);
    if (!product) return;

    cart.push(product);
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        if (cart.length > 0) {
            cartCount.style.display = 'flex';
        }
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #000;
        color: #fff;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', init);
