// Animations for Lumière Luxury Beauty E-commerce Website

// DOM Elements
const heroProducts = document.querySelectorAll('.floating-product');
const shimmerOverlay = document.querySelector('.shimmer-overlay');

// 3D Tilt Effect for Products
function init3DTilt() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            // Limiting the tilt amount
            const tiltX = deltaY * 10;
            const tiltY = -deltaX * 10;
            
            // Apply the transform
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Parallax Effect for Hero Products
function initParallax() {
    window.addEventListener('mousemove', e => {
        if (!heroProducts.length) return;
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        heroProducts.forEach((product, index) => {
            // Different offsets for each product for more dynamic effect
            const offsetX = 25 * (index + 1) * (mouseX - 0.5);
            const offsetY = 10 * (index + 1) * (mouseY - 0.5);
            
            product.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate3d(${1 + index * 0.2}, ${1 - index * 0.1}, ${1}, ${5 + index}deg)`;
        });
        
        // Move shimmer with mouse
        if (shimmerOverlay) {
            shimmerOverlay.style.backgroundPosition = `${mouseX * 100}% ${mouseY * 100}%`;
        }
    });
}

// Scroll Reveal Animation
function initScrollReveal() {
    const sections = document.querySelectorAll('section');
    const options = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    sections.forEach(section => {
        section.classList.add('reveal-section');
        observer.observe(section);
    });
}

// Particles/Sparkle Effect
function createSparkles() {
    if (document.querySelector('.hero')) {
        const sparkleContainer = document.createElement('div');
        sparkleContainer.classList.add('sparkle-container');
        document.querySelector('.hero').appendChild(sparkleContainer);
        
        for (let i = 0; i < 15; i++) {
            createSparkle(sparkleContainer);
        }
        
        // Create new sparkles periodically
        setInterval(() => {
            if (sparkleContainer.childElementCount < 20) {
                createSparkle(sparkleContainer);
            }
        }, 800);
    }
}

function createSparkle(container) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    
    // Random position
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const size = Math.random() * 8 + 2;
    
    sparkle.style.left = `${left}%`;
    sparkle.style.top = `${top}%`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    
    // Random animation duration
    const duration = Math.random() * 3 + 2;
    sparkle.style.animationDuration = `${duration}s`;
    
    container.appendChild(sparkle);
    
    // Remove after animation is complete
    setTimeout(() => {
        sparkle.remove();
    }, duration * 1000);
}

// Carousel Auto Rotation
function initCarouselAutoRotation() {
    const carousel = document.querySelector('.product-carousel');
    if (!carousel) return;
    
    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollInterval = 30;
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(autoScroll, scrollInterval);
    });
    
    function autoScroll() {
        scrollAmount += scrollStep;
        
        // Reset when we reach the end
        if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
            scrollAmount = 0;
        }
        
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'auto'
        });
    }
    
    let autoScrollInterval = setInterval(autoScroll, scrollInterval);
}

// Animated Counter for Number Stats
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (!counters.length) return;
    
    const options = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetNumber = parseInt(target.getAttribute('data-target'));
                let count = 0;
                const duration = 3000; // ms
                const interval = 50; // ms
                const increment = Math.ceil(targetNumber / (duration / interval));
                
                const counter = setInterval(() => {
                    count += increment;
                    
                    if (count >= targetNumber) {
                        target.innerText = targetNumber.toLocaleString();
                        clearInterval(counter);
                    } else {
                        target.innerText = count.toLocaleString();
                    }
                }, interval);
                
                observer.unobserve(target);
            }
        });
    }, options);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Init Mouse Position for Hover Effects
function initMousePosition() {
    const collectionCards = document.querySelectorAll('.collection-card');
    
    if (!collectionCards.length) return;
    
    collectionCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate percentage
            const mouseX = Math.round(x / rect.width * 100);
            const mouseY = Math.round(y / rect.height * 100);
            
            // Subtle parallax effect on the image
            const img = card.querySelector('img');
            if (img) {
                img.style.transform = `translate(${(mouseX - 50) * 0.05}%, ${(mouseY - 50) * 0.05}%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const img = card.querySelector('img');
            if (img) {
                img.style.transform = 'translate(0, 0)';
            }
        });
    });
}

// Pulse Animation for Add to Cart Button
function addPulseAnimationCSS() {
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(139, 105, 20, 0.5);
            }
            70% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(139, 105, 20, 0);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(139, 105, 20, 0);
            }
        }
        
        .pulse-animation {
            animation: pulse 1s ease-in-out;
        }
        
        .sparkle-container {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 2;
        }
        
        .sparkle {
            position: absolute;
            background: white;
            border-radius: 50%;
            opacity: 0;
            animation: sparkle-animation linear forwards;
        }
        
        @keyframes sparkle-animation {
            0% {
                opacity: 0;
                transform: scale(0);
            }
            20% {
                opacity: 1;
                transform: scale(1);
            }
            80% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0);
            }
        }
        
        .reveal-section {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Mobile Nav Animation */
        .mobile-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(26, 26, 26, 0.95);
            z-index: 2000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.5s ease;
            backdrop-filter: blur(5px);
        }
        
        .mobile-nav.active {
            opacity: 1;
            visibility: visible;
        }
        
        .mobile-nav-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 2rem;
        }
        
        .mobile-nav-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .mobile-nav-header .logo {
            font-family: var(--font-serif);
            font-size: 1.8rem;
            color: white;
        }
        
        .close-mobile-nav {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .mobile-nav-content {
            flex: 1;
        }
        
        .mobile-nav-links {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .mobile-nav-links a {
            color: white;
            font-size: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .mobile-dropdown {
            position: relative;
        }
        
        .mobile-dropdown-content {
            display: none;
            margin-top: 1rem;
            margin-left: 1rem;
        }
        
        .mobile-dropdown.active .mobile-dropdown-content {
            display: block;
        }
        
        .mobile-dropdown-content li {
            margin-bottom: 1rem;
        }
        
        .mobile-dropdown-content a {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Initialize all animations
function initAllAnimations() {
    addPulseAnimationCSS();
    init3DTilt();
    initParallax();
    initScrollReveal();
    createSparkles();
    initCounters();
    initMousePosition();
    
    // Don't auto-rotate on small screens
    if (window.innerWidth > 768) {
        initCarouselAutoRotation();
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initAllAnimations);
