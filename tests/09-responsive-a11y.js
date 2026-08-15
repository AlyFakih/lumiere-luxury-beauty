// ============================================================================
// Responsive layout, keyboard accessibility and mobile-emulation audit.
// Runs against local by default; pass a base URL to audit the deployment.
// ============================================================================

const { chromium, devices } = require('playwright');

const BASE = (process.argv[2] || 'http://127.0.0.1:5500').replace(/\/$/, '');

const PAGES = [
    ['index',          '/index.html'],
    ['about',          '/pages/about.html'],
    ['category',       '/pages/category.html'],
    ['checkout',       '/pages/checkout.html'],
    ['product',        '/pages/product.html?id=radiance-serum'],
    ['product-detail', '/pages/product-detail.html'],
    ['tutorials',      '/pages/tutorials.html'],
    ['cart',           '/pages/cart.html'],
    ['account',        '/pages/account.html'],
];

const VIEWPORTS = [
    ['desktop', 1440, 900],
    ['tablet',  1024, 768],
    ['mobile',   390, 844],
    ['narrow',   320, 720],
];

const results = [];
function check(name, pass, observed) {
    results.push({ name, pass, observed });
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}`);
    if (observed !== undefined) console.log(`         ${observed}`);
}
function info(name, observed) {
    console.log(`  [INFO] ${name}`);
    if (observed !== undefined) console.log(`         ${observed}`);
}

(async () => {
    const browser = await chromium.launch();
    console.log(`Chrome ${browser.version()}  |  base: ${BASE}\n`);

    // ================= 1. horizontal overflow at every breakpoint =============
    console.log('--- Responsive: horizontal overflow ---');
    for (const [vpName, w, h] of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        const page = await ctx.newPage();
        const offenders = [];

        for (const [name, path] of PAGES) {
            await page.goto(BASE + path, { waitUntil: 'load' });
            await page.waitForTimeout(400);

            const overflow = await page.evaluate(() => {
                const de = document.documentElement;
                const scrollW = Math.max(de.scrollWidth, document.body.scrollWidth);
                const clientW = de.clientWidth;
                if (scrollW <= clientW + 1) return null;
                // find the widest offending element for a useful message
                const bad = [];
                document.querySelectorAll('*').forEach(el => {
                    const r = el.getBoundingClientRect();
                    if (r.width > 0 && r.right > clientW + 1) {
                        bad.push({
                            sel: el.tagName.toLowerCase() +
                                 (el.className && typeof el.className === 'string'
                                    ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
                            right: Math.round(r.right)
                        });
                    }
                });
                bad.sort((a, b) => b.right - a.right);
                return { scrollW, clientW, overhang: scrollW - clientW, worst: bad.slice(0, 3) };
            });

            if (overflow) {
                offenders.push(`${name}: +${overflow.overhang}px [${overflow.worst.map(b => `${b.sel}@${b.right}`).join(', ')}]`);
            }
        }

        check(`no horizontal overflow at ${vpName} (${w}x${h})`,
              offenders.length === 0,
              offenders.length ? offenders.join('  |  ') : `all ${PAGES.length} pages fit`);
        await ctx.close();
    }

    // ================= 2. touch-target sizing on mobile ======================
    console.log('\n--- Mobile: touch targets ---');
    {
        const ctx = await browser.newContext({ ...devices['iPhone 13'] });
        const page = await ctx.newPage();
        const small = [];

        for (const [name, path] of PAGES) {
            await page.goto(BASE + path, { waitUntil: 'load' });
            await page.waitForTimeout(400);
            // SC 2.5.8 Target Size (Minimum) is not a flat 24x24 rule. A target
            // under 24px conforms via the Spacing exception when a 24px-diameter
            // circle centred on it does not intersect the circle of any adjacent
            // target -- i.e. centres at least 24px apart. Text links in a footer
            // list are exactly this case, so measuring raw box size alone
            // produces false failures.
            const tiny = await page.evaluate(() => {
                const els = [];
                document.querySelectorAll('a, button, input[type="checkbox"], input[type="radio"], select').forEach(el => {
                    const r = el.getBoundingClientRect();
                    const cs = getComputedStyle(el);
                    if (!(r.width && r.height) || cs.visibility === 'hidden' || cs.display === 'none') return;
                    els.push({ el, r });
                });
                const out = [];
                els.filter(e => e.r.width < 24 || e.r.height < 24).forEach(e => {
                    const cx = e.r.left + e.r.width / 2, cy = e.r.top + e.r.height / 2;
                    let min = Infinity;
                    els.forEach(o => {
                        if (o.el === e.el) return;
                        const d = Math.hypot(cx - (o.r.left + o.r.width / 2), cy - (o.r.top + o.r.height / 2));
                        if (d < min) min = d;
                    });
                    if (min < 24) {
                        out.push(`${e.el.tagName.toLowerCase()}${typeof e.el.className === 'string' && e.el.className ? '.' + e.el.className.trim().split(/\s+/)[0] : ''} ${Math.round(e.r.width)}x${Math.round(e.r.height)} gap=${Math.round(min)}px`);
                    }
                });
                return out;
            });
            if (tiny.length) small.push(`${name}: ${[...new Set(tiny)].slice(0, 4).join(', ')}`);
        }
        check('touch targets meet SC 2.5.8 (size or spacing exception) on mobile',
              small.length === 0,
              small.length ? small.join('  |  ') : 'all targets conform via size or 24px spacing');
        await ctx.close();
    }

    // ================= 3. mobile navigation actually works ===================
    console.log('\n--- Mobile: navigation drawer ---');
    {
        const ctx = await browser.newContext({ ...devices['iPhone 13'] });
        const page = await ctx.newPage();
        await page.goto(BASE + '/pages/about.html', { waitUntil: 'load' });
        await page.waitForTimeout(500);

        const toggleVisible = await page.locator('.mobile-menu-toggle').first().isVisible();
        check('mobile menu toggle is visible at 390px', toggleVisible, `visible=${toggleVisible}`);

        await page.locator('.mobile-menu-toggle').first().click();
        await page.waitForTimeout(600);
        const navOpen = await page.evaluate(() => {
            const n = document.querySelector('.mobile-nav');
            return !!n && n.classList.contains('active');
        });
        check('mobile nav opens on toggle', navOpen, `.mobile-nav.active = ${navOpen}`);

        // links inside must resolve (this is where the /pages/pages/ bug lived)
        const hrefs = await page.$$eval('.mobile-nav a[href]', as => as
            .map(a => a.getAttribute('href'))
            .filter(h => h && !h.startsWith('#')));
        const dead = [];
        for (const h of new Set(hrefs)) {
            const target = new URL(h, BASE + '/pages/about.html').toString();
            const r = await page.request.get(target);
            if (r.status() >= 400) dead.push(`${h} (${r.status()})`);
        }
        check('mobile nav links all resolve from a sub-page',
              dead.length === 0, dead.length ? dead.join(', ') : `${new Set(hrefs).size} links OK`);
        await ctx.close();
    }

    // ================= 4. keyboard: skip link + focus visibility =============
    console.log('\n--- Accessibility: keyboard ---');
    {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        const noFocusStyle = [];

        for (const [name, path] of PAGES) {
            await page.goto(BASE + path, { waitUntil: 'load' });
            await page.waitForTimeout(400);

            await page.keyboard.press('Tab');
            const first = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el) return null;
                const cs = getComputedStyle(el);
                return {
                    tag: el.tagName.toLowerCase(),
                    cls: typeof el.className === 'string' ? el.className : '',
                    text: (el.textContent || '').trim().slice(0, 40),
                    outline: cs.outlineStyle + ' ' + cs.outlineWidth,
                    shadow: cs.boxShadow !== 'none'
                };
            });
            if (!first || !/skip/i.test(first.cls)) {
                noFocusStyle.push(`${name}: first tab stop is ${first ? first.tag + '.' + first.cls.slice(0,20) : 'nothing'}`);
            }
        }
        check('skip link is the first tab stop on every page',
              noFocusStyle.length === 0,
              noFocusStyle.length ? noFocusStyle.join(' | ') : `all ${PAGES.length} pages`);

        // focus indicator must be perceivable
        await page.goto(BASE + '/index.html', { waitUntil: 'load' });
        await page.waitForTimeout(300);
        const indicators = [];
        for (let i = 0; i < 12; i++) {
            await page.keyboard.press('Tab');
            const st = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el === document.body) return null;
                const cs = getComputedStyle(el);
                return {
                    tag: el.tagName.toLowerCase(),
                    hasOutline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
                    hasShadow: cs.boxShadow !== 'none'
                };
            });
            if (st) indicators.push(st);
        }
        const unfocusable = indicators.filter(s => !s.hasOutline && !s.hasShadow);
        check('every tab stop shows a visible focus indicator',
              unfocusable.length === 0,
              `${indicators.length} stops checked, ${unfocusable.length} without outline/shadow`);

        // Escape closes the cart
        await page.click('.cart-toggle');
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        const closed = await page.$eval('.cart-sidebar', el => !el.classList.contains('active'));
        check('Escape closes the cart sidebar', closed, `closed=${closed}`);
        await ctx.close();
    }

    // ================= 5. form labelling / accessible names ==================
    console.log('\n--- Accessibility: names and labels ---');
    {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        const unlabelled = [];
        const namelessControls = [];

        for (const [name, path] of PAGES) {
            await page.goto(BASE + path, { waitUntil: 'load' });
            await page.waitForTimeout(400);

            const bad = await page.evaluate(() => {
                const noLabel = [];
                const noName = [];
                document.querySelectorAll('input, select, textarea').forEach(el => {
                    if (el.type === 'hidden') return;
                    const r = el.getBoundingClientRect();
                    if (!(r.width || r.height)) return;
                    const has = el.getAttribute('aria-label') ||
                                el.getAttribute('aria-labelledby') ||
                                (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) ||
                                el.closest('label') ||
                                el.getAttribute('placeholder');
                    if (!has) noLabel.push(`${el.tagName.toLowerCase()}[${el.type || ''}]${el.name ? '#' + el.name : ''}`);
                });
                document.querySelectorAll('button, a').forEach(el => {
                    const r = el.getBoundingClientRect();
                    if (!(r.width || r.height)) return;
                    const txt = (el.textContent || '').trim();
                    const has = txt || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') ||
                                el.getAttribute('title');
                    if (!has) noName.push(el.tagName.toLowerCase() +
                        (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''));
                });
                return { noLabel, noName };
            });

            if (bad.noLabel.length) unlabelled.push(`${name}: ${[...new Set(bad.noLabel)].slice(0,4).join(', ')}`);
            if (bad.noName.length) namelessControls.push(`${name}: ${[...new Set(bad.noName)].slice(0,4).join(', ')}`);
        }
        check('every visible form control has an accessible label',
              unlabelled.length === 0, unlabelled.length ? unlabelled.join('  |  ') : 'all labelled');
        check('every visible button and link has an accessible name',
              namelessControls.length === 0, namelessControls.length ? namelessControls.join('  |  ') : 'all named');
        await ctx.close();
    }

    // ================= 6. document structure ================================
    console.log('\n--- Accessibility: document structure ---');
    {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        const structural = [];

        for (const [name, path] of PAGES) {
            await page.goto(BASE + path, { waitUntil: 'load' });
            const s = await page.evaluate(() => ({
                lang: document.documentElement.getAttribute('lang'),
                h1: document.querySelectorAll('h1').length,
                main: document.querySelectorAll('main').length,
                title: document.title.trim().length
            }));
            const problems = [];
            if (!s.lang) problems.push('no lang');
            if (s.h1 !== 1) problems.push(`${s.h1} h1`);
            if (s.main !== 1) problems.push(`${s.main} main`);
            if (!s.title) problems.push('empty title');
            if (problems.length) structural.push(`${name}: ${problems.join(', ')}`);
        }
        check('every page has lang, one <h1>, one <main>, a title',
              structural.length === 0, structural.length ? structural.join('  |  ') : `all ${PAGES.length} pages`);
        await ctx.close();
    }

    await browser.close();

    const fail = results.filter(r => !r.pass).length;
    console.log('\n' + '='.repeat(72));
    console.log(`TOTAL: ${results.length - fail} passed, ${fail} failed`);
    if (fail) results.filter(r => !r.pass).forEach(r => console.log(`  FAIL ${r.name}\n       ${r.observed}`));
    console.log('='.repeat(72));
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
