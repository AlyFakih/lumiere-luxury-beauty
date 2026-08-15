// ============================================================================
// Real Chrome production audit.
//
// Uses the Chrome DevTools Protocol directly (Network + Console domains) rather
// than Playwright's convenience events, because the question this suite exists
// to answer -- what happens to image requests that Firefox reports as
// NS_BINDING_ABORTED -- is only visible in Network.loadingFailed, which carries
// the canceled flag and the Chrome-side errorText.
//
// Run against local by default, or pass a base URL:
//   node tests/07-chrome-audit.js
//   node tests/07-chrome-audit.js https://lumiere-luxe.netlify.app
// ============================================================================

const { chromium } = require('playwright');

const BASE = (process.argv[2] || 'http://127.0.0.1:5500').replace(/\/$/, '');

const PAGES = [
    ['index',           '/index.html'],
    ['about',           '/pages/about.html'],
    ['category',        '/pages/category.html'],
    ['checkout',        '/pages/checkout.html'],
    ['product',         '/pages/product.html?id=radiance-serum'],
    ['product-detail',  '/pages/product-detail.html'],
    ['tutorials',       '/pages/tutorials.html'],
    ['cart',            '/pages/cart.html'],
    ['account',         '/pages/account.html'],
];

const results = [];

(async () => {
    const browser = await chromium.launch();
    console.log(`Chrome ${browser.version()}  |  base: ${BASE}\n`);

    for (const [name, path] of PAGES) {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        const cdp = await ctx.newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Log.enable');

        const requests = new Map();   // requestId -> {url, type}
        const failed = [];
        const statuses = [];
        const consoleErrors = [];
        const consoleWarnings = [];
        const exceptions = [];

        cdp.on('Network.requestWillBeSent', e => {
            requests.set(e.requestId, { url: e.request.url, type: e.type, initiator: e.initiator && e.initiator.type });
        });
        cdp.on('Network.responseReceived', e => {
            const r = requests.get(e.requestId) || {};
            r.status = e.response.status;
            r.mimeType = e.response.mimeType;
            r.fromCache = e.response.fromDiskCache;
            statuses.push({ url: e.response.url, status: e.response.status, type: e.type });
        });
        cdp.on('Network.loadingFailed', e => {
            const r = requests.get(e.requestId) || {};
            failed.push({
                url: r.url || '(unknown)',
                type: e.type,
                errorText: e.errorText,
                canceled: !!e.canceled,
                blockedReason: e.blockedReason || null
            });
        });
        cdp.on('Runtime.exceptionThrown', e => {
            const d = e.exceptionDetails;
            exceptions.push(d.exception ? (d.exception.description || d.text) : d.text);
        });
        cdp.on('Runtime.consoleAPICalled', e => {
            const text = e.args.map(a => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ');
            if (e.type === 'error') consoleErrors.push(text);
            if (e.type === 'warning') consoleWarnings.push(text);
        });
        cdp.on('Log.entryAdded', e => {
            const t = `${e.entry.source}: ${e.entry.text}`;
            if (e.entry.level === 'error') consoleErrors.push(t);
            else if (e.entry.level === 'warning') consoleWarnings.push(t);
        });

        const resp = await page.goto(BASE + path, { waitUntil: 'load' });
        // Let lazy-loading, IntersectionObservers and deferred work settle.
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(800);

        // --- rendered asset state, measured from the DOM ---
        const imgState = await page.$$eval('img', imgs => imgs.map(i => ({
            src: i.currentSrc || i.getAttribute('src') || '',
            complete: i.complete,
            w: i.naturalWidth,
            h: i.naturalHeight,
            hidden: !(i.offsetWidth || i.offsetHeight || i.getClientRects().length)
        })));
        const brokenImgs = imgState.filter(i => i.src && !i.hidden && (!i.complete || i.w === 0));
        const hiddenBroken = imgState.filter(i => i.src && i.hidden && (!i.complete || i.w === 0));

        const fonts = await page.evaluate(async () => {
            await document.fonts.ready;
            return Array.from(document.fonts).map(f => ({ family: f.family, status: f.status, weight: f.weight }));
        });
        const failedFonts = fonts.filter(f => f.status === 'error');

        const title = await page.title();
        const favicon = await page.$eval('link[rel*="icon"]', el => el.getAttribute('href')).catch(() => null);

        // external CDN leakage
        const externalFont = statuses.filter(s =>
            /cdnjs\.cloudflare\.com|fonts\.googleapis|fonts\.gstatic/.test(s.url));

        const http4xx5xx = statuses.filter(s => s.status >= 400);

        results.push({
            name, path, httpStatus: resp.status(), title, favicon,
            requests: requests.size,
            failed, http4xx5xx, externalFont,
            consoleErrors, consoleWarnings, exceptions,
            brokenImgs, hiddenBroken, imgTotal: imgState.length,
            failedFonts, fontCount: fonts.length
        });

        await ctx.close();
    }

    await browser.close();

    // ---------------------------------------------------------------- report
    let critical = 0, warn = 0;
    for (const r of results) {
        console.log(`=== ${r.name}  (${r.path}) ===`);
        console.log(`    HTTP ${r.httpStatus} | title: "${r.title}" | favicon: ${r.favicon || 'NONE'} | ${r.requests} requests`);
        console.log(`    images: ${r.imgTotal} total, ${r.brokenImgs.length} visible-broken, ${r.hiddenBroken.length} hidden-broken`);
        console.log(`    fonts : ${r.fontCount} faces, ${r.failedFonts.length} failed`);

        if (r.httpStatus >= 400) { console.log(`    [CRITICAL] page returned ${r.httpStatus}`); critical++; }
        if (r.exceptions.length) { console.log(`    [CRITICAL] ${r.exceptions.length} JS exception(s):`); r.exceptions.slice(0,3).forEach(e => console.log(`        ${e.split('\n')[0]}`)); critical++; }
        if (r.consoleErrors.length) { console.log(`    [CRITICAL] ${r.consoleErrors.length} console error(s):`); r.consoleErrors.slice(0,4).forEach(e => console.log(`        ${e.slice(0,140)}`)); critical++; }
        if (r.http4xx5xx.length) { console.log(`    [CRITICAL] ${r.http4xx5xx.length} request(s) 4xx/5xx:`); r.http4xx5xx.slice(0,6).forEach(s => console.log(`        ${s.status}  ${s.url}`)); critical++; }
        if (r.externalFont.length) { console.log(`    [CRITICAL] external font CDN request(s):`); r.externalFont.slice(0,4).forEach(s => console.log(`        ${s.url}`)); critical++; }
        if (r.brokenImgs.length) { console.log(`    [CRITICAL] visible broken image(s):`); r.brokenImgs.slice(0,6).forEach(i => console.log(`        ${i.src}`)); critical++; }
        if (r.failedFonts.length) { console.log(`    [CRITICAL] font face(s) failed:`); r.failedFonts.forEach(f => console.log(`        ${f.family} ${f.weight}`)); critical++; }

        if (r.failed.length) {
            const cancelled = r.failed.filter(f => f.canceled || /ABORTED|ERR_ABORTED/i.test(f.errorText));
            const realFail = r.failed.filter(f => !(f.canceled || /ABORTED|ERR_ABORTED/i.test(f.errorText)));
            if (cancelled.length) {
                console.log(`    [INFO] ${cancelled.length} cancelled request(s) (Chrome net::ERR_ABORTED / canceled=true):`);
                cancelled.slice(0,4).forEach(f => console.log(`        ${f.type.padEnd(8)} ${f.errorText.padEnd(18)} canceled=${f.canceled}  ${f.url.split('/').pop()}`));
            }
            if (realFail.length) {
                console.log(`    [CRITICAL] ${realFail.length} genuinely failed request(s):`);
                realFail.slice(0,6).forEach(f => console.log(`        ${f.errorText}  ${f.url}`));
                critical++;
            }
        }
        if (r.consoleWarnings.length) {
            console.log(`    [WARNING] ${r.consoleWarnings.length} console warning(s):`);
            r.consoleWarnings.slice(0,3).forEach(w => console.log(`        ${w.slice(0,140)}`));
            warn++;
        }
        console.log('');
    }

    console.log('='.repeat(72));
    console.log(`CRITICAL groups: ${critical}   |   pages with warnings: ${warn}   |   pages audited: ${results.length}`);
    console.log('='.repeat(72));
    process.exit(critical > 0 ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
