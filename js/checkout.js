/* Checkout JavaScript for Lumière Luxury Beauty */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const completeOrderBtn = document.querySelector('.complete-order');
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const paymentForms = document.querySelectorAll('.payment-form');
    const orderConfirmationModal = document.querySelector('.order-confirmation-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const checkoutForm = document.querySelector('.checkout-form');
    const sameBillingCheck = document.getElementById('same-as-shipping');
    const shippingValue = document.querySelector('.shipping-value');
    const taxValue = document.querySelector('.tax-value');
    const totalAmount = document.querySelector('.amount');
    const applyCodeBtn = document.querySelector('.apply-code');
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const emailField = document.getElementById('email');
    const orderEmail = document.querySelector('.order-email');

    // Variables
    let subtotal = 312.00;
    let shipping = 0;
    let tax = 24.96;
    let discount = 0;

    // Initialize
    updateOrderSummary();

    // Step Navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStepId = this.dataset.step;
            const nextStep = document.getElementById(nextStepId);
            
            if (validateStep(currentStep)) {
                // Update step indicators
                const currentIndex = Array.from(formSteps).indexOf(currentStep);
                const nextIndex = Array.from(formSteps).indexOf(nextStep);
                
                steps[currentIndex].classList.add('completed');
                steps[nextIndex].classList.add('active');
                
                // Switch steps with animation
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                // Scroll to top of form
                document.querySelector('.checkout-form-container').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const prevStepId = this.dataset.step;
            const prevStep = document.getElementById(prevStepId);
            
            // Update step indicators
            const currentIndex = Array.from(formSteps).indexOf(currentStep);
            const prevIndex = Array.from(formSteps).indexOf(prevStep);
            
            steps[currentIndex].classList.remove('active');
            steps[prevIndex].classList.remove('completed');
            steps[prevIndex].classList.add('active');
            
            // Switch steps with animation
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            
            // Scroll to top of form
            document.querySelector('.checkout-form-container').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Form Validation
    function validateStep(step) {
        const inputs = step.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showError(input, 'This field is required');
            } else {
                clearError(input);
                
                // Validate email format
                if (input.type === 'email' && !validateEmail(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid email address');
                }
                
                // Validate phone format
                if (input.id === 'phone' && !validatePhone(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid phone number');
                }
            }
        });
        
        return isValid;
    }
    
    function showError(input, message) {
        // Clear any existing error
        clearError(input);
        
        // Create error element
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerHTML = message;
        error.style.color = '#ff3366';
        error.style.fontSize = '0.8rem';
        error.style.marginTop = '5px';
        
        // Add error styling to input
        input.style.borderColor = '#ff3366';
        
        // Insert error after input
        input.parentNode.insertBefore(error, input.nextSibling);
        
        // Animate the error for visibility
        error.style.animation = 'fadeIn 0.3s ease';
    }
    
    function clearError(input) {
        // Remove error styling
        input.style.borderColor = '';
        
        // Remove error message if exists
        const error = input.parentNode.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    }
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(String(phone));
    }
    
    // Shipping Options
    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Update shipping cost based on selection
            if (this.value === 'standard') {
                shipping = 0;
                shippingValue.textContent = 'Free';
            } else if (this.value === 'express') {
                shipping = 12.00;
                shippingValue.textContent = '$12.00';
            } else if (this.value === 'overnight') {
                shipping = 25.00;
                shippingValue.textContent = '$25.00';
            }
            
            updateOrderSummary();
        });
    });
    
    // Payment Options
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Show/hide corresponding payment form
            paymentForms.forEach(form => form.classList.remove('active'));
            
            if (this.value === 'credit-card') {
                document.querySelector('.credit-card-form').classList.add('active');
            }
        });
    });
    
    // Credit Card Formatting
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            // Format card number with spaces
            let value = this.value.replace(/\D/g, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            this.value = formattedValue;
        });
    }
    
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            // Format expiry date as MM/YY
            let value = this.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,2}', 'g')).join('/');
            }
            
            // Limit to MM/YY format
            if (value.length > 5) {
                value = value.substring(0, 5);
            }
            
            this.value = value;
        });
    }
    
    // Update Order Summary
    function updateOrderSummary() {
        const total = subtotal + shipping + tax - discount;
        totalAmount.textContent = '$' + total.toFixed(2);
        
        // Apply animations to the changed values
        shippingValue.style.animation = 'none';
        totalAmount.style.animation = 'none';
        
        setTimeout(() => {
            shippingValue.style.animation = 'fadeIn 0.5s ease';
            totalAmount.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
    
    // Apply Promo Code
    if (applyCodeBtn) {
        applyCodeBtn.addEventListener('click', function() {
            const promoInput = this.previousElementSibling;
            const promoCode = promoInput.value.trim().toUpperCase();
            
            if (promoCode === 'WELCOME15') {
                discount = subtotal * 0.15;
                showPromoSuccess(promoInput, '15% discount applied!');
                updateOrderSummary();
            } else if (promoCode === 'FREESHIP') {
                if (shipping > 0) {
                    shipping = 0;
                    shippingValue.textContent = 'Free';
                    showPromoSuccess(promoInput, 'Free shipping applied!');
                    updateOrderSummary();
                } else {
                    showPromoError(promoInput, 'You already have free shipping!');
                }
            } else {
                showPromoError(promoInput, 'Invalid promo code');
            }
        });
    }
    
    function showPromoSuccess(input, message) {
        // Remove any existing messages
        removePromoMessages();
        
        // Create success message
        const success = document.createElement('div');
        success.className = 'promo-success';
        success.innerHTML = message;
        success.style.color = '#4CAF50';
        success.style.fontSize = '0.85rem';
        success.style.marginTop = '5px';
        
        // Add success styling
        input.style.borderColor = '#4CAF50';
        
        // Insert message
        input.parentNode.parentNode.appendChild(success);
        
        // Animate
        success.style.animation = 'fadeIn 0.3s ease';
    }
    
    function showPromoError(input, message) {
        // Remove any existing messages
        removePromoMessages();
        
        // Create error message
        const error = document.createElement('div');
        error.className = 'promo-error';
        error.innerHTML = message;
        error.style.color = '#ff3366';
        error.style.fontSize = '0.85rem';
        error.style.marginTop = '5px';
        
        // Add error styling
        input.style.borderColor = '#ff3366';
        
        // Insert message
        input.parentNode.parentNode.appendChild(error);
        
        // Animate
        error.style.animation = 'fadeIn 0.3s ease';
        
        // Clear after delay
        setTimeout(() => {
            removePromoMessages();
            input.style.borderColor = '';
        }, 3000);
    }
    
    function removePromoMessages() {
        const promoSuccess = document.querySelector('.promo-success');
        const promoError = document.querySelector('.promo-error');
        
        if (promoSuccess) promoSuccess.remove();
        if (promoError) promoError.remove();
    }
    
    // Submit Order
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Final validation
            if (validateForm()) {
                // Show loading indicator
                completeOrderBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
                completeOrderBtn.disabled = true;
                
                // Simulate order processing
                setTimeout(() => {
                    // Update email in confirmation modal
                    if (emailField && orderEmail) {
                        orderEmail.textContent = emailField.value;
                    }
                    
                    // Show confirmation modal
                    orderConfirmationModal.classList.add('active');
                    
                    // Reset button state
                    completeOrderBtn.innerHTML = 'Complete Order';
                    completeOrderBtn.disabled = false;
                }, 2000);
            }
        });
    }
    
    function validateForm() {
        // Validate all steps before submission
        let isValid = true;
        
        formSteps.forEach(step => {
            if (!validateStep(step)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            orderConfirmationModal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === orderConfirmationModal) {
            orderConfirmationModal.classList.remove('active');
        }
    });
    
    // Input Animations
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.classList.remove('focused');
            }
        });
        
        // Check if input already has value on page load
        if (input.value) {
            input.parentNode.classList.add('focused');
        }
    });
    
    // Add 3D tilt effect on order items
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        item.addEventListener('mousemove', function(e) {
            const itemRect = this.getBoundingClientRect();
            const x = e.clientX - itemRect.left;
            const y = e.clientY - itemRect.top;
            
            const xPercent = (x / itemRect.width - 0.5) * 10;
            const yPercent = (y / itemRect.height - 0.5) * 10;
            
            this.style.transform = `perspective(500px) rotateY(${xPercent}deg) rotateX(${-yPercent}deg)`;
            this.style.transition = 'none';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg)';
            this.style.transition = 'transform 0.5s ease';
        });
    });
    
    // Initialize custom cursor for luxury feel
    const cursor = document.querySelector('.custom-cursor');
    
    if (cursor) {
        document.addEventListener('mousemove', function(e) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Change cursor size on interactive elements
        const interactiveElements = document.querySelectorAll('button, a, input, select, .shipping-label, .payment-label');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', function() {
                cursor.classList.add('cursor-active');
            });
            
            el.addEventListener('mouseleave', function() {
                cursor.classList.remove('cursor-active');
            });
        });
    }
});
