// Contact button functionality
let widgetOpen = false;

function setupContactButton() {
    const contactBtn = document.getElementById('contactBtn');
    
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const topWidget = document.querySelector('elevenlabs-convai.top-right-widget');
            if (topWidget) {
                if (widgetOpen) {
                    // Close the widget
                    topWidget.classList.remove('show-widget');
                    topWidget.style.display = 'none';
                    widgetOpen = false;
                } else {
                    // Show the widget dialog
                    topWidget.classList.add('show-widget');
                    positionTopWidget();
                    widgetOpen = true;
                }
            }
        });
        
        // Close widget when clicking outside
        document.addEventListener('click', (e) => {
            const topWidget = document.querySelector('elevenlabs-convai.top-right-widget');
            const contactBtn = document.getElementById('contactBtn');
            
            if (!topWidget || !widgetOpen) return;
            
            // Check if click is outside both the widget and contact button
            const clickedOnWidget = topWidget.contains(e.target);
            const clickedOnContactBtn = contactBtn && contactBtn.contains(e.target);
            
            if (!clickedOnWidget && !clickedOnContactBtn) {
                topWidget.classList.remove('show-widget');
                topWidget.style.display = 'none';
                widgetOpen = false;
            }
        });
    }
}

// Position top-right ElevenLabs widget
function positionTopWidget() {
    const topWidget = document.querySelector('elevenlabs-convai.top-right-widget');
    if (topWidget) {
        topWidget.style.cssText = `
            display: block !important;
            position: fixed !important;
            top: 80px !important;
            right: 100px !important;
            bottom: auto !important;
            left: auto !important;
            z-index: 9999 !important;
            overflow: visible !important;
        `;
        
        // Also try to style shadow DOM elements
        const shadowRoot = topWidget.shadowRoot;
        if (shadowRoot) {
            // Check if style already added
            if (!shadowRoot.querySelector('#custom-position-style')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'custom-position-style';
                styleEl.textContent = `
                    :host {
                        position: fixed !important;
                        top: 80px !important;
                        right: 100px !important;
                        bottom: auto !important;
                        left: auto !important;
                        overflow: visible !important;
                    }
                    div, * {
                        overflow: visible !important;
                    }
                `;
                shadowRoot.appendChild(styleEl);
            }
        }
    }
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function setupHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.background = 'rgba(28, 30, 33, 0.98)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--primary-dark)';
            header.style.backdropFilter = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// Product Modal Functions
function showProductDetails(name, gen, price, description) {
    const modal = document.getElementById('productModal');
    const modalName = document.getElementById('modalName');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    
    if (modal && modalName && modalPrice && modalDesc) {
        modalName.textContent = `${name} (${gen})`;
        modalPrice.textContent = price;
        modalDesc.textContent = description;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupContactButton();
    setupSmoothScroll();
    setupHeaderScroll();
});
