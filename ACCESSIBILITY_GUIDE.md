# ♿ Accessibility Guide

**Lumière Luxury Beauty - Web Accessibility & WCAG Compliance**  
Version 1.2 | WCAG 2.1 AA used as a reference standard. Conformance is not certified and no automated audit has been run.

---

## Table of Contents

1. [Accessibility Overview](#accessibility-overview)
2. [WCAG 2.1 Compliance](#wcag-21-compliance)
3. [Implementation Checklist](#implementation-checklist)
4. [Testing & Validation](#testing--validation)
5. [Common Issues & Fixes](#common-issues--fixes)
6. [Resources](#resources)

---

## Accessibility Overview

**Lumière is committed to ensuring digital accessibility for all users**, including those with disabilities.

### Core Accessibility Principles (POUR)

1. **Perceivable** - Information must be perceivable to users
2. **Operable** - Components must be operable via keyboard
3. **Understandable** - Text and operations must be clear
4. **Robust** - Compatible with assistive technologies

### Our Commitment

- WCAG 2.1 AA is the reference standard used while building. It is not a certified conformance claim.
- ✓ WCAG 2.2 AA is the recommended target for new improvements
- ⚠️ Formal conformance requires automated and manual testing
- ✓ Screen reader optimization
- ✓ Keyboard navigation support
- ✓ Color contrast compliance
- ✓ Accessible forms and validation
- ✓ Accessible media (captions, transcripts)
- ✓ Regular accessibility testing

---

## WCAG 2.1 Compliance

### Level A (Basic)
We exceed Level A in all areas.

### Level AA (Implementation Target)
**Components should be implemented and tested against WCAG Level AA.**

> Documentation alone does not establish WCAG conformance. The final site must be validated with automated and manual testing.

#### 1.4 Distinguishable (Color & Contrast)

**Color Contrast Ratios:**
```
Regular text:     4.5:1 minimum
Large text (18pt+): 3:1 minimum
UI components:    3:1 minimum
Focus indicators: 3:1 minimum
```

**Implementation:**
```css
/* ✓ Sufficient contrast */
body {
    color: #1a1a1a;
    background-color: #f9f7f5;
}

/* Verify actual contrast before release.
   Do not rely on comments claiming a fixed ratio. */

/* Primary button:
   Verify the actual foreground/background contrast
   before release. */
.btn-primary {
    background-color: #d4af37;
    color: white;
}

/* ✓ Error message contrast */
.error-message {
    color: #d32f2f;             /* Red */
    background-color: white;
    /* Contrast ratio: 5.5:1 ✓ */
}
```

**Testing:**
- Use WebAIM Contrast Checker
- Use axe DevTools browser extension
- Validate all color combinations

#### 2.1 Keyboard Accessible

**All interactive elements must be keyboard accessible.**

**Keyboard Support:**
```javascript
// Tab navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Natural tab order follows DOM
    }
});

// Enter/Space to activate
button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        button.click();
    }
});

// Escape to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Arrow keys for menus
menuItem.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        focusNextMenuItem();
    }
    if (e.key === 'ArrowLeft') {
        focusPreviousMenuItem();
    }
});
```

**Tab Order:**
```html
<!-- Natural tab order follows DOM -->
<nav>
    <a href="/">Home</a>           <!-- Tab 1 -->
    <a href="/about">About</a>     <!-- Tab 2 -->
    <a href="/shop">Shop</a>       <!-- Tab 3 -->
</nav>

<!-- If needed, use tabindex -->
<button tabindex="0">Primary action</button>   <!-- Normal flow -->
<button tabindex="-1">Hidden from tab order</button>
```

**Focus Management:**
```javascript
// Always manage focus appropriately
class Modal {
    open() {
        this.previousActiveElement = document.activeElement;
        this.modal.focus();
    }
    
    close() {
        if (this.previousActiveElement) {
            this.previousActiveElement.focus();
        }
    }
}
```

#### 2.4 Navigable

**Users must be able to navigate content effectively.**

```html
<!-- Skip to main content link -->
<a href="#main-content" class="skip-to-main">
    Skip to main content
</a>

<!-- Semantic structure -->
<header>
    <nav aria-label="Main Navigation">
        <!-- Navigation links -->
    </nav>
</header>

<main id="main-content">
    <section aria-label="Featured Products">
        <h1>Featured Products</h1>
        <!-- Content -->
    </section>
</main>

<footer>
    <nav aria-label="Footer Navigation">
        <!-- Footer links -->
    </nav>
</footer>
```

#### 3.2 Predictable

**Pages function in predictable ways.**

```javascript
// ✓ Consistent navigation placement
// ✓ Consistent button behavior
// ✓ No unexpected context changes
// ✓ Errors clearly identified
// ✓ Consistent terminology

// ✗ Avoid autoplay
// ✗ Avoid unexpected redirects
// ✗ Avoid automatic submissions
// ✗ Avoid automatic scrolling
```

#### 3.3 Input Assistance

**Help users avoid and correct mistakes.**

```html
<!-- Clear labels -->
<label for="email">Email Address</label>
<input type="email" id="email" required>

<!-- Error messages -->
<input type="email" 
       aria-invalid="false"
       aria-describedby="email-error">
<span id="email-error" class="error-message">
    Please enter a valid email address
</span>

<!-- Helpful hints -->
<label for="password">Password</label>
<input type="password" id="password" 
       aria-describedby="password-hint">
<span id="password-hint" class="form-hint">
    Minimum 8 characters, including uppercase and numbers
</span>

<!-- Confirmation for important actions -->
<button aria-label="Delete account permanently">
    Delete Account
</button>
```

```javascript
// Real-time validation feedback
inputField.addEventListener('blur', () => {
    const isValid = validateField(inputField);
    if (!isValid) {
        inputField.setAttribute('aria-invalid', 'true');
        showErrorMessage(inputField);
    } else {
        inputField.setAttribute('aria-invalid', 'false');
        hideErrorMessage(inputField);
    }
});
```

---

## Implementation Checklist

### 1. Semantic HTML

```html
<!-- ✓ Use semantic elements -->
<header>Navigation and branding</header>
<nav>Navigation links</nav>
<main>Main content</main>
<article>Self-contained content</article>
<section>Thematic grouping</section>
<aside>Supplementary content</aside>
<footer>Footer information</footer>

<!-- ✓ Use semantic form elements -->
<form>
    <fieldset>
        <legend>Form Group</legend>
        <label for="input">Field Label</label>
        <input id="input" type="text">
    </fieldset>
    <button type="submit">Submit</button>
</form>

<!-- ✗ Avoid non-semantic markup -->
<!-- Don't use <div> for everything -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="button">Click me</div>
```

### 2. ARIA Attributes

```html
<!-- Labels -->
<button aria-label="Close menu">
    <i class="fas fa-times" aria-hidden="true"></i>
</button>

<!-- Descriptions -->
<img alt="Serum bottle"
     aria-describedby="serum-desc">
<p id="serum-desc">Premium facial serum for radiant skin</p>

<!-- Live regions -->
<div role="status" aria-live="polite" aria-atomic="true">
    Item added to cart
</div>

<!-- Buttons and controls -->
<button aria-pressed="false" aria-label="Favorite">
    <i class="fas fa-heart" aria-hidden="true"></i>
</button>

<button aria-expanded="false" aria-controls="menu">
    Menu <i class="fas fa-chevron-down" aria-hidden="true"></i>
</button>

<!-- Required fields -->
<input type="email" required>

<!-- Invalid state -->
<input type="email" aria-invalid="false">
<span class="error-message" role="alert">
    Invalid email format
</span>

<!-- Disabled state -->
<button disabled aria-disabled="true">
    Unavailable
</button>
```

### 3. Accessible Images

```html
<!-- Descriptive alt text -->
<img src="radiance-serum.jpg" 
     alt="Radiance Serum - Premium facial serum in glass bottle">

<!-- Decorative images (hidden from screen readers) -->
<img src="decorative-line.svg" alt="" aria-hidden="true">

<!-- Images with text (OCR not needed) -->
<img src="product-badge.svg" alt="New Arrival Badge">

<!-- Complex images (long description) -->
<img src="chart.svg" alt="Sales chart" aria-describedby="chart-desc">
<p id="chart-desc">
    Sales increased 25% in Q3 compared to Q2...
</p>

<!-- Background images (CSS) -->
<!-- Provide text alternative -->
<div class="hero" style="background-image: url('hero.jpg')">
    <h1>Main Heading</h1>
    <p>Descriptive text</p>
</div>
```

### 4. Accessible Forms

```html
<form>
    <!-- Explicit labels -->
    <label for="firstname">First Name *</label>
    <input type="text" id="firstname" required>
    
    <!-- Error messages -->
    <label for="email">Email Address *</label>
    <input type="email" id="email" required aria-describedby="email-error">
    <span id="email-error" class="error-message"></span>
    
    <!-- Hints and help text -->
    <label for="password">Password *</label>
    <input type="password" id="password" 
           aria-describedby="password-hint" required>
    <span id="password-hint" class="form-hint">
        8+ characters, uppercase, lowercase, number
    </span>
    
    <!-- Required indicator -->
    <p id="required-notice">
        Fields marked with * are required
    </p>
    
    <!-- Submit button -->
    <button type="submit" class="btn btn-primary">
        Submit Form
    </button>
</form>
```

### 5. Focus Management

```javascript
// Visible focus indicator
:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
}

// Modal focus trap
class FocusTrap {
    constructor(element) {
        this.element = element;
        this.previousActiveElement = null;
    }
    
    activate() {
        this.previousActiveElement = document.activeElement;
        this.element.addEventListener('keydown', 
            this.handleKeydown.bind(this));
        
        const firstFocusable = this.getFirstFocusable();
        firstFocusable?.focus();
    }
    
    deactivate() {
        this.element.removeEventListener('keydown', 
            this.handleKeydown.bind(this));
        this.previousActiveElement?.focus();
    }
    
    getFirstFocusable() {
        return this.element.querySelector(
            'button, [href], input, select, textarea'
        );
    }
}
```

### 6. Motion & Animations

```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Avoid flashing/strobing (3+ flashes per second) */
/* Avoid seizure triggers */
```

```javascript
// Detect reduced motion preference
const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
    // Run animations
}
```

---

## Testing & Validation

### Automated Testing

**Browser Extensions:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Wave](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

**Command Line:**
```bash
# Test with Axe
npm install -g @axe-core/cli
axe https://example.com

# Test with Pa11y
npm install -g pa11y-cli
pa11y https://example.com
```

### Manual Testing

**Keyboard Testing:**
1. Unplug mouse
2. Navigate using Tab key only
3. Verify all interactive elements are reachable
4. Check focus indicators are visible
5. Verify natural tab order

**Screen Reader Testing:**
- **NVDA** (Windows, free)
- **JAWS** (Windows, paid)
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)

**Screen Reader Checklist:**
- [ ] Page structure announced correctly
- [ ] Headings navigable
- [ ] Form labels associated
- [ ] Alt text on images
- [ ] Links have descriptive text
- [ ] Buttons properly announced
- [ ] Error messages clear

### Color Contrast Testing

```javascript
// Calculate contrast ratio
function getContrastRatio(color1, color2) {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

// Test required contrast
const ratio = getContrastRatio('#d4af37', '#f9f7f5');
console.assert(ratio >= 4.5, 'Contrast ratio must be 4.5:1 or higher');
```

---

## Common Issues & Fixes

### Issue 1: Missing Alt Text

```html
<!-- ✗ Bad -->
<img src="product.jpg">

<!-- ✓ Good -->
<img src="product.jpg" alt="Radiance Serum - Premium facial serum">
```

### Issue 2: Color Only Information

```html
<!-- ✗ Bad: Error shown only in red -->
<input style="border-color: red;">

<!-- ✓ Good: Error shown with text and icon -->
<input aria-invalid="true">
<span class="error-message" role="alert">
    <i class="fas fa-exclamation-circle"></i>
    This field is required
</span>
```

### Issue 3: Unlabeled Form Fields

```html
<!-- ✗ Bad -->
<input type="text" placeholder="Enter email">

<!-- ✓ Good -->
<label for="email">Email Address</label>
<input type="email" id="email" placeholder="you@example.com">
```

### Issue 4: No Focus Indicator

```css
/* ✗ Bad: Removing focus outline */
button:focus {
    outline: none;
}

/* ✓ Good: Custom focus indicator */
button:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
}
```

### Issue 5: Keyboard Trap

```javascript
/* ✗ Bad: Focus trapped in modal */
modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault(); // Traps focus
    }
});

/* ✓ Good: Focus trap that cycles properly */
class FocusTrap {
    handleKeydown(e) {
        if (e.key !== 'Tab') return;
        
        const focusables = this.getFocusableElements();
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        
        if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
        }
    }
}
```

### Issue 6: AutoPlay Content

```html
<!-- ✗ Bad: Autoplay -->
<video autoplay><source src="video.mp4"></video>

<!-- ✓ Good: User-initiated -->
<button>Play Video</button>
<video><source src="video.mp4"></video>

<!-- ✓ With captions -->
<video controls>
    <source src="video.mp4" type="video/mp4">
    <track kind="captions" src="captions.vtt" srclang="en">
</video>
```

---

## Resources

### Standards & Guidelines
- [W3C WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ADA Compliance](https://www.justice.gov/opa/pr/department-justice-reaches-settlement-agreements-four-companies-resolving-charges-website-and-mobile)
- [Section 508](https://www.section508.gov/)

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE](https://wave.webaim.org/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Learning
- [WebAIM Articles](https://webaim.org/articles/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Learn/Accessibility)
- [Accessible Colors](https://accessible-colors.com/)

### Testing
- [WCAG Compliance Checker](https://www.w3.org/WAI/test-evaluate/)
- [AXE Core](https://github.com/dequelabs/axe-core)
- [Pa11y](https://pa11y.org/)

---

## Quick Reference

### Critical Elements
- ✓ Keyboard accessible
- ✓ Semantic HTML
- ✓ ARIA labels/descriptions
- ✓ Color contrast 4.5:1+
- ✓ Focus indicators
- ✓ Alt text on images
- ✓ Form labels
- ✓ Error messages

### Testing Before Launch
- [ ] Run axe DevTools
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Check color contrast
- [ ] Verify focus order
- [ ] Test mobile/touch

---

**Questions? Contact our accessibility team or email accessibility@lumiere-beauty.com**

Last Updated: 2025  
Next Review: 2027
