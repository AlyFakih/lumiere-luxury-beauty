# 🎨 Lumière Design System

**Version:** 1.0  
**Last Updated:** 2025  
**Status:** Published

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)

---

## Overview

Lumière is a luxury beauty e-commerce platform with a focus on elegance, sophistication, and user experience. The design system ensures consistency across all touchpoints while maintaining the premium brand identity.

### Key Features
- **Luxury Aesthetic**: Gold accents, cream backgrounds, and sophisticated typography
- **Inclusive Design**: WCAG 2.1 AA compliant
- **Performance-Optimized**: Fast load times with optimized assets
- **Responsive**: Mobile-first approach with tablet and desktop support

---

## Design Principles

### 1. **Elegance Through Simplicity**
Embrace minimalism with strategic use of whitespace and premium materials.

### 2. **Accessibility First**
All designs must be accessible to users with disabilities. Contrast ratios must meet WCAG standards.

### 3. **Mobile-First**
Design for mobile devices first, then enhance for larger screens.

### 4. **Performance**
Every design decision should consider impact on performance and load times.

### 5. **Consistency**
Use design tokens and components to maintain consistency across the product.

---

## Color System

### Primary Colors

| Color | Hex | Usage | Accessibility |
|-------|-----|-------|---|
| **Gold** | `#d4af37` | Primary CTA, highlights, accents | Contrast: 4.5:1 ✓ |
| **Dark** | `#1a1a1a` | Text, primary content | Contrast: 21:1 ✓ |
| **Cream** | `#f9f7f5` | Background, neutral spaces | Contrast: 1:1 |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Soft Rose Gold** | `#f8c3cd` | Secondary accents, hover states |
| **Neutral Grey** | `#8a8a8a` | Secondary text, borders |
| **Vibrant Accent** | `#e75480` | Alert states, important notifications |

### Functional Colors

| Color | Hex | Purpose |
|-------|-----|---------|
| **Success** | `#4caf50` | Confirmations, success messages |
| **Error** | `#d32f2f` | Errors, validation failures |
| **Warning** | `#ff9800` | Warnings, cautions |
| **Info** | `#2196f3` | Information, help text |

### Dark Mode Support

The design system includes support for dark mode with inverted colors:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-dark: #f9f7f5;   /* Light backgrounds */
    --color-light: #1a1a1a;  /* Dark backgrounds */
  }
}
```

---

## Typography

### Font Stack

#### Display Font (Headings)
- **Font Family**: `Playfair Display`, serif
- **Weights**: 400, 500, 600, 700
- **Usage**: h1, h2, h3, h4, h5, h6
- **Characteristics**: Elegant, sophisticated, premium feel

#### Body Font (Content)
- **Font Family**: `Montserrat`, sans-serif
- **Weights**: 300, 400, 500, 600
- **Usage**: Body text, labels, UI elements
- **Characteristics**: Clean, modern, highly readable

### Font Sizes

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **h1** | 3.5rem | 500 | 1.3 | Hero section titles |
| **h2** | 2.5rem | 500 | 1.3 | Section titles |
| **h3** | 1.8rem | 500 | 1.3 | Subsection titles |
| **h4** | 1.4rem | 500 | 1.3 | Card titles, UI headings |
| **Body** | 1rem | 400 | 1.6 | Main text content |
| **Small** | 0.875rem | 400 | 1.4 | Captions, metadata |
| **Tiny** | 0.75rem | 500 | 1.2 | Labels, badges |

### Text Styles

```css
/* Heading */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-serif);
    font-weight: 500;
    line-height: 1.3;
}

/* Body */
p {
    font-family: var(--font-sans);
    font-weight: 400;
    line-height: 1.6;
}

/* Label */
label {
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}
```

---

## Spacing & Layout

### Spacing Scale

Based on 8px base unit:

| Scale | Size | Usage |
|-------|------|-------|
| **xs** | 4px | Small gaps, micro-interactions |
| **sm** | 8px | Small padding, tight spacing |
| **md** | 16px | Standard padding, spacing |
| **lg** | 24px | Large padding, section spacing |
| **xl** | 32px | Extra large spacing |
| **2xl** | 48px | Major section spacing |
| **3xl** | 60px | Full section padding |

### Container Sizes

| Size | Max-Width | Padding | Usage |
|------|-----------|---------|-------|
| **Full** | 100% | 10px | Mobile full-width |
| **Small** | 600px | 15px | Forms, modals |
| **Standard** | 1200px | 15px | Main content |
| **Large** | 1400px | 15px | Full desktop |

### Grid System

- **Desktop**: 12-column grid at 1025px+
- **Tablet**: 8-column grid at 481px - 1024px
- **Mobile**: Single column at 320px - 480px
- **Gutter**: 20px between columns

---

## Components

### Buttons

#### Button States

```html
<!-- Primary Button -->
<button class="btn btn-primary">Shop Now</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Learn More</button>

<!-- Outline Button -->
<button class="btn btn-outline">Browse</button>

<!-- Disabled Button -->
<button class="btn btn-primary" disabled>Unavailable</button>

<!-- Loading Button -->
<button class="btn btn-primary loading">
    <span class="spinner"></span>Loading...
</button>
```

#### Button Sizing

| Size | Padding | Min Height | Usage |
|------|---------|-----------|-------|
| **Small** | 8px 16px | 36px | Secondary actions |
| **Medium** | 12px 28px | 44px | Primary actions |
| **Large** | 16px 32px | 48px | Hero actions |

### Forms

#### Input Field

```html
<div class="form-group">
    <label for="email">Email Address</label>
    <input 
        type="email" 
        id="email" 
        required 
        aria-label="Email Address"
        aria-invalid="false"
    >
    <span class="error-message">Please enter a valid email</span>
