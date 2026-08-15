// ============================================================================
// Cart page
// Reads the same `lumiereCart` localStorage key that main.js writes, so the
// full-page view and the header sidebar always agree.
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('.cart-page-items');
    const emptyState = document.querySelector('.cart-empty');
    const layout = document.querySelector('.cart-layout');
    if (!list) return;

    render();

    function readCart() {
        return getFromStorage('lumiereCart', []);
    }

    function writeCart(items) {
        setToStorage('lumiereCart', items);
        // Keep the header badge in sync with the page.
        const badge = document.querySelector('.cart-count');
        if (badge) {
            badge.textContent = items.reduce((n, i) => n + (i.quantity || 1), 0);
        }
    }

    // Prices are stored as display strings such as "$78.00".
    function toNumber(price) {
        const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
        return isNaN(n) ? 0 : n;
    }

    function money(n) {
        return '$' + n.toFixed(2);
    }

    function render() {
        const items = readCart();

        if (!items.length) {
            if (layout) layout.hidden = true;
            if (emptyState) emptyState.hidden = false;
            return;
        }

        if (layout) layout.hidden = false;
        if (emptyState) emptyState.hidden = true;

        list.innerHTML = items.map((item, index) => `
            <li class="cart-line" data-index="${index}">
                <div class="cart-line-media">
                    <img src="${item.image}" alt="">
                </div>
                <div class="cart-line-body">
                    <h3 class="cart-line-name">${item.name}</h3>
                    <p class="cart-line-price">${item.price}</p>
                </div>
                <div class="cart-line-qty">
                    <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity of ${item.name}">&minus;</button>
                    <input type="number" class="qty-input" value="${item.quantity || 1}" min="1" max="10"
                           aria-label="Quantity of ${item.name}">
                    <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity of ${item.name}">+</button>
                </div>
                <div class="cart-line-total">${money(toNumber(item.price) * (item.quantity || 1))}</div>
                <button type="button" class="cart-line-remove" aria-label="Remove ${item.name} from bag">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </li>
        `).join('');

        updateTotals(items);
    }

    function updateTotals(items) {
        const subtotal = items.reduce(
            (sum, i) => sum + toNumber(i.price) * (i.quantity || 1), 0);
        const shipping = subtotal > 0 && subtotal < 100 ? 8 : 0;

        setText('.summary-subtotal', money(subtotal));
        setText('.summary-shipping', shipping === 0 ? 'Complimentary' : money(shipping));
        setText('.summary-total', money(subtotal + shipping));
    }

    function setText(sel, value) {
        const el = document.querySelector(sel);
        if (el) el.textContent = value;
    }

    // ---- interactions (event-delegated so re-renders keep working) ----
    list.addEventListener('click', (e) => {
        const line = e.target.closest('.cart-line');
        if (!line) return;
        const index = Number(line.dataset.index);
        const items = readCart();
        if (!items[index]) return;

        if (e.target.closest('.cart-line-remove')) {
            const name = items[index].name;
            items.splice(index, 1);
            writeCart(items);
            render();
            if (typeof showToast === 'function') {
                showToast(`${name} removed from your bag`, 'info', 2500);
            }
            return;
        }

        if (e.target.closest('.qty-plus')) {
            items[index].quantity = Math.min(10, (items[index].quantity || 1) + 1);
            writeCart(items);
            render();
            return;
        }

        if (e.target.closest('.qty-minus')) {
            items[index].quantity = Math.max(1, (items[index].quantity || 1) - 1);
            writeCart(items);
            render();
        }
    });

    list.addEventListener('change', (e) => {
        if (!e.target.classList.contains('qty-input')) return;
        const line = e.target.closest('.cart-line');
        const index = Number(line.dataset.index);
        const items = readCart();
        if (!items[index]) return;

        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 10) value = 10;

        items[index].quantity = value;
        writeCart(items);
        render();
    });
});
