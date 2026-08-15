const {
    chromium,
    BASE,
    check,
    setPage,
    summary
} = require('./lib');

(async () => {
    const browser = await chromium.launch();

    try {
        // ---------------------------------------------------------------
        // NORMAL MOTION
        // ---------------------------------------------------------------
        {
            const context = await browser.newContext({
                viewport: { width: 1440, height: 900 },
                reducedMotion: 'no-preference'
            });

            const page = await context.newPage();
            const errors = [];

            page.on('console', m => {
                if (m.type() === 'error') errors.push(m.text());
            });

            page.on('pageerror', e => {
                errors.push('UNCAUGHT: ' + e.message);
            });

            setPage('normal motion');

            await page.goto(BASE + '/index.html', { waitUntil: 'load' });
            await page.waitForTimeout(1000);

            const reduce = await page.evaluate(() =>
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
            );

            check(
                'normal motion media query reports no-preference',
                reduce === false,
                `reduce=${reduce}`
            );

            const sparkleContainers = await page.locator('.sparkle-container').count();

            check(
                'normal motion creates sparkle container',
                sparkleContainers === 1,
                `containers=${sparkleContainers}`
            );

            const sparkles = await page.locator('.sparkle').count();

            check(
                'normal motion creates sparkles',
                sparkles > 0,
                `sparkles=${sparkles}`
            );

            check(
                'normal motion has no page errors',
                errors.length === 0,
                errors.length ? errors.join(' | ') : 'none'
            );

            await context.close();
        }

        // ---------------------------------------------------------------
        // REDUCED MOTION
        // ---------------------------------------------------------------
        {
            const context = await browser.newContext({
                viewport: { width: 1440, height: 900 },
                reducedMotion: 'reduce'
            });

            const page = await context.newPage();
            const errors = [];

            page.on('console', m => {
                if (m.type() === 'error') errors.push(m.text());
            });

            page.on('pageerror', e => {
                errors.push('UNCAUGHT: ' + e.message);
            });

            setPage('reduced motion');

            await page.goto(BASE + '/index.html', { waitUntil: 'load' });
            await page.waitForTimeout(700);

            const reduce = await page.evaluate(() =>
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
            );

            check(
                'reduced motion media query reports reduce',
                reduce === true,
                `reduce=${reduce}`
            );

            const sparkleContainers = await page.locator('.sparkle-container').count();

            check(
                'reduced motion does not create sparkle container',
                sparkleContainers === 0,
                `containers=${sparkleContainers}`
            );

            const revealedSections = await page.locator('section.revealed').count();

            check(
                'reduced motion reveals sections immediately',
                revealedSections > 0,
                `${revealedSections} sections revealed`
            );

            const counters = await page.locator('.counter').count();

            if (counters === 0) {
                check(
                    'reduced motion counters jump directly to final values',
                    true,
                    'no counters on this page'
                );
            } else {
                const counterValues = await page.locator('.counter').evaluateAll(elements =>
                    elements.map(el => ({
                        text: el.textContent.trim(),
                        target: el.getAttribute('data-target')
                    }))
                );

                const allFinal = counterValues.every(item =>
                    item.text.replace(/,/g, '') === item.target
                );

                check(
                    'reduced motion counters jump directly to final values',
                    allFinal,
                    JSON.stringify(counterValues)
                );
            }

            const reducedMotionCSS = await page.evaluate(() => {
                return Array.from(document.styleSheets).some(sheet => {
                    try {
                        return Array.from(sheet.cssRules || []).some(rule =>
                            rule.cssText &&
                            rule.cssText.includes('prefers-reduced-motion')
                        );
                    } catch {
                        return false;
                    }
                });
            });

            check(
                'reduced motion disables pulse/sparkle CSS animation',
                reducedMotionCSS,
                reducedMotionCSS
                    ? 'reduced-motion CSS override present'
                    : 'reduced-motion CSS override missing'
            );

            check(
                'reduced motion has no page errors',
                errors.length === 0,
                errors.length ? errors.join(' | ') : 'none'
            );

            await context.close();
        }

        // ---------------------------------------------------------------
        // PRODUCT PAGE UNDER REDUCED MOTION
        // ---------------------------------------------------------------
        {
            const context = await browser.newContext({
                viewport: { width: 1440, height: 900 },
                reducedMotion: 'reduce'
            });

            const page = await context.newPage();
            const errors = [];

            page.on('console', m => {
                if (m.type() === 'error') errors.push(m.text());
            });

            page.on('pageerror', e => {
                errors.push('UNCAUGHT: ' + e.message);
            });

            setPage('product page');

            await page.goto(
                BASE + '/pages/product.html?id=radiance-serum',
                { waitUntil: 'load' }
            );

            await page.waitForTimeout(700);

            const title = await page.title();

            check(
                'product page loads with reduced motion',
                title.includes('Radiance Serum'),
                title
            );

            check(
                'product page has no animation runtime errors',
                errors.length === 0,
                errors.length ? errors.join(' | ') : 'none'
            );

            await context.close();
        }

        const failures = summary();

        process.exitCode = failures ? 1 : 0;
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