</div>
```

#### Validation States

```html
<!-- Valid -->
<input class="form-control" aria-invalid="false" />

<!-- Invalid -->
<input class="form-control field-error" aria-invalid="true" />

<!-- Disabled -->
<input class="form-control" disabled />

<!-- Loading -->
<input class="form-control loading" disabled />
```

### Cards

#### Product Card

```html
<div class="product-card" role="article">
    <div class="product-image">
        <img src="image.jpg" alt="Product name">
        <div class="product-overlay">
            <a href="#" class="btn-quick-view">Quick View</a>
        </div>
    </div>
    <div class="product-details">
        <h3>Product Name</h3>
        <p class="product-category">Category</p>
        <p class="product-price">$99.00</p>
        <button class="add-to-cart-btn">Add to Bag</button>
    </div>
</div>
```

### Modals & Dialogs

#### Confirmation Dialog

```html
<div class="confirm-overlay" role="presentation">
    <div class="confirm-dialog" 
         role="alertdialog" 
         aria-labelledby="confirm-title" 
         aria-describedby="confirm-message">
        <h2 id="confirm-title">Confirm Action</h2>
        <p id="confirm-message">Are you sure?</p>
        <div class="confirm-actions">
            <button class="btn btn-secondary">Cancel</button>
            <button class="btn btn-primary">Confirm</button>
        </div>
    </div>
</div>
```

### Toast Notifications

```html
<div id="toast-container" role="status" aria-live="polite" aria-atomic="true">
    <div class="toast toast-success" role="alert">
        <i class="fas fa-check-circle"></i>
        <span>Action completed successfully</span>
    </div>
</div>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

All components meet WCAG 2.1 Level AA standards:

- ✓ Sufficient color contrast (4.5:1 minimum)
- ✓ Keyboard navigation support
- ✓ ARIA labels and roles
- ✓ Focus indicators
- ✓ Screen reader compatibility
- ✓ Reduced motion support

### Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Move focus forward |
| **Shift + Tab** | Move focus backward |
| **Enter** | Activate button/link |
| **Space** | Activate button |
| **Escape** | Close modal/dropdown |
| **Arrow Keys** | Navigate menus |

### Screen Reader Support

All interactive elements include appropriate ARIA attributes:

```html
<!-- Button with aria-label -->
<button aria-label="Open shopping bag">
    <i class="fas fa-shopping-bag" aria-hidden="true"></i>
    <span class="cart-count">0</span>
</button>

<!-- Live region for updates -->
<div role="status" aria-live="polite" aria-atomic="true">
    Item added to cart
</div>

<!-- Modal dialog -->
<div role="alertdialog" aria-labelledby="title" aria-describedby="desc">
    <h2 id="title">Confirm</h2>
    <p id="desc">Proceed with action?</p>
</div>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Size | Device |
|-----------|------|--------|
| **xs** | 320px | Mobile phones |
| **sm** | 481px | Small tablets |
| **md** | 769px | Tablets |
| **lg** | 1025px | Small desktops |
| **xl** | 1441px | Large desktops |

### Mobile-First Approach

Design and code for mobile first, then enhance with media queries:

```css
/* Mobile: 320px - 480px */
.product-grid {
    grid-template-columns: 1fr;
}

/* Tablet: 481px - 1024px */
@media (min-width: 481px) {
    .product-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop: 1025px+ */
@media (min-width: 1025px) {
    .product-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

### Touch-Friendly Sizing

All interactive elements meet minimum touch target size of 44x44px:

```css
button,
a,
input[type="button"],
input[type="submit"] {
    min-height: 44px;
    min-width: 44px;
}
```

### Responsive Images

```html
<!-- Responsive with srcset -->
<img 
    src="image-400w.jpg"
    srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
    sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
    alt="Product name"
>

<!-- Lazy loading -->
<img 
    src="placeholder.jpg"
    data-src="image.jpg"
    alt="Product name"
>
```

---

## CSS Variables Reference

```css
:root {
    /* Colors */
    --color-primary: #d4af37;
    --color-secondary: #f8c3cd;
    --color-dark: #1a1a1a;
    --color-light: #f9f7f5;
    --color-grey: #8a8a8a;
    --color-accent: #e75480;
    
    /* Typography */
    --font-serif: 'Playfair Display', serif;
    --font-sans: 'Montserrat', sans-serif;
    
    /* Transitions */
    --transition-slow: 0.5s ease;
    --transition-medium: 0.3s ease;
    --transition-fast: 0.2s ease;
    
    /* Shadows */
    --shadow-soft: 0 5px 15px rgba(0, 0, 0, 0.05);
    --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.1);
    --shadow-hard: 0 10px 50px rgba(0, 0, 0, 0.15);
}
```

---

## Browser Support

- ✓ Chrome/Edge 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ iOS Safari 14+
- ✓ Chrome Android 90+

---

## Performance Guidelines

### Image Optimization
- Use WebP format with PNG fallback
- Lazy load below-the-fold images
- Compress images to <100KB
- Use appropriate dimensions (2x for retina)

### CSS/JS
- Minify production assets
- Use CSS variables for theming
- Code split JavaScript
- Defer non-critical scripts

### Metrics
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

---

## Changelog

### v1.0 (2025)
- Initial design system release
- WCAG 2.1 AA compliance
- Mobile-first responsive design
- Comprehensive component library
- Accessibility features
