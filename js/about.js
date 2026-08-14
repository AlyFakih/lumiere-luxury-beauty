/* About Page JavaScript for Lumière Luxury Beauty */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations on scroll
    initAnimations();

    // Initialize testimonial slider
    initTestimonialSlider();

    // Initialize parallax effect
    initParallax();

    // Initialize custom cursor
    initCustomCursor();
});

// Handle animations on scroll
function initAnimations() {
    // Select elements to animate
    const fadeElements = document.querySelectorAll('.fade-in');
    const revealTextElements = document.querySelectorAll('.reveal-text');
    const revealImageElements = document.querySelectorAll('.reveal-image');

    // Create intersection observer for animation triggers
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the trigger class and let the stylesheet own the
                // animation. These previously assigned the curtain
                // keyframes to the host element inline: `reveal` ends at
                // translateX(100%) and `revealImage` at scaleX(0), both
                // meant for the ::after / ::before curtain, so the host
                // heading slid off-screen and the story image collapsed to
                // zero width -- permanently, because of `forwards`.
                entry.target.classList.add('is-revealed');
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
    revealImageElements.forEach(element => observer.observe(element));

    // Add animation delay to stagger fade-in elements
    fadeElements.forEach((element, index) => {
        element.style.animationDelay = `${0.2 * (index % 3) + 0.3}s`;
    });

    // Add hover effect to value items
    const valueItems = document.querySelectorAll('.value-item');
    valueItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = 'var(--shadow-medium)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow-soft)';
        });
    });
}

// Handle testimonial slider
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let currentIndex = 0;
    let interval;

    // Function to activate a specific slide
    function activateSlide(index) {
        // Deactivate current slide
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        // Set the new index
        currentIndex = index;
        
        // Make sure index is within bounds
        if (currentIndex < 0) currentIndex = slides.length - 1;
        if (currentIndex >= slides.length) currentIndex = 0;
        
        // Activate new slide
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }
    
    // Event listeners for controls
    prevBtn.addEventListener('click', () => {
        clearInterval(interval);
        activateSlide(currentIndex - 1);
        startAutoSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        clearInterval(interval);
        activateSlide(currentIndex + 1);
        startAutoSlide();
    });
    
    // Add click event to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(interval);
            activateSlide(index);
            startAutoSlide();
        });
    });
    
    // Auto slide function
    function startAutoSlide() {
        clearInterval(interval);
        interval = setInterval(() => {
            activateSlide(currentIndex + 1);
        }, 5000);
    }
    
    // Start auto slide on page load
    startAutoSlide();
    
    // Add fade animations to testimonial content
    slides.forEach(slide => {
        const content = slide.querySelector('.testimonial-content');
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
        content.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Create a mutation observer to detect when slide becomes active
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    if (slide.classList.contains('active')) {
                        setTimeout(() => {
                            content.style.opacity = '1';
                            content.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        content.style.opacity = '0';
                        content.style.transform = 'translateY(20px)';
                    }
                }
            });
        });
        
        observer.observe(slide, { attributes: true });
    });
}

// Handle parallax effect
function initParallax() {
    const parallaxBg = document.querySelector('.parallax-bg');
    
    // Exit if no parallax element found
    if (!parallaxBg) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const heroSection = document.querySelector('.about-hero');
        const heroHeight = heroSection.offsetHeight;
        
        if (scrollTop <= heroHeight) {
            const translateY = scrollTop * 0.4;
            parallaxBg.style.transform = `translate3d(0, ${translateY}px, 0)`;
        }
    });
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
    const interactiveElements = document.querySelectorAll('a, button, .value-item, .team-member, .gallery-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-active');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-active');
        });
    });
    
    // Add custom cursor effect for testimonial controls
    const testimonialControls = document.querySelectorAll('.testimonial-prev, .testimonial-next, .dot');
    
    testimonialControls.forEach(control => {
        control.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-pointer');
        });
        
        control.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-pointer');
        });
    });
    
    // Add cursor effect for gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-zoom');
            
            // Add subtle zoom effect
            const img = item.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1.05)';
                img.style.transition = 'transform 0.5s ease';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-zoom');
            
            // Reset zoom effect
            const img = item.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1)';
            }
        });
    });
}

// Add smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for fixed header
            behavior: 'smooth'
        });
    });
});

// Page transition effects
window.addEventListener('beforeunload', () => {
    document.querySelector('.page-transition').classList.add('active');
});

// Add 3D tilt effect to team member cards
const teamMembers = document.querySelectorAll('.team-member');

teamMembers.forEach(member => {
    member.addEventListener('mousemove', (e) => {
        const memberRect = member.getBoundingClientRect();
        const x = e.clientX - memberRect.left;
        const y = e.clientY - memberRect.top;
        
        const xPercent = (x / memberRect.width - 0.5) * 20;
        const yPercent = (y / memberRect.height - 0.5) * 20;
        
        member.style.transform = `perspective(500px) rotateY(${xPercent}deg) rotateX(${-yPercent}deg) scale(1.02)`;
        member.style.zIndex = '5';
        member.style.transition = 'none';
    });
    
    member.addEventListener('mouseleave', () => {
        member.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg) scale(1)';
        member.style.zIndex = '1';
        member.style.transition = 'transform 0.5s ease';
    });
});
