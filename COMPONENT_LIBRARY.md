# 📚 Component Library Guide

**Lumière Luxury Beauty - Component Library**  
Version 1.1

---

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Usage Guidelines](#usage-guidelines)
4. [Accessibility Checklist](#accessibility-checklist)
5. [Responsive Behavior](#responsive-behavior)
6. [States & Variations](#states--variations)

---

## Overview

The Lumière component library provides reusable, accessible, and performant UI components for building consistent user experiences across the platform.

### Component Files
- **HTML**: See individual page files
- **CSS**: `css/style.css`, `css/accessibility.css`, page-specific CSS files
- **JavaScript**: `js/utils.js`, page-specific JS files

---

## Components

### 1. Navigation Bar

#### Files
- HTML: All pages
- CSS: `css/style.css` (.main-nav, .nav-container, .nav-links)
- JS: `js/main.js` (initializeStickyNavigation, initializeDropdownMenus)

#### Features
- Sticky positioning on scroll
- Mega dropdown menus
- Mobile hamburger menu
- Search integration
- Cart badge

#### HTML Structure
```html
<nav class="main-nav" aria-label="Main Navigation">
    <div class="nav-container">
        <div class="logo">
            <a href="index.html" aria-label="Lumière - Home">Lumière</a>
        </div>
        <div class="nav-links" role="menubar">
            <!-- Menu items -->
        </div>
        <div class="nav-actions">
            <!-- Search, account, cart -->
        </div>
        <button class="mobile-menu-toggle" aria-label="Toggle navigation menu">
            <span></span><span></span><span></span>
        </button>
    </div>
</nav>
```

#### Accessibility
- ✓ ARIA labels for all buttons
- ✓ Role="menubar" and role="menuitem"
- ✓ aria-expanded for dropdowns
- ✓ Keyboard navigation (arrow keys)
- ✓ Escape key to close

#### Mobile Behavior
- Hamburger menu on screens < 769px
- Dropdown menu becomes vertical
- Touch-friendly spacing (44px minimum)

---

### 2. Search Panel

#### Features
- Toggle with search button
- Keyboard activation (Escape to close)
- Focus management
- Live search capability

#### HTML Structure
```html
<div class="search-container">
    <button class="search-toggle" 
            aria-label="Search products" 
            aria-expanded="false"
            aria-controls="search-panel">
        <i class="fas fa-search" aria-hidden="true"></i>
    </button>
    <div class="search-panel" id="search-panel" role="search">
        <input type="text" 
               placeholder="Search for products..." 
               aria-label="Search input">
        <button class="search-btn" aria-label="Perform search">
            <i class="fas fa-search" aria-hidden="true"></i>
        </button>
    </div>
</div>
```

#### Usage
```javascript
// Auto-initialized in main.js
// No additional setup needed
```

---

### 3. Shopping Cart

#### Features
- Slide-out sidebar
- Quantity adjusters
- Empty state
- Toast notifications
- Focus trap

#### HTML Structure
```html
<div class="cart-sidebar" id="cart-sidebar" 
     role="complementary" 
     aria-label="Shopping bag">
    <div class="cart-header">
        <h2>Your Shopping Bag</h2>
        <button class="close-cart" aria-label="Close shopping bag">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    </div>
    <div class="cart-items" role="region" 
         aria-live="polite" 
         aria-label="Cart items">
        <!-- Items generated dynamically -->
    </div>
    <div class="cart-footer">
        <div class="cart-subtotal" aria-label="Subtotal">
            <span>Subtotal:</span>
            <span class="subtotal-amount" aria-live="polite">$0.00</span>
        </div>
        <a href="pages/cart.html" class="btn btn-primary">View Cart</a>
        <a href="pages/checkout.html" class="btn btn-secondary">Checkout</a>
    </div>
</div>
```

#### JavaScript API
```javascript
// Open cart
cartToggle.click();

// Close cart
closeCart.click();

// Add item to cart
cart.push({
    name: "Product Name",
    price: "$99.00",
    image: "image.jpg",
    quantity: 1
});
updateCartCount();
```

---

### 4. Product Card

#### Features
- Image with hover overlay
- Quick view link
- Product details
- Add to cart button
- Toast notification on add

#### HTML Structure
```html
<div class="product-card" role="article">
    <div class="product-image">
        <img src="product.jpg" 
             alt="Illuminating Moisturizer - Luxury face cream">
        <div class="product-overlay">
            <a href="pages/product.html?id=1" 
               class="btn-quick-view" 
               aria-label="Quick view Illuminating Moisturizer">
                Quick View
            </a>
        </div>
    </div>
    <div class="product-details">
        <h3>Illuminating Moisturizer</h3>
        <p class="product-category">Skincare</p>
        <p class="product-price" aria-label="Price">$78.00</p>
        <button class="add-to-cart-btn" 
                aria-label="Add Illuminating Moisturizer to cart">
            Add to Bag
        </button>
    </div>
</div>
```

#### Events
```javascript
// Auto-initialized - no setup required
// Listen for toast notifications:
showToast("Product added to bag!", "success", 2000);
```

---

### 5. Product Carousel

#### Features
- Horizontal scrolling
- Previous/Next navigation
- Keyboard navigation
- Responsive sizing

#### HTML Structure
```html
<div class="product-carousel" 
     role="region" 
     aria-label="Featured product carousel">
    <!-- Product cards -->
</div>
<div class="carousel-controls" 
     role="group" 
     aria-label="Carousel navigation">
    <button class="prev-btn" aria-label="Previous products">
        <i class="fas fa-chevron-left" aria-hidden="true"></i>
    </button>
    <button class="next-btn" aria-label="Next products">
        <i class="fas fa-chevron-right" aria-hidden="true"></i>
    </button>
</div>
```

---

### 6. Button Component

#### Variations
```html
<!-- Primary -->
<button class="btn btn-primary">Shop Now</button>

<!-- Secondary -->
<button class="btn btn-secondary">Learn More</button>

<!-- Outline -->
<button class="btn btn-outline">Browse</button>

<!-- With Icon -->
<button class="btn btn-primary">
    <i class="fas fa-heart" aria-hidden="true"></i> Wishlist
</button>

<!-- Loading State -->
<button class="btn btn-primary loading">
    <span class="spinner" aria-hidden="true"></span>
    Loading...
</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Unavailable</button>
```

#### States
- **Default**: Normal button state
- **Hover**: Background color change
- **Active**: Pressed state
- **Focus**: Outline indicator
- **Disabled**: Reduced opacity, no interaction

#### Accessibility
```html
<button class="btn btn-primary" 
        aria-label="Add to cart" 
        aria-busy="false">
    Add to Bag
</button>
```

---

### 7. Form Components

#### Text Input
```html
<div class="form-group">
    <label for="email">Email Address</label>
    <input type="email" 
           id="email" 
           required 
           minlength="5"
           aria-label="Email Address"
           aria-invalid="false"
           data-error="Please enter a valid email">
    <span class="error-message">Please enter a valid email</span>
</div>
```

#### Select Dropdown
```html
<div class="form-group">
    <label for="category">Product Category</label>
    <select id="category" aria-label="Product Category">
        <option value="">Select Category</option>
        <option value="makeup">Makeup</option>
        <option value="skincare">Skincare</option>
        <option value="fragrance">Fragrance</option>
    </select>
</div>
```

#### Checkbox
```html
<div class="form-group">
    <label>
        <input type="checkbox" 
               name="terms" 
               required 
               aria-describedby="terms-hint">
        I agree to terms and conditions
    </label>
    <span id="terms-hint" class="form-hint">Required to proceed</span>
</div>
```

#### Form Validation
```javascript
// Validate single field
validateField(inputElement);

// Validate entire form
if (validateForm(formElement)) {
    // Submit form
}

// Listen for validation events
inputElement.addEventListener('blur', () => {
    validateField(this);
});
```

---

### 8. Toast Notification

#### Usage
```javascript
// Success notification
showToast("Action completed!", "success", 3000);

// Error notification
showToast("An error occurred", "error", 3000);

// Warning notification
showToast("Please review your input", "warning", 3000);

// Info notification
showToast("Here's some helpful information", "info", 3000);
```

#### HTML (Auto-generated)
```html
<div id="toast-container" role="status" 
     aria-live="polite" aria-atomic="true">
    <div class="toast toast-success" role="alert">
        <i class="fas fa-check-circle"></i>
        <span>Action completed successfully</span>
    </div>
</div>
```

#### Styling
```css
.toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: var(--shadow-hard);
}

.toast-success { background-color: #4caf50; }
.toast-error { background-color: #d32f2f; }
.toast-warning { background-color: #ff9800; }
.toast-info { background-color: #2196f3; }
```

---

### 9. Modal / Confirmation Dialog

#### Usage
```javascript
showConfirmDialog(
    "Delete Item",
    "Are you sure you want to delete this item?",
    () => {
        // On confirm
        console.log("Item deleted");
    },
    () => {
        // On cancel
        console.log("Cancelled");
    }
);
```

#### Keyboard Controls
- **Tab**: Move between buttons
- **Enter/Space**: Activate button
- **Escape**: Cancel dialog

---

### 10. Empty State

#### HTML
```html
<div class="empty-state">
    <div class="empty-state-icon">
        <i class="fas fa-shopping-bag"></i>
    </div>
    <div class="empty-state-title">Your bag is empty</div>
    <p class="empty-state-message">
        Start shopping to add items to your bag
    </p>
    <a href="/shop" class="btn btn-primary">Continue Shopping</a>
</div>
```

#### Usage
```javascript
// Show empty cart
cartItemsContainer.innerHTML = `
    <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-shopping-bag"></i></div>
        <div class="empty-state-title">Your bag is empty</div>
        <p class="empty-state-message">Start shopping to add items</p>
    </div>
`;
```

---

## Usage Guidelines

### 1. Always Include ARIA Labels
```html
<!-- ✓ Good -->
<button aria-label="Add to cart">
    <i class="fas fa-plus" aria-hidden="true"></i>
</button>

<!-- ✗ Poor -->
<button>
    <i class="fas fa-plus"></i>
</button>
```

### 2. Use Semantic HTML
```html
<!-- ✓ Good -->
<nav>
    <ul>
        <li><a href="/about">About</a></li>
    </ul>
</nav>

<!-- ✗ Poor -->
<div class="nav">
    <div class="nav-item"><span class="nav-link">About</span></div>
</div>
```

### 3. Provide Alt Text for Images
```html
<!-- ✓ Good -->
<img src="product.jpg" alt="Radiance Serum - Premium facial serum">

<!-- ✗ Poor -->
<img src="product.jpg" alt="product">
```

### 4. Use CSS Variables for Consistency
```css
/* ✓ Good */
button {
    background-color: var(--color-primary);
    transition: all var(--transition-medium);
}

/* ✗ Poor */
button {
    background-color: #d4af37;
    transition: all 0.3s ease;
}
```

---

## Accessibility Checklist

Before deploying any component:

- [ ] Keyboard navigable (Tab, Enter, Escape, Arrow Keys)
- [ ] ARIA labels on all interactive elements
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Alt text on all images
- [ ] Semantic HTML structure
- [ ] Screen reader tested
- [ ] Mobile/touch friendly (44px minimum)
- [ ] Works with reduced motion setting
- [ ] Form validation clear and accessible

---

## Responsive Behavior

### Mobile (320px - 480px)
- Single column layouts
- Full-width components
- Hamburger menu
- Stacked modals
- Touch-friendly spacing

### Tablet (481px - 1024px)
- 2-column grids
- Optimized navigation
- Horizontal scrolling carousels
- Adjusted padding/margins

### Desktop (1025px+)
- 3-4 column grids
- Full horizontal navigation
- Optimized spacing

---

## States & Variations

### Button States
| State | Cursor | Opacity | Interaction |
|-------|--------|---------|------------|
| Default | pointer | 1 | Clickable |
| Hover | pointer | 0.9 | Highlighted |
| Active | pointer | 0.8 | Pressed |
| Focus | pointer | 1 | Outline visible |
| Disabled | not-allowed | 0.5 | No click |
| Loading | not-allowed | 0.8 | Spinner shown |

### Form States
| State | Styling | Message | Icon |
|-------|---------|---------|------|
| Valid | Green border | None | ✓ |
| Invalid | Red border | Error message | ✗ |
| Focused | Primary color | Hint text | → |
| Disabled | Grey | None | N/A |

---

## Performance Tips

1. **Lazy Load Images**
   ```html
   <img src="placeholder.jpg" data-src="actual.jpg" alt="...">
   ```

2. **Use CSS Variables**
   ```css
   --color-primary, --transition-medium, --shadow-soft
   ```

3. **Throttle/Debounce Events**
   ```javascript
   const handler = throttle(updateUI, 100);
   window.addEventListener('scroll', handler);
   ```

4. **Minimize Reflows**
   ```javascript
   // Bad: Multiple reflows
   element.style.width = '100px';
   element.style.height = '100px';
   
   // Good: Single reflow
   element.style.cssText = 'width: 100px; height: 100px;';
   ```

---

For more information, see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and [ACCESSIBILITY_GUIDE.md](ACCESSIBILITY_GUIDE.md).
