// ============================================================================
// Main JavaScript for Lumière Luxury Beauty E-commerce Website
// Enhanced with accessibility, performance, and UX improvements
// ============================================================================

// DOM Elements
const body = document.body;
const mainNav = document.querySelector('.main-nav');
const searchToggle = document.querySelector('.search-toggle');
const searchContainer = document.querySelector('.search-container');
const cartToggle = document.querySelector('.cart-toggle');
const cartSidebar = document.querySelector('.cart-sidebar');
const closeCart = document.querySelector('.close-cart');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
const productCarousel = document.querySelector('.product-carousel');
const prevButton = document.querySelector('.prev-btn');
const nextButton = document.querySelector('.next-btn');
const customCursor = document.querySelector('.custom-cursor');
const pageTransition = document.querySelector('.page-transition');
const newsletterForm = document.querySelector('.newsletter-form');
const dropdownMenus = document.querySelectorAll('.dropdown');

// Cart state
let cart = getFromStorage('lumiereCart', []);
let cartCount = document.querySelector('.cart-count');
let cartFocusTrap = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initializeCustomCursor();
    initializeStickyNavigation();
    initializeSearch();
    initializeCart();
    initializeProductCarousel();
    initializeAddToCart();
    initializeDropdownMenus();
    initializeMobileMenu();
    initializeFormValidation();
    
    // Load lazy images
    initLazyLoading();
});

// ============================================================================
// CUSTOM CURSOR - OPTIMIZED WITH THROTTLE
// ============================================================================

let mouseMoveHandler;

function initializeCustomCursor() {
    if (!customCursor) return;
    
    // Check for touch device - disable custom cursor on touch
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        // Use throttled mousemove for better performance
        mouseMoveHandler = throttle((e) => {
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
        }, 16); // ~60fps
        
        document.addEventListener('mousemove', mouseMoveHandler);
    }

    document.addEventListener('mouseenter', () => {
        if (customCursor && matchMedia('(hover: hover) and (pointer: fine)').matches) {
            customCursor.style.opacity = 1;
        }
    });

    document.addEventListener('mouseleave', () => {
        if (customCursor) {
            customCursor.style.opacity = 0;
        }
    });

    // Custom cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .product-card, .collection-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (customCursor) {
                customCursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                customCursor.style.border = '1px solid var(--color-primary)';
                customCursor.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (customCursor) {
                customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                customCursor.style.border = '2px solid var(--color-primary)';
                customCursor.style.backgroundColor = 'transparent';
            }
        });
    });
}

// ============================================================================
// STICKY NAVIGATION
// ============================================================================

function initializeStickyNavigation() {
    const stickyHandler = throttle(() => {
        if (window.scrollY > 50) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    }, 100);
    
    window.addEventListener('scroll', stickyHandler);
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

function initializeSearch() {
    if (!searchToggle) return;

    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        searchContainer.classList.toggle('active');
        searchToggle.setAttribute('aria-expanded', 
            searchContainer.classList.contains('active') ? 'true' : 'false');
        
        if (searchContainer.classList.contains('active')) {
            const searchInput = searchContainer.querySelector('input');
            searchInput?.focus();
        }
    });

    // Close search when clicked outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && searchContainer.classList.contains('active')) {
            searchContainer.classList.remove('active');
            searchToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close search on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
            searchContainer.classList.remove('active');
            searchToggle.setAttribute('aria-expanded', 'false');
            searchToggle.focus();
        }
    });
}

// ============================================================================
// CART FUNCTIONALITY
// ============================================================================

function initializeCart() {
    if (!cartToggle || !cartSidebar) return;

    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        // Set up focus trap
        if (!cartFocusTrap) {
            cartFocusTrap = new FocusTrap(cartSidebar);
        }
        cartFocusTrap.activate();
        
        updateCartItems();
    });

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            closeCartSidebar();
        });
    }

    // Close cart on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
            closeCartSidebar();
        }
    });
    
    // Close cart when clicking overlay
    cartSidebar.addEventListener('click', (e) => {
        if (e.target === cartSidebar) {
            closeCartSidebar();
        }
    });
}

function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    cartToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    
    if (cartFocusTrap) {
        cartFocusTrap.deactivate();
    }
    
    cartToggle.focus();
}

