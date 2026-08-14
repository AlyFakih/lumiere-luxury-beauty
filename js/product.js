// Product Detail Page JavaScript for Lumière Luxury Beauty

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const zoomBtn = document.querySelector('.zoom-btn');
    const view3dBtn = document.querySelector('.view-3d-btn');
    const modal3dViewer = document.querySelector('.modal-3d-viewer');
    const modalZoom = document.querySelector('.modal-zoom');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const addToCartBtn = document.querySelector('.add-to-cart');
    const sizeOptions = document.querySelectorAll('.size-option');
    const colorOptions = document.querySelectorAll('.color-option');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    // Product Gallery & Thumbnails
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Update main image
            const imgSrc = this.getAttribute('data-image');
            mainImage.src = imgSrc;
            mainImage.style.opacity = '0';
            
            // Fade in animation
            setTimeout(() => {
                mainImage.style.opacity = '1';
            }, 10);
        });
    });
    
    // Zoom functionality
    if (zoomBtn) {
        zoomBtn.addEventListener('click', function() {
            modalZoom.classList.add('active');
            zoomedImage.src = mainImage.src;
            document.body.style.overflow = 'hidden';
        });
    }
    
    // 3D View functionality
    if (view3dBtn) {
        view3dBtn.addEventListener('click', function() {
            modal3dViewer.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modal3dViewer.classList.remove('active');
            modalZoom.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target === modal3dViewer || e.target === modalZoom) {
            modal3dViewer.classList.remove('active');
            modalZoom.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Image drag and zoom functionality
    if (zoomedImage) {
        let isDragging = false;
        let startX, startY, initialTranslateX = 0, initialTranslateY = 0;
        let scale = 1;
        
        // Zoom in/out with mouse wheel
        modalZoom.addEventListener('wheel', function(e) {
            e.preventDefault();
            
            if (e.deltaY < 0) {
                // Zoom in (max scale 3)
                scale = Math.min(scale + 0.1, 3);
            } else {
                // Zoom out (min scale 0.5)
                scale = Math.max(scale - 0.1, 0.5);
            }
            
            zoomedImage.style.transform = `translate(${initialTranslateX}px, ${initialTranslateY}px) scale(${scale})`;
        });
        
        // Drag functionality
        zoomedImage.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX - initialTranslateX;
            startY = e.clientY - initialTranslateY;
            zoomedImage.style.cursor = 'grabbing';
        });
        
        modalZoom.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            initialTranslateX = e.clientX - startX;
            initialTranslateY = e.clientY - startY;
            zoomedImage.style.transform = `translate(${initialTranslateX}px, ${initialTranslateY}px) scale(${scale})`;
        });
        
        modalZoom.addEventListener('mouseup', function() {
            isDragging = false;
            zoomedImage.style.cursor = 'grab';
        });
        
        modalZoom.addEventListener('mouseleave', function() {
            isDragging = false;
        });
    }
    
    // Quantity selector
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
                animateButton(this);
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value < 10) {
                quantityInput.value = value + 1;
                animateButton(this);
            }
        });
        
        function animateButton(btn) {
            btn.classList.add('active');
            setTimeout(() => {
                btn.classList.remove('active');
            }, 300);
        }
    }
    
    // Size selector
    if (sizeOptions.length > 0) {
        sizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Color selector
    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update main product image if data-image is set
                const colorImage = this.getAttribute('data-image');
                if (colorImage) {
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = colorImage;
                        mainImage.style.opacity = '1';
                    }, 300);
                }
            });
        });
    }
    
    // Tab navigation
    if (tabBtns.length > 0 && tabPanels.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const target = this.getAttribute('data-tab');
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding tab panel
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === target) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    }
    
    // 3D View rotation controls
    if (viewBtns.length > 0) {
        const product3dModel = document.querySelector('.product-3d-model');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                viewBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const view = this.getAttribute('data-view');
                rotateModel(view);
            });
        });
        
        // Simulated 3D rotation (would be replaced with actual 3D library in production)
        function rotateModel(view) {
            // In a real implementation, this would use three.js or another 3D library
            // For this demo, we'll simulate rotation with CSS transforms
            const placeholder = document.querySelector('.placeholder-3d');
            
            switch(view) {
                case 'front':
                    placeholder.style.transform = 'rotateY(0deg)';
                    break;
                case 'side':
                    placeholder.style.transform = 'rotateY(90deg)';
                    break;
                case 'back':
                    placeholder.style.transform = 'rotateY(180deg)';
                    break;
                case 'top':
                    placeholder.style.transform = 'rotateX(90deg)';
                    break;
            }
        }
        
        // Drag to rotate functionality
        if (product3dModel) {
            let isDragging = false;
            let startX, startY;
            let rotateX = 0, rotateY = 0;
            
            product3dModel.addEventListener('mousedown', function(e) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!isDragging || !modal3dViewer.classList.contains('active')) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                rotateY += deltaX * 0.5;
                rotateX -= deltaY * 0.5;
                
                // Limit rotation on X axis
                rotateX = Math.max(-30, Math.min(30, rotateX));
                
                const placeholder = document.querySelector('.placeholder-3d');
                placeholder.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                
                startX = e.clientX;
                startY = e.clientY;
            });
            
            document.addEventListener('mouseup', function() {
                isDragging = false;
            });
        }
    }
    
    // Add to Cart with animation
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // Create a clone of the product image
            const imgClone = mainImage.cloneNode(true);
            const imgRect = mainImage.getBoundingClientRect();
            const cartIcon = document.querySelector('.cart-toggle');
            const cartRect = cartIcon.getBoundingClientRect();
            
            // Style the clone for animation
            imgClone.style.position = 'fixed';
            imgClone.style.top = `${imgRect.top}px`;
            imgClone.style.left = `${imgRect.left}px`;
            imgClone.style.width = `${imgRect.width}px`;
            imgClone.style.height = `${imgRect.height}px`;
            imgClone.style.objectFit = 'cover';
            imgClone.style.zIndex = '9999';
            imgClone.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            imgClone.style.borderRadius = '0';
            
            // Append clone to body
            document.body.appendChild(imgClone);
            
            // Animate to cart
            setTimeout(() => {
                imgClone.style.width = '20px';
                imgClone.style.height = '20px';
                imgClone.style.top = `${cartRect.top + 10}px`;
                imgClone.style.left = `${cartRect.left + 10}px`;
                imgClone.style.opacity = '0.5';
                imgClone.style.borderRadius = '50%';
                
                // Add to cart count
                const cartCount = document.querySelector('.cart-count');
                const quantity = parseInt(quantityInput.value);
                
                setTimeout(() => {
                    imgClone.remove();
                    cartCount.textContent = parseInt(cartCount.textContent) + quantity;
                    
                    // Cart pulse animation
                    cartIcon.classList.add('pulse-animation');
                    setTimeout(() => {
                        cartIcon.classList.remove('pulse-animation');
                    }, 1000);
                    
                    // Show confirmation message
                    showAddToCartConfirmation();
                }, 800);
            }, 100);
        });
        
        function showAddToCartConfirmation() {
            // Create confirmation message
            const confirmation = document.createElement('div');
            confirmation.className = 'add-to-cart-confirmation';
            
            // Get product details
            const productName = document.querySelector('.product-title').textContent;
            const quantity = parseInt(quantityInput.value);
            
            confirmation.innerHTML = `
                <div class="confirmation-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="confirmation-text">
                    <h4>Added to Bag</h4>
                    <p>${quantity} × ${productName}</p>
                </div>
            `;
            
            // Add to page
            document.body.appendChild(confirmation);
            
            // Show animation
            setTimeout(() => {
                confirmation.classList.add('show');
                
                // Remove after 3 seconds
                setTimeout(() => {
                    confirmation.classList.remove('show');
                    setTimeout(() => {
                        confirmation.remove();
                    }, 500);
                }, 3000);
            }, 100);
        }
    }

    // Product 3D rotation with mouse movement
    function init3DEffect() {
        const mainImageContainer = document.querySelector('.main-image-container');
        if (!mainImageContainer) return;
        
        mainImageContainer.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            const rotateY = deltaX * 15; // Max 15 degrees rotation
            const rotateX = -deltaY * 10; // Max 10 degrees rotation
            
            mainImage.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;
        });
        
        mainImageContainer.addEventListener('mouseleave', function() {
            mainImage.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
        });
    }
    
    // Initialize 3D effect
    init3DEffect();
});
