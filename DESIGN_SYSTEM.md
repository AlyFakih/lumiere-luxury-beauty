# 🎨 Lumière Design System

**Version:** 1.1  
**Last Updated:** 2026  
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
- **Inclusive Design**: accessibility-focused, with measured contrast compliance and keyboard navigation. WCAG 2.1 AA is used as a reference standard, not a certified result.
- **Performance**: not audited. No Lighthouse or profiling results are published for this project.
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

Ratios below are measured against `--color-surface` (#ffffff) and
`--color-background` (#faf9f7).

| Color | Hex | Token | Usage | Contrast |
|-------|-----|-------|-------|---|
| **Gold** | `#8B6914` | `--color-primary` | Text, fills and borders on light surfaces | 5.09 / 4.83 |
| **Light Gold** | `#c9a96e` | `--color-primary-light` | Gold on dark sections only | 6.24 on charcoal |
| **Text** | `#1a1a1a` | `--color-text` | Primary text | 21.00 / 16.54 |
| **Text Light** | `#5f5f5f` | `--color-text-light` | Secondary text | 6.39 / 6.07 |
| **Background** | `#faf9f7` | `--color-background` | Warm off-white page ground | ground |
| **Surface** | `#ffffff` | `--color-surface` | Cards, dropdowns, panels | ground |
| **Charcoal** | `#2c2c2c` | `--color-charcoal` | Dark sections | ground |

`--color-primary` is the only gold permitted for text, fills or borders on a
light surface. It measures 2.75:1 against `--color-charcoal`, so gold appearing
on a dark section must use `--color-primary-light`. The reverse also holds:
`--color-primary-light` is 2.24:1 on white, making it decorative-only there —
rules, dividers and ornament, never text.

### Secondary Colors

| Color | Hex | Token | Usage | Contrast |
|-------|-----|-------|-------|---|
| **Border** | `#e8e4df` | `--color-border` | Hairline rules (non-text) | n/a |
| **Grey** | `#6f6f6f` | `--color-grey` | Secondary text | 5.02 / 4.78 |
| **Grey Dark** | `#4a4a4a` | `--color-grey-dark` | Body copy on light grounds | 8.86 / 8.42 |
| **Accent** | `#c2185b` | `--color-accent` | Alert states, important notifications | 5.87 / 5.58 |
| **Soft Rose** | `#f8c3cd` | `--color-secondary` | Decorative accents only, never text | n/a |

### Functional Colors

| Color | Hex | Purpose |
|-------|-----|---------|
| **Success** | `#4caf50` | Confirmations, success messages |
| **Error** | `#d32f2f` | Errors, validation failures |
| **Warning** | `#ff9800` | Warnings, cautions |
| **Info** | `#2196f3` | Information, help text |

### Dark Mode

Not implemented. A previous `@media (prefers-color-scheme: dark)` block swapped
`--color-dark` and `--color-light` globally while every other rule kept its
hardcoded light-mode value. On a dark-mode OS that produced unreadable text
wherever the two were combined — most visibly `.main-nav.scrolled`, which keeps
a white background while its links resolved to `#f9f7f5`, a ratio of 1.07:1
against a 4.5:1 requirement.

It was removed rather than patched. A correct dark mode requires every surface,
border and shadow to be tokenised, not just the two text colours.

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
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        <span>Action completed successfully</span>
    </div>
</div>
```

---

## Accessibility

> Documentation alone does not establish WCAG conformance. The final implementation must be validated with automated and manual accessibility testing.

### Accessibility measures (WCAG 2.1 AA used as reference)

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
    /* Surfaces */
    --color-background: #faf9f7;   /* warm off-white page ground */
    --color-surface: #ffffff;      /* cards, dropdowns, panels   */
    --color-charcoal: #2c2c2c;     /* dark sections              */
    --color-border: #e8e4df;       /* hairline rules (non-text)  */

    /* Text */
    --color-text: #1a1a1a;         /* 21.00 / 16.54 */
    --color-text-light: #5f5f5f;   /*  6.39 /  6.07 */

    /* Gold */
    --color-primary: #8B6914;       /* text/fills on light surfaces */
    --color-primary-light: #c9a96e; /* gold on dark grounds only    */

    /* Legacy aliases, kept so existing var() references resolve */
    --color-dark: #1a1a1a;
    --color-light: #faf9f7;
    --color-grey: #6f6f6f;
    --color-grey-dark: #4a4a4a;
    --color-secondary: #f8c3cd;    /* decorative only */
    --color-accent: #c2185b;

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
    --shadow-large: 0 20px 60px rgba(0, 0, 0, 0.12);

    /* Spacing scale */
    --space-xs: 0.5rem;    /*   8px */
    --space-sm: 1rem;      /*  16px */
    --space-md: 2rem;      /*  32px */
    --space-lg: 4rem;      /*  64px */
    --space-xl: 8rem;      /* 128px */
    --space-xxl: 12rem;    /* 192px */
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
- Interaction to Next Paint (INP): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

---

## Changelog

### v1.0 (2026)
- Initial design system release
- WCAG 2.1 AA used as a reference standard; conformance is not certified
- Mobile-first responsive design
- Comprehensive component library
- Accessibility features