// Update cart items display
function updateCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalAmount = document.querySelector('.subtotal-amount');
    
    if (!cartItemsContainer) return;
    
    // Clear current items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-shopping-bag"></i></div>
                <div class="empty-state-title">Your bag is empty</div>
                <p class="empty-state-message">Start shopping to add items to your bag</p>
            </div>
        `;
        subtotalAmount.textContent = '$0.00';
        return;
    }
    
    // Calculate subtotal
    let subtotal = 0;
    
    // Add cart items
    cart.forEach((item, index) => {
        const itemPrice = parseFloat(item.price.replace('$', ''));
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('role', 'article');
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="item-price" aria-label="Price">${item.price}</p>
                <div class="item-quantity" role="group" aria-label="Quantity">
                    <button class="quantity-btn minus" data-index="${index}" aria-label="Decrease quantity">−</button>
                    <span class="quantity-display" aria-live="polite">${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}" aria-label="Increase quantity">+</button>
                </div>
            </div>
            <button class="remove-item" data-index="${index}" aria-label="Remove ${item.name} from cart">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Update subtotal
    subtotalAmount.textContent = '$' + subtotal.toFixed(2);
    
    // Add event listeners to quantity buttons
    const plusButtons = document.querySelectorAll('.quantity-btn.plus');
    const minusButtons = document.querySelectorAll('.quantity-btn.minus');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    plusButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            cart[index].quantity += 1;
            setToStorage('lumiereCart', cart);
            updateCartItems();
            updateCartCount();
            showToast(`${cart[index].name} quantity updated`, 'info', 2000);
        });
    });
    
    minusButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                const itemName = cart[index].name;
                cart.splice(index, 1);
                showToast(`${itemName} removed from bag`, 'info', 2000);
            }
            setToStorage('lumiereCart', cart);
            updateCartItems();
            updateCartCount();
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            const itemName = cart[index].name;
            cart.splice(index, 1);
            setToStorage('lumiereCart', cart);
            updateCartItems();
            updateCartCount();
            showToast(`${itemName} removed from bag`, 'info', 2000);
        });
    });
}

// Update cart count badge
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = count;
    }
}

// ============================================================================
// PRODUCT CAROUSEL NAVIGATION
// ============================================================================

function initializeProductCarousel() {
    if (!productCarousel || !prevButton || !nextButton) return;

    let currentPosition = 0;
    const cardWidth = 340; // Width including gap

    prevButton.addEventListener('click', () => {
        currentPosition = Math.min(currentPosition + cardWidth, 0);
        productCarousel.style.transform = `translateX(${currentPosition}px)`;
        productCarousel.style.transition = 'transform 0.6s ease-out';
    });

    nextButton.addEventListener('click', () => {
        const carouselWidth = productCarousel.scrollWidth;
        const visibleWidth = productCarousel.offsetWidth;
        const maxPosition = -(carouselWidth - visibleWidth);
        
        currentPosition = Math.max(currentPosition - cardWidth, maxPosition);
        productCarousel.style.transform = `translateX(${currentPosition}px)`;
        productCarousel.style.transition = 'transform 0.6s ease-out';
    });
    
    // Keyboard navigation for carousel
    prevButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            prevButton.click();
        }
    });
    
    nextButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            nextButton.click();
        }
    });
}

// ============================================================================
// ADD TO CART FUNCTIONALITY
// ============================================================================

function initializeAddToCart() {
    if (addToCartButtons.length === 0) return;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const card = e.target.closest('.product-card');
            if (!card) return;
            
            const productName = card.querySelector('h3').textContent;
            const productPrice = card.querySelector('.product-price').textContent;
            const productImage = card.querySelector('img').getAttribute('src');
            
            // Check if product already in cart
            const existingProductIndex = cart.findIndex(item => item.name === productName);
            
            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1;
                showToast(`${productName} quantity updated`, 'info', 2000);
            } else {
                const product = {
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                };
                cart.push(product);
                showToast(`${productName} added to bag!`, 'success', 2000);
            }
            
            // Update local storage
            setToStorage('lumiereCart', cart);
            
            // Update cart count
            updateCartCount();
            
            // Show add to cart animation
            showAddToCartAnimation(card, button);
        });
    });
}

// Add to cart animation
function showAddToCartAnimation(card, button) {
    // Create a loading state on button
    const originalText = button.textContent;
    const loadingButton = new LoadingButton(button);
    loadingButton.setLoading(true);
    
    // Create a clone of the product image
    const img = card.querySelector('img');
    const imgClone = img.cloneNode(true);
    
    // Position the clone
    const imgRect = img.getBoundingClientRect();
    const cartRect = cartToggle.getBoundingClientRect();
    
    imgClone.style.position = 'fixed';
    imgClone.style.top = imgRect.top + 'px';
    imgClone.style.left = imgRect.left + 'px';
    imgClone.style.width = imgRect.width + 'px';
    imgClone.style.height = imgRect.height + 'px';
    imgClone.style.zIndex = '1000';
    imgClone.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    document.body.appendChild(imgClone);
    
    // Animate the clone to the cart
    requestAnimationFrame(() => {
        imgClone.style.top = cartRect.top + 'px';
        imgClone.style.left = cartRect.left + 'px';
        imgClone.style.width = '40px';
        imgClone.style.height = '40px';
        imgClone.style.opacity = '0.5';
        imgClone.style.borderRadius = '50%';
    });
    
    // Remove the clone and reset button
    setTimeout(() => {
        imgClone.remove();
        loadingButton.reset();
        
        // Create a pulsing effect on the cart
        cartToggle.classList.add('pulse-animation');
        setTimeout(() => {
            cartToggle.classList.remove('pulse-animation');
        }, 600);
    }, 800);
}

// ============================================================================
// DROPDOWN MENUS & KEYBOARD NAVIGATION
// ============================================================================

function initializeDropdownMenus() {
    dropdownMenus.forEach(menu => {
        const trigger = menu.querySelector('a');
        const content = menu.querySelector('.dropdown-content');
        
        if (!trigger || !content) return;
        
        // Open/close with click
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = menu.classList.contains('active');
            closeAllDropdowns();
            
            if (!isOpen) {
                menu.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                menu.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
                trigger.focus();
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });
}

function closeAllDropdowns() {
    dropdownMenus.forEach(menu => {
        const trigger = menu.querySelector('a');
        menu.classList.remove('active');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================================================
// MOBILE MENU
// ============================================================================

function initializeMobileMenu() {
    if (!mobileMenuToggle) return;

    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const isOpen = navLinks.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    
    // Close mobile menu on link click
    const mobileLinks = navLinks.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            // Real-time validation on blur
            field.addEventListener('blur', () => {
                validateField(field);
            });
            
            // Clear error on focus
            field.addEventListener('focus', () => {
                field.classList.remove('field-error');
                const errorEl = field.nextElementSibling;
                if (errorEl && errorEl.classList.contains('error-message')) {
                    errorEl.style.display = 'none';
                }
            });
        });
        
        // Form submission validation
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
                showToast('Please fix the errors in the form', 'error', 3000);
            } else {
                showToast('Form submitted successfully!', 'success', 2000);
            }
        });
    });
}

// Page transitions
function initPageTransitions() {
    // Page enter animation
    window.addEventListener('load', () => {
        document.body.classList.add('page-loaded');
    });
    
    // Page exit animation
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.indexOf('#') !== 0 && href.indexOf('mailto:') !== 0 && href.indexOf('tel:') !== 0) {
                e.preventDefault();
                
                pageTransition.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });
}

// Initialize page transitions
initPageTransitions();

// Newsletter form
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        if (!email) return;
        
        // Simulate form submission
        const button = newsletterForm.querySelector('button');
        button.textContent = 'Subscribing...';
        button.disabled = true;
        
        setTimeout(() => {
            // Show success message
            newsletterForm.innerHTML = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>Thank you for subscribing!</h3>
                    <p>You'll receive our next newsletter soon.</p>
                </div>
            `;
        }, 1500);
    });
}

