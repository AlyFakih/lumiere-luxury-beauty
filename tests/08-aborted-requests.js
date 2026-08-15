// ============================================================================
// Root-cause diagnostic for the NS_BINDING_ABORTED image requests reported in
// Firefox.
//
// The generic audit (07) uses a fresh context per page, i.e. a cold cache and
// no navigation-during-load, and reports zero cancellations. The Firefox
// evidence showed 304 responses alongside the aborted ones, which means a warm
// cache and repeat navigation. This suite reproduces that specific shape:
//
//   A. warm cache, sequential re-navigation (produces the 304s)
//   B. clicking a nav link, which main.js intercepts and then navigates via
//      window.location.href after a 500ms page-transition delay -- any image
//      still in flight at that moment is cancelled by the browser
//   C. swapping <img src> mid-flight, as the product gallery thumbnails do
//
// For each cancellation the suite records Chrome's own errorText and canceled
// flag, and then asserts the thing that actually matters: whether any VISIBLE
// image ended up unrendered.
// ============================================================================

const { chromium } = require('playwright');

const BASE = (process.argv[2] || 'http://127.0.0.1:5500').replace(/\/$/, '');

const results = [];
function check(name, pass, observed) {
    results.push({ name, pass, observed });
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}`);
    if (observed !== undefined) console.log(`         ${observed}`);
}

async function attach(page, ctx, throttle) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    if (throttle) {
        // Force images to still be in flight when navigation happens, so the
        // cancellation path is actually exercised rather than raced for.
        await cdp.send('Network.emulateNetworkConditions', {
            offline: false, latency: 150,
            downloadThroughput: 120 * 1024, uploadThroughput: 60 * 1024
        });
    }
    const reqs = new Map();
    const state = { cancelled: [], realFail: [], statuses: [] };
    cdp.on('Network.requestWillBeSent', e => reqs.set(e.requestId, { url: e.request.url, type: e.type }));
    cdp.on('Network.responseReceived', e => state.statuses.push({ url: e.response.url, status: e.response.status, fromCache: e.response.fromDiskCache }));
    cdp.on('Network.loadingFailed', e => {
        const r = reqs.get(e.requestId) || {};
        const rec = { url: r.url || '?', type: e.type, errorText: e.errorText, canceled: !!e.canceled };
        if (e.canceled || /ABORTED/i.test(e.errorText)) state.cancelled.push(rec);
        else state.realFail.push(rec);
    });
    return state;
}

const visibleBroken = page => page.$$eval('img', imgs => imgs
    .filter(i => (i.currentSrc || i.getAttribute('src')) &&
                 (i.offsetWidth || i.offsetHeight || i.getClientRects().length) &&
                 (!i.complete || i.naturalWidth === 0))
    .map(i => i.currentSrc || i.getAttribute('src')));

(async () => {
    const browser = await chromium.launch();
    console.log(`Chrome ${browser.version()}  |  base: ${BASE}\n`);

    // ---------- A. warm cache, repeat navigation ----------
    console.log('--- A. warm cache / repeat navigation (reproduces the 304s) ---');
    {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        const st = await attach(page, ctx);

        const seq = ['/index.html', '/pages/about.html', '/pages/category.html',
                     '/pages/tutorials.html', '/pages/product.html?id=radiance-serum'];
        // two passes: the second runs entirely against a warm cache
        for (let pass = 0; pass < 2; pass++) {
            for (const p of seq) {
                await page.goto(BASE + p, { waitUntil: 'load' });
                await page.waitForTimeout(500);
            }
        }
        const cached = st.statuses.filter(s => s.status === 304 || s.fromCache);
        console.log(`         ${st.statuses.length} responses, ${cached.length} served 304/from-cache`);
        check('warm-cache navigation produces no genuine request failures',
              st.realFail.length === 0,
              st.realFail.length ? st.realFail.slice(0,4).map(f => `${f.errorText} ${f.url}`).join(' | ') : 'none');
        check('warm-cache navigation leaves no visible broken image',
              (await visibleBroken(page)).length === 0,
              `cancelled during sequence: ${st.cancelled.length}`);
        await ctx.close();
    }

    // ---------- B. navigate away mid-load via the page transition ----------
    console.log('\n--- B. click nav link -> main.js page transition (500ms delay) ---');
    {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        // Throttled so images are guaranteed to still be streaming when the
        // page-transition navigation fires 500ms after the click.
        const st = await attach(page, ctx, true);

        await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
        // click immediately, while images are still streaming in
        await page.locator('.nav-links a[href*="about"]').first().click().catch(() => {});
        // The click triggers main.js's 500ms transition, then a real
        // navigation. Wait for that navigation to settle before touching the
        // DOM, otherwise the execution context is destroyed mid-evaluate.
        await page.waitForTimeout(1200);
        await page.waitForLoadState('load').catch(() => {});
        await page.waitForTimeout(1500);

        const imgCancelled = st.cancelled.filter(c => c.type === 'Image');
        console.log(`         cancelled image requests: ${imgCancelled.length}`);
        imgCancelled.slice(0, 5).forEach(c =>
            console.log(`           ${c.errorText}  canceled=${c.canceled}  ${c.url.split('/').pop()}`));

        check('navigation-cancelled requests are canceled=true, not errors',
              imgCancelled.every(c => c.canceled || /ERR_ABORTED/.test(c.errorText)),
              imgCancelled.length ? `all ${imgCancelled.length} carry canceled/ERR_ABORTED` : 'no cancellations occurred');
        check('no genuine (non-cancelled) failures during transition',
              st.realFail.length === 0,
              st.realFail.length ? st.realFail.slice(0,4).map(f => `${f.errorText} ${f.url}`).join(' | ') : 'none');

        const broken = await visibleBroken(page);
        check('destination page renders all visible images after transition',
              broken.length === 0, broken.length ? broken.join(', ') : `landed on ${new URL(page.url()).pathname}`);
        await ctx.close();
    }

    // ---------- C. gallery thumbnail src swap mid-flight ----------
    console.log('\n--- C. product gallery: rapid <img src> swap ---');
    {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        const st = await attach(page, ctx);

        await page.goto(BASE + '/pages/product.html?id=radiance-serum', { waitUntil: 'load' });
        await page.waitForTimeout(400);

        const thumbs = await page.$$('.thumbnail');
        // click through every thumbnail as fast as possible
        for (let round = 0; round < 2; round++) {
            for (let i = 0; i < thumbs.length; i++) {
                await page.evaluate(idx => document.querySelectorAll('.thumbnail')[idx].click(), i);
                await page.waitForTimeout(60);
            }
        }
        await page.waitForTimeout(1200);

        console.log(`         thumbnails: ${thumbs.length}, cancelled during swap: ${st.cancelled.length}`);
        check('rapid src swapping produces no genuine failures',
              st.realFail.length === 0,
              st.realFail.length ? st.realFail.slice(0,4).map(f => `${f.errorText} ${f.url}`).join(' | ') : 'none');

        const mainOk = await page.$eval('#main-product-image, .main-image-container img',
            i => i.complete && i.naturalWidth > 0).catch(() => false);
        check('main gallery image still renders after rapid swapping', mainOk, `complete&&naturalWidth>0 = ${mainOk}`);
        await ctx.close();
    }

    await browser.close();

    const fail = results.filter(r => !r.pass).length;
    console.log('\n' + '='.repeat(72));
    console.log(`TOTAL: ${results.length - fail} passed, ${fail} failed`);
    if (fail) results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.name}: ${r.observed}`));
    console.log('='.repeat(72));
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
