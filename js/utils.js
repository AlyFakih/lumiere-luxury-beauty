// ============================================================================
// Utility Functions for Lumière Luxury Beauty
// ============================================================================

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

/**
 * Toast notification manager
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.setAttribute('role', 'status');
        toastContainer.setAttribute('aria-live', 'polite');
        toastContainer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    
    // Add icon based on type
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    
    toast.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);

    return toast;
}

// ============================================================================
// FOCUS MANAGEMENT FOR MODALS
// ============================================================================

/**
 * Focus trap manager for modals
 * Ensures keyboard focus stays within the modal
 */
class FocusTrap {
    constructor(element) {
        this.element = element;
        this.previousActiveElement = null;
    }

    activate() {
        this.previousActiveElement = document.activeElement;
        this.element.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Focus first focusable element
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    deactivate() {
        this.element.removeEventListener('keydown', this.handleKeydown.bind(this));
        
        // Restore focus to previously focused element
        if (this.previousActiveElement) {
            this.previousActiveElement.focus();
        }
    }

    getFocusableElements() {
        return Array.from(this.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ));
    }

    handleKeydown(e) {
        if (e.key !== 'Tab') return;

        const focusableElements = this.getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Enable keyboard navigation for menu items
 */
function enableKeyboardNavigation(containerSelector, itemSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    
    items.forEach((item, index) => {
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
        
        item.addEventListener('keydown', (e) => {
            let nextIndex;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIndex = (index + 1) % items.length;
                items[nextIndex].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIndex = (index - 1 + items.length) % items.length;
                items[nextIndex].focus();
            } else if (e.key === 'Home') {
                e.preventDefault();
                items[0].focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                items[items.length - 1].focus();
            }
        });
    });
}

// ============================================================================
// CONFIRMATION DIALOG
// ============================================================================

/**
 * Show a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Callback when cancelled
 */
function showConfirmDialog(title, message, onConfirm, onCancel) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.setAttribute('role', 'presentation');
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-labelledby', 'confirm-title');
    dialog.setAttribute('aria-describedby', 'confirm-message');
    
    dialog.innerHTML = `
        <h2 id="confirm-title">${title}</h2>
        <p id="confirm-message">${message}</p>
        <div class="confirm-actions">
            <button class="btn btn-secondary confirm-cancel">Cancel</button>
            <button class="btn btn-primary confirm-confirm">Confirm</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const confirmBtn = dialog.querySelector('.confirm-confirm');
    const cancelBtn = dialog.querySelector('.confirm-cancel');
    
    const cleanup = () => {
        overlay.remove();
    };
    
    confirmBtn.addEventListener('click', () => {
        onConfirm?.();
        cleanup();
    });
    
    cancelBtn.addEventListener('click', () => {
        onCancel?.();
        cleanup();
    });
    
    // Close on Escape key
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            onCancel?.();
            cleanup();
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Set focus to confirm button
    confirmBtn.focus();
}

// ============================================================================
// DEBOUNCE & THROTTLE UTILITIES
// ============================================================================

/**
 * Debounce function
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let lastRun = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastRun >= limit) {
            func.apply(this, args);
            lastRun = now;
        }
    };
}

// ============================================================================
// LAZY LOADING OBSERVER
// ============================================================================

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    if ('IntersectionObserver' not in window) {
        // Fallback for browsers that don't support IntersectionObserver
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================================================
// LOADING STATE MANAGER
// ============================================================================

/**
 * Manage button loading states
 */
class LoadingButton {
    constructor(buttonElement) {
        this.button = buttonElement;
        this.originalText = buttonElement.textContent;
        this.originalHTML = buttonElement.innerHTML;
    }

    setLoading(isLoading = true) {
        this.button.disabled = isLoading;
        
        if (isLoading) {
            this.button.classList.add('loading');
            this.button.innerHTML = '<span class="spinner"></span>Loading...';
            this.button.setAttribute('aria-busy', 'true');
        } else {
            this.button.classList.remove('loading');
            this.button.innerHTML = this.originalHTML;
            this.button.setAttribute('aria-busy', 'false');
        }
    }

    reset() {
        this.setLoading(false);
    }
}

// ============================================================================
// FORM VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate form field
 */
function validateField(field) {
    let isValid = true;
    const errorMessage = field.dataset.error || 'This field is required';
    
    // Check required
    if (field.hasAttribute('required') && field.value.trim() === '') {
        isValid = false;
    }
    
    // Check email
    if (field.type === 'email' && field.value.trim() !== '') {
        isValid = validateEmail(field.value);
    }
    
    // Check min length
    if (field.hasAttribute('minlength')) {
        const minLen = parseInt(field.getAttribute('minlength'));
        if (field.value.length < minLen) {
            isValid = false;
        }
    }
    
    // Show/hide error message
    const errorEl = field.nextElementSibling;
    if (!isValid) {
        field.classList.add('field-error');
        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.textContent = errorMessage;
            errorEl.style.display = 'block';
        }
        field.setAttribute('aria-invalid', 'true');
    } else {
        field.classList.remove('field-error');
        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.style.display = 'none';
        }
        field.setAttribute('aria-invalid', 'false');
    }
    
    return isValid;
}

/**
 * Validate entire form
 */
function validateForm(formElement) {
    const fields = formElement.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Smooth scroll to element
 */
function smoothScrollTo(element, offset = 0) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
        top: top,
        behavior: 'smooth'
    });
}

/**
 * Check if element is in viewport
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage getter
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Safe localStorage setter
 */
function setToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error writing to localStorage:', error);
        return false;
    }
}

// ============================================================================
// EXPORT FOR USE
// ============================================================================

// Note: If using modules, export these. For vanilla JS, they're globally available.
