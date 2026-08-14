/* Tutorials Page JavaScript for Lumière Luxury Beauty */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initAnimations();

    // Initialize video modals
    initVideoModals();

    // Initialize category navigation
    initCategoryNavigation();

    // Initialize tutorial filtering
    initTutorialFiltering();

    // Initialize tips slider
    initTipsSlider();

    // Initialize custom cursor
    initCustomCursor();
});

// Handle animations on scroll
function initAnimations() {
    // Select elements to animate
    const fadeElements = document.querySelectorAll('.fade-in');
    const revealTextElements = document.querySelectorAll('.reveal-text');

    // Create intersection observer for animation triggers
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.style.animation = 'fadeIn 1s ease forwards';
                } else if (entry.target.classList.contains('reveal-text')) {
                    entry.target.style.animation = 'none';
                    void entry.target.offsetWidth; // Trigger reflow
                    entry.target.style.animation = 'reveal 1.5s ease forwards';
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe all animation elements
    fadeElements.forEach(element => observer.observe(element));
    revealTextElements.forEach(element => observer.observe(element));

    // Add animation delay to stagger fade-in elements
    fadeElements.forEach((element, index) => {
        element.style.animationDelay = `${0.2 * (index % 3) + 0.3}s`;
    });

    // Add hover animations to tutorial cards
    const tutorialCards = document.querySelectorAll('.tutorial-card');
    tutorialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.play-icon').style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('.play-icon').style.opacity = '0';
        });
    });
}

// Handle video modals
function initVideoModals() {
    const videoModal = document.querySelector('.video-modal');
    const modalIframe = videoModal.querySelector('iframe');
    const closeModalBtn = videoModal.querySelector('.close-modal');
    const videoTriggers = document.querySelectorAll('.video-thumbnail, .play-icon, .tutorial-thumbnail');

    // Sample video URLs (would be replaced with actual video URLs in production)
    const videoUrls = {
        featured: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1', // Replace with actual featured video
        tutorial1: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1', // Replace with actual tutorial videos
        tutorial2: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        tutorial3: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
    };

    // Open modal with featured video
    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Determine which video to play
            let videoUrl = videoUrls.featured; // Default to featured
            
            // If triggered from a tutorial card, get the appropriate video
            const tutorialCard = this.closest('.tutorial-card');
            if (tutorialCard) {
                const index = Array.from(document.querySelectorAll('.tutorial-card')).indexOf(tutorialCard);
                videoUrl = videoUrls[`tutorial${index + 1}`] || videoUrls.featured;
            }
            
            // Set iframe src and open modal
            modalIframe.setAttribute('src', videoUrl);
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close modal
    closeModalBtn.addEventListener('click', function() {
        videoModal.classList.remove('active');
        modalIframe.setAttribute('src', ''); // Stop the video
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal when clicking outside
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            videoModal.classList.remove('active');
            modalIframe.setAttribute('src', '');
            document.body.style.overflow = '';
        }
    });
}

// Handle category navigation
function initCategoryNavigation() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            categoryCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Get selected category
            const category = this.dataset.category;
            
            // Update tutorials section title
            document.querySelector('.tutorials-header h2').textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Tutorials`;
            
            // Scroll to tutorials section
            document.getElementById(category).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add animation to tutorials grid
            const tutorialsGrid = document.querySelector('.tutorials-grid');
            tutorialsGrid.style.opacity = '0';
            tutorialsGrid.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                tutorialsGrid.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                tutorialsGrid.style.opacity = '1';
                tutorialsGrid.style.transform = 'translateY(0)';
            }, 300);
        });
    });
}

// Handle tutorial filtering
function initTutorialFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tutorialCards = document.querySelectorAll('.tutorial-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Get selected filter
            const filter = this.dataset.filter;
            
            // Filter tutorials
            tutorialCards.forEach(card => {
                if (filter === 'all' || card.dataset.difficulty === filter) {
                    card.style.display = 'block';
                    // Add staggered fade-in animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100 * Array.from(tutorialCards).indexOf(card) % 6);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Add click handler for Load More button
    const loadMoreBtn = document.querySelector('.load-more .btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more tutorials
            this.innerHTML = '<span class="loading"></span> Loading...';
            
            setTimeout(() => {
                // In a real application, this would fetch more tutorials from the server
                this.textContent = 'No More Tutorials';
                this.disabled = true;
                this.style.opacity = '0.6';
                this.style.cursor = 'not-allowed';
            }, 1500);
        });
    }
}

// Handle tips slider
function initTipsSlider() {
    const slides = document.querySelectorAll('.tip-slide');
    const dots = document.querySelectorAll('.tip-dots .dot');
    const prevBtn = document.querySelector('.tip-prev');
    const nextBtn = document.querySelector('.tip-next');
    let currentIndex = 0;
    let slideWidth = slides[0].offsetWidth;
    let slidesContainer = document.querySelector('.tips-slider');
    
    // Set initial position
    updateSlider();
    
    // Update slider on window resize
    window.addEventListener('resize', () => {
        slideWidth = slides[0].offsetWidth;
        updateSlider();
    });
    
    // Previous slide
    prevBtn.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - 1);
        updateSlider();
    });
    
    // Next slide
    nextBtn.addEventListener('click', () => {
        currentIndex = Math.min(slides.length - 1, currentIndex + 1);
        updateSlider();
    });
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });
    
    // Update slider position and active dot
    function updateSlider() {
        // Calculate the transform value based on current index and viewport width
        let transformValue;
        
        // For mobile (1 slide visible)
        if (window.innerWidth <= 768) {
            transformValue = -currentIndex * slideWidth;
        } 
        // For tablet (2 slides visible)
        else if (window.innerWidth <= 992) {
            transformValue = -currentIndex * slideWidth / 2;
        } 
        // For desktop (3 slides visible)
        else {
            transformValue = -currentIndex * slideWidth / 3;
        }
        
        // Update slider position
        slidesContainer.style.transform = `translateX(${transformValue}px)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        // Update button states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === slides.length - 1;
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex === slides.length - 1 ? '0.5' : '1';
    }
}

// Handle custom cursor
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Add special cursor effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .tutorial-card, .category-card, .instagram-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-active');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-active');
        });
    });
    
    // Add zoom cursor effect for video thumbnails
    const videoElements = document.querySelectorAll('.video-thumbnail, .play-icon, .tutorial-thumbnail');
    
    videoElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-zoom');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-zoom');
        });
    });
}

// Handle page transitions
window.addEventListener('beforeunload', () => {
    document.querySelector('.page-transition').classList.add('active');
});
