// Category Page JavaScript for Lumière Luxury Beauty

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const filterTitles = document.querySelectorAll('.filter-title');
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    const priceSliders = document.querySelectorAll('.price-slider input');
    const sortSelect = document.getElementById('sort-select');
    const productGrid = document.querySelector('.product-grid');
    const productCards = document.querySelectorAll('.product-card');
    const productCountEl = document.getElementById('product-count');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    const loadingAnimation = document.querySelector('.loading-animation');
    
    // Mobile Filter Toggle
    const filterSidebar = document.querySelector('.filter-sidebar');
    const filterMobileToggle = document.createElement('button');
    filterMobileToggle.className = 'filter-mobile-toggle';
    filterMobileToggle.innerHTML = '<i class="fas fa-filter"></i> Show Filters';
    
    if (window.innerWidth <= 992) {
        productGrid.parentNode.insertBefore(filterMobileToggle, productGrid);
        
        filterMobileToggle.addEventListener('click', function() {
            filterSidebar.classList.toggle('active');
            this.innerHTML = filterSidebar.classList.contains('active') 
                ? '<i class="fas fa-times"></i> Hide Filters' 
                : '<i class="fas fa-filter"></i> Show Filters';
        });
    }
    
    // Filter Toggle
    filterTitles.forEach(title => {
        title.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const options = this.nextElementSibling;
            options.style.display = this.classList.contains('collapsed') ? 'none' : 'flex';
        });
    });
    
    // Filter Products
    let activeFilters = {
        categories: [],
        types: [],
        priceMin: 0,
        priceMax: 200
    };
    
    // Initialize Price Range
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceMinDisplay = document.querySelector('.price-min');
    const priceMaxDisplay = document.querySelector('.price-max');
    
    priceMin.addEventListener('input', function() {
        const min = parseInt(this.value);
        const max = parseInt(priceMax.value);
        
        if (min >= max) {
            this.value = max - 10;
            return;
        }
        
        priceMinDisplay.textContent = '$' + min;
        activeFilters.priceMin = min;
        filterProducts();
    });
    
    priceMax.addEventListener('input', function() {
        const max = parseInt(this.value);
        const min = parseInt(priceMin.value);
        
        if (max <= min) {
            this.value = min + 10;
            return;
        }
        
        priceMaxDisplay.textContent = max >= 200 ? '$200+' : '$' + max;
        activeFilters.priceMax = max;
        filterProducts();
    });
    
    // Filter by checkbox change
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const value = this.value;
            const isChecked = this.checked;
            
            // Determine if category or type
            if (['makeup', 'skincare', 'fragrance', 'tools'].includes(value)) {
                if (isChecked) {
                    activeFilters.categories.push(value);
                } else {
                    activeFilters.categories = activeFilters.categories.filter(cat => cat !== value);
                }
            } else {
                if (isChecked) {
                    activeFilters.types.push(value);
                } else {
                    activeFilters.types = activeFilters.types.filter(type => type !== value);
                }
            }
            
            filterProducts();
        });
    });
    
    // Clear all filters
    clearFiltersBtn.addEventListener('click', function() {
        // Reset checkboxes
        filterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset price sliders
        priceMin.value = 0;
        priceMax.value = 200;
        priceMinDisplay.textContent = '$0';
        priceMaxDisplay.textContent = '$200+';
        
        // Reset active filters
        activeFilters = {
            categories: [],
            types: [],
            priceMin: 0,
            priceMax: 200
        };
        
        // Reset sort
        sortSelect.value = 'featured';
        
        // Show all products with animation
        showLoadingAnimation();
        
        setTimeout(() => {
            filterProducts();
            hideLoadingAnimation();
        }, 800);
    });
    
    // Sort products
    sortSelect.addEventListener('change', function() {
        const value = this.value;
        sortProducts(value);
    });
    
    function sortProducts(sortBy) {
        showLoadingAnimation();
        
        setTimeout(() => {
            const products = Array.from(productGrid.children);
            
            products.sort((a, b) => {
                switch(sortBy) {
                    case 'price-low':
                        return parseInt(a.dataset.price) - parseInt(b.dataset.price);
                    case 'price-high':
                        return parseInt(b.dataset.price) - parseInt(a.dataset.price);
                    case 'newest':
                        // For demo, we'll use random sorting to simulate newest
                        return 0.5 - Math.random();
                    case 'bestselling':
                        // For demo, we'll use random sorting to simulate bestselling
                        return 0.5 - Math.random();
                    default:
                        // featured - keep original order
                        return 0;
                }
            });
            
            // Re-append sorted products
            productGrid.innerHTML = '';
            products.forEach(product => {
                if (!product.classList.contains('hidden')) {
                    productGrid.appendChild(product);
                }
            });
            
            hideLoadingAnimation();
        }, 800);
    }
    
    function filterProducts() {
        showLoadingAnimation();
        
        setTimeout(() => {
            let visibleCount = 0;
            
            productCards.forEach(card => {
                const category = card.dataset.category;
                const type = card.dataset.type;
                const price = parseInt(card.dataset.price);
                
                const matchesCategory = activeFilters.categories.length === 0 || activeFilters.categories.includes(category);
                const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(type);
                const matchesPrice = price >= activeFilters.priceMin && price <= activeFilters.priceMax;
                
                if (matchesCategory && matchesType && matchesPrice) {
                    card.style.display = 'block';
                    fadeIn(card);
                    visibleCount++;
                } else {
                    fadeOut(card);
                }
            });
            
            // Update count
            productCountEl.textContent = visibleCount;
            
            hideLoadingAnimation();
        }, 800);
    }
    
    // Loading animation
    function showLoadingAnimation() {
        loadingAnimation.style.display = 'flex';
        productGrid.style.opacity = '0.5';
    }
    
    function hideLoadingAnimation() {
        loadingAnimation.style.display = 'none';
        productGrid.style.opacity = '1';
    }
    
    // Fade animations
    function fadeIn(element) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const timer = setInterval(() => {
            if (opacity >= 1) {
                clearInterval(timer);
            }
            element.style.opacity = opacity;
            opacity += 0.1;
        }, 30);
    }
    
    function fadeOut(element) {
        let opacity = 1;
        const timer = setInterval(() => {
            if (opacity <= 0) {
                clearInterval(timer);
                element.style.display = 'none';
            }
            element.style.opacity = opacity;
            opacity -= 0.1;
        }, 30);
    }
    
    // Pagination
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            paginationBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show loading animation
            showLoadingAnimation();
            
            // Simulate page change
            setTimeout(() => {
                window.scrollTo({
                    top: document.querySelector('.product-content').offsetTop - 100,
                    behavior: 'smooth'
                });
                
                hideLoadingAnimation();
            }, 800);
        });
    });
    
    // Quick View Functionality
    const quickViewBtns = document.querySelectorAll('.btn-quick-view');
    
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productCard = this.closest('.product-card');
            const productImg = productCard.querySelector('img').getAttribute('src');
            const productName = productCard.querySelector('h3').textContent;
            const productCategory = productCard.querySelector('.product-category').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            createQuickViewModal(productImg, productName, productCategory, productPrice);
        });
    });
    
    function createQuickViewModal(img, name, category, price) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal"><i class="fas fa-times"></i></button>
                <div class="modal-product">
                    <div class="modal-product-image">
                        <img src="${img}" alt="${name}">
                    </div>
                    <div class="modal-product-info">
                        <h2>${name}</h2>
                        <p class="product-category">${category}</p>
                        <p class="product-price">${price}</p>
                        <div class="product-description">
                            <p>This luxurious ${category.toLowerCase()} is crafted with the finest ingredients to deliver exceptional results. Experience the transformative power of our premium beauty products.</p>
                        </div>
                        <div class="product-options">
                            <div class="quantity-selector">
                                <button class="quantity-btn minus">-</button>
                                <input type="number" value="1" min="1" max="10">
                                <button class="quantity-btn plus">+</button>
                            </div>
                            <button class="btn btn-primary add-to-cart-btn">Add to Bag</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            
            setTimeout(() => {
                modal.remove();
            }, 500);
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                
                setTimeout(() => {
                    modal.remove();
                }, 500);
            }
        });
        
        // Quantity selector
        const minusBtn = modal.querySelector('.quantity-btn.minus');
        const plusBtn = modal.querySelector('.quantity-btn.plus');
        const quantityInput = modal.querySelector('.quantity-selector input');
        
        minusBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value < 10) {
                quantityInput.value = value + 1;
            }
        });
        
        // Add to cart
        const addToCartBtn = modal.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            
            // Add to cart functionality would go here
            console.log(`Added ${quantity} ${name} to cart`);
            
            // Close modal
            modal.classList.remove('active');
            
            setTimeout(() => {
                modal.remove();
                
                // Update cart count
                const cartCount = document.querySelector('.cart-count');
                cartCount.textContent = parseInt(cartCount.textContent) + quantity;
                
                // Show animation
                cartCount.classList.add('pulse-animation');
                setTimeout(() => {
                    cartCount.classList.remove('pulse-animation');
                }, 1000);
            }, 500);
        });
    }
    
    // URL parameter handling
    function handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const collection = urlParams.get('collection');
        
        if (category) {
            // Update page title
            document.querySelector('.category-title').textContent = formatCategoryName(category);
            
            // Check the corresponding checkbox
            const checkbox = document.getElementById(getCategoryParent(category));
            if (checkbox) {
                checkbox.checked = true;
                activeFilters.categories.push(getCategoryParent(category));
                
                // Also add the specific type if applicable
                if (!['makeup', 'skincare', 'fragrance', 'tools'].includes(category)) {
                    const typeCheckbox = document.getElementById(category);
                    if (typeCheckbox) {
                        typeCheckbox.checked = true;
                        activeFilters.types.push(category);
                    }
                }
                
                filterProducts();
            }
        }
        
        if (collection) {
            // Update page title
            document.querySelector('.category-title').textContent = formatCollectionName(collection);
            
            // We would ideally have a collection tag on products
            // For demo, we'll just show all products
        }
    }
    
    function formatCategoryName(category) {
        // Convert category-name to Category Name
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    function formatCollectionName(collection) {
        // Convert collection-name to Collection Name
        return collection
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') + ' Collection';
    }
    
    function getCategoryParent(category) {
        // Map subcategories to their parent categories
        const categoryMap = {
            'face': 'makeup',
            'eyes': 'makeup',
            'lips': 'makeup',
            'cheeks': 'makeup',
            'cleansers': 'skincare',
            'moisturizers': 'skincare',
            'serums': 'skincare',
            'masks': 'skincare',
            'perfume': 'fragrance',
            'cologne': 'fragrance',
            'body-mist': 'fragrance',
            'gift-sets': 'fragrance',
            'brushes': 'tools',
            'sponges': 'tools',
            'applicators': 'tools',
            'cases': 'tools'
        };
        
        return categoryMap[category] || category;
    }
    
    // Initialize
    handleUrlParams();
});
