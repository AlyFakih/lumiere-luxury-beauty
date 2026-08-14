// Part 1: console cleanliness on all 7 pages, then index.html interactions.
const { chromium, open, check, note, setPage, summary } = require('./lib');

const PAGES = [
    ['index.html',                  '/index.html'],
    ['about.html',                  '/pages/about.html'],
    ['category.html',               '/pages/category.html'],
    ['checkout.html',               '/pages/checkout.html'],
    ['product.html',                '/pages/product.html'],
    ['product-detail.html',         '/pages/product-detail.html'],
    ['tutorials.html',              '/pages/tutorials.html'],
];

(async () => {
    const browser = await chromium.launch();

    // ---------- console errors on every page ----------
    for (const [name, path] of PAGES) {
        setPage(name);
        const { page, errors, warnings, status } = await open(browser, path);
        check(`HTTP 200`, status === 200, `status ${status}`);
        check(`zero console errors`, errors.length === 0,
              errors.length ? errors.slice(0, 5).join(' | ') : 'none');
        if (warnings.length) note(`console warnings (${warnings.length})`, warnings.slice(0, 3).join(' | '));

        // every <img> actually decoded
        const broken = await page.$$eval('img', imgs =>
            imgs.filter(i => {
                // Ignore images intentionally deferred until their hidden modal opens.
                const deferredModal = i.closest('.modal-zoom, .video-modal');
                const modalIsHidden = deferredModal &&
                    getComputedStyle(deferredModal).visibility === 'hidden';
                if (modalIsHidden) return false;

                return !i.complete || i.naturalWidth === 0;
            }).map(i => i.getAttribute('src')));
        check(`all images decoded`, broken.length === 0,
              broken.length ? `${broken.length} broken: ${broken.slice(0,4).join(', ')}` : `${await page.$$eval('img', i=>i.length)} images OK`);

        await page.close();
    }

    // ---------- index.html interactions ----------
    setPage('index.html');
    {
        const { page } = await open(browser, '/index.html');

        // --- hero animation actually applied ---
        const heroOpacity = await page.$eval('.hero h1', el => getComputedStyle(el).opacity);
        check('hero h1 is visible after entrance animation',
              parseFloat(heroOpacity) > 0.9, `opacity=${heroOpacity}`);

        // --- product card hover state ---
        const card = page.locator('.product-card').first();
        const beforeT = await card.evaluate(el => getComputedStyle(el).transform);
        const overlayBefore = await page.$eval('.product-card .product-overlay', el => getComputedStyle(el).opacity);
        await card.hover();
        await page.waitForTimeout(600);
        const overlayAfter = await page.$eval('.product-card .product-overlay', el => getComputedStyle(el).opacity);
        check('product card hover reveals overlay',
              parseFloat(overlayAfter) > parseFloat(overlayBefore),
              `overlay opacity ${overlayBefore} -> ${overlayAfter}`);

        // --- add to cart increments badge ---
        await page.mouse.move(0, 0);
        await page.waitForTimeout(300);
        const badgeBefore = (await page.$eval('.cart-count', el => el.textContent)).trim();
        await page.locator('.add-to-cart-btn').first().click();
        await page.waitForTimeout(1200);
        const badgeAfter = (await page.$eval('.cart-count', el => el.textContent)).trim();
        check('add-to-cart increments cart badge in DOM',
              Number(badgeAfter) === Number(badgeBefore) + 1,
              `badge ${badgeBefore} -> ${badgeAfter}`);

        // --- toast rendered ---
        const toast = await page.$$eval('#toast-container .toast', t => t.map(x => x.textContent.trim()));
        check('add-to-cart shows a toast', toast.length > 0, toast.join(' | ') || 'no toast found');

        // --- cart persists to localStorage ---
        const stored = await page.evaluate(() => localStorage.getItem('lumiereCart'));
        check('cart persisted to localStorage', !!stored && JSON.parse(stored).length > 0,
              stored ? stored.slice(0, 90) : 'null');

        // --- cart sidebar opens and traps focus ---
        await page.click('.cart-toggle');
        await page.waitForTimeout(700);
        const cartOpen = await page.$eval('.cart-sidebar', el => el.classList.contains('active'));
        check('cart sidebar opens on click', cartOpen, `active=${cartOpen}`);
        const cartRight = await page.$eval('.cart-sidebar', el => getComputedStyle(el).right);
        check('cart sidebar is on-screen when open', cartRight === '0px', `right=${cartRight}`);

        // --- escape closes it ---
        await page.keyboard.press('Escape');
        await page.waitForTimeout(700);
        const cartClosed = await page.$eval('.cart-sidebar', el => !el.classList.contains('active'));
        check('Escape closes cart sidebar', cartClosed, `closed=${cartClosed}`);

        // --- newsletter form ---
        await page.fill('.newsletter-form input[type="email"]', 'test@example.com');
        await page.click('.newsletter-form button[type="submit"]');
        await page.waitForTimeout(2200);
        const successHtml = await page.$eval('.newsletter-form', el => el.innerHTML);
        check('newsletter shows success state after submit',
              /success-message|Thank you/i.test(successHtml),
              successHtml.replace(/\s+/g, ' ').slice(0, 110));

        await page.close();
    }

    await browser.close();
    process.exit(summary() > 0 ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