// Mobile menu
if (mobileMenuToggle) {
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    
    mobileNav.innerHTML = `
        <div class="mobile-nav-container">
            <div class="mobile-nav-header">
                <div class="logo">Lumière</div>
                <button class="close-mobile-nav">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mobile-nav-content">
                <ul class="mobile-nav-links">
                    <li class="mobile-dropdown">
                        <a href="#" class="mobile-dropdown-toggle">Shop <i class="fas fa-chevron-down"></i></a>
                        <ul class="mobile-dropdown-content">
                            <li><a href="pages/category.html?category=makeup">Makeup</a></li>
                            <li><a href="pages/category.html?category=skincare">Skincare</a></li>
                            <li><a href="pages/category.html?category=fragrance">Fragrance</a></li>
                            <li><a href="pages/category.html?category=tools">Tools</a></li>
                        </ul>
                    </li>
                    <li><a href="pages/about.html">About</a></li>
                    <li><a href="pages/tutorials.html">Tutorials</a></li>
                </ul>
            </div>
        </div>
    `;
    
    document.body.appendChild(mobileNav);
    
    const closeMobileNav = document.querySelector('.close-mobile-nav');
    const mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
    
    mobileMenuToggle.addEventListener('click', () => {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeMobileNav.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    if (mobileDropdownToggle) {
        mobileDropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            mobileDropdownToggle.parentElement.classList.toggle('active');
        });
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    updateCartItems();
});
