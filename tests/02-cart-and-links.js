// Part 2: quick-view cart persistence, cart page, account page, link integrity.
const { chromium, BASE, open, check, setPage, summary } = require('./lib');

(async () => {
    const browser = await chromium.launch();

    // ---------- quick-view add-to-cart must persist ----------
    setPage('category.html');
    {
        const { page } = await open(browser, '/pages/category.html');
        await page.evaluate(() => localStorage.removeItem('lumiereCart'));
        await page.reload({ waitUntil: 'load' });
        await page.waitForTimeout(500);

        // open the first quick view
        const qv = page.locator('.btn-quick-view, .quick-view-btn').first();
        await qv.click();
        await page.waitForTimeout(800);

        const modalOpen = await page.locator('.quick-view-modal, .modal').first().isVisible();
        check('quick-view modal opens', modalOpen, `visible=${modalOpen}`);

        const productName = await page.locator('.modal-product-info h2').first().textContent();

        await page.locator('.modal-product-info .add-to-cart-btn').first().click();
        await page.waitForTimeout(1200);

        const stored = await page.evaluate(() => localStorage.getItem('lumiereCart'));
        const parsed = stored ? JSON.parse(stored) : [];
        check('quick-view add writes to lumiereCart',
              parsed.length === 1 && parsed[0].name === productName.trim(),
              `stored=${stored ? stored.slice(0, 110) : 'null'}`);

        // the real test: survive a reload
        await page.reload({ waitUntil: 'load' });
        await page.waitForTimeout(700);
        const afterReload = await page.evaluate(() => localStorage.getItem('lumiereCart'));
        const afterParsed = afterReload ? JSON.parse(afterReload) : [];
        check('cart item survives page reload',
              afterParsed.length === 1 && afterParsed[0].name === productName.trim(),
              `after reload: ${afterReload ? afterReload.slice(0, 110) : 'null'}`);

        const badge = (await page.$eval('.cart-count', el => el.textContent)).trim();
        check('badge matches stored quantity after reload',
              Number(badge) === afterParsed.reduce((n, i) => n + (i.quantity || 1), 0),
              `badge=${badge} storedQty=${afterParsed.reduce((n, i) => n + (i.quantity || 1), 0)}`);

        await page.close();
    }

    // ---------- cart page renders stored items ----------
    setPage('cart.html');
    {
        const { page, errors } = await open(browser, '/pages/cart.html');
        await page.evaluate(() => localStorage.setItem('lumiereCart', JSON.stringify([
            { name: 'Test Serum', price: '$80.00', image: '../images/radiance-serum-main.jpg', quantity: 2 }
        ])));
        await page.reload({ waitUntil: 'load' });
        await page.waitForTimeout(600);

        const lines = await page.$$eval('.cart-line', els => els.length);
        check('cart page renders stored line items', lines === 1, `${lines} line(s)`);

        const subtotal = await page.$eval('.summary-subtotal', el => el.textContent);
        check('subtotal computed from quantity x price', subtotal === '$160.00', `subtotal=${subtotal}`);

        // increment
        await page.locator('.qty-plus').first().click();
        await page.waitForTimeout(400);
        const sub2 = await page.$eval('.summary-subtotal', el => el.textContent);
        check('quantity + updates subtotal', sub2 === '$240.00', `subtotal=${sub2}`);

        // remove
        await page.locator('.cart-line-remove').first().click();
        await page.waitForTimeout(500);
        const emptyShown = await page.$eval('.cart-empty', el => !el.hidden);
        check('removing last item shows empty state', emptyShown, `emptyVisible=${emptyShown}`);

        check('cart.html console clean', errors.length === 0, errors.slice(0, 3).join(' | ') || 'none');
        await page.close();
    }

    // ---------- account page tabs ----------
    setPage('account.html');
    {
        const { page, errors } = await open(browser, '/pages/account.html');
        const signinVisible = await page.locator('#panel-signin').isVisible();
        const registerHidden = await page.locator('#panel-register').isHidden();
        check('sign-in panel shown by default', signinVisible && registerHidden,
              `signin=${signinVisible} registerHidden=${registerHidden}`);

        await page.click('#tab-register');
        await page.waitForTimeout(300);
        const regNow = await page.locator('#panel-register').isVisible();
        const selected = await page.getAttribute('#tab-register', 'aria-selected');
        check('register tab switches panel and aria-selected',
              regNow && selected === 'true', `visible=${regNow} aria-selected=${selected}`);

        check('account.html console clean', errors.length === 0, errors.slice(0, 3).join(' | ') || 'none');
        await page.close();
    }

    // ---------- link integrity across every page ----------
    setPage('link-integrity');
    {
        const PAGES = ['/index.html', '/pages/about.html', '/pages/category.html',
                       '/pages/checkout.html', '/pages/product.html',
                       '/pages/product-detail.html', '/pages/tutorials.html',
                       '/pages/cart.html', '/pages/account.html'];
        const dead = [];
        const page = await browser.newPage();

        for (const p of PAGES) {
            await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
            const hrefs = await page.$$eval('a[href]', as => as
                .map(a => a.getAttribute('href'))
                .filter(h => h && !h.startsWith('#') && !h.startsWith('http') && !h.startsWith('mailto')));
            for (const h of new Set(hrefs)) {
                const target = new URL(h, BASE + p).toString();
                const r = await page.request.get(target);
                if (r.status() >= 400) dead.push(`${p} -> ${h} (${r.status()})`);
            }
        }
        check('zero dead internal links sitewide', dead.length === 0,
              dead.length ? dead.slice(0, 8).join(' | ') : 'all internal links resolve');
        await page.close();
    }

    await browser.close();
    process.exit(summary() > 0 ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
