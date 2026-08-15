const {
    chromium,
    BASE,
    check,
    note,
    setPage,
    summary
} = require('./lib');

const PAGES = [
    {
        name: 'product.html',
        path: '/pages/product.html?id=radiance-serum',
        hasColors: true
    },
    {
        name: 'product-detail.html',
        path: '/pages/product-detail.html',
        hasColors: false
    }
];

const WAIT = 800;

async function activeCount(page, selector) {
    return page.locator(`${selector}.active`).count();
}

async function visiblePanelState(page) {
    return page.$$eval('.tab-panel', panels =>
        panels.map(panel => ({
            id: panel.id,
            active: panel.classList.contains('active'),
            visible: getComputedStyle(panel).display !== 'none'
        }))
    );
}

(async () => {
    const browser = await chromium.launch();

    try {
        for (const config of PAGES) {
            const context = await browser.newContext({
                viewport: { width: 1440, height: 900 }
            });

            const page = await context.newPage();
            const errors = [];

            page.on('console', message => {
                if (message.type() === 'error') {
                    errors.push(message.text());
                }
            });

            page.on('pageerror', error => {
                errors.push('UNCAUGHT: ' + error.message);
            });

            setPage(config.name);

            await page.goto(BASE + config.path, {
                waitUntil: 'load'
            });

            await page.waitForTimeout(1000);

            // -----------------------------------------------------------
            // BASIC PAGE
            // -----------------------------------------------------------

            check(
                'product page loads with product title',
                await page.locator('.product-title').count() === 1,
                await page.locator('.product-title').textContent()
            );

            check(
                'product page has no console/page errors',
                errors.length === 0,
                errors.length ? errors.slice(0, 5).join(' | ') : 'none'
            );

            // -----------------------------------------------------------
            // THUMBNAILS
            // -----------------------------------------------------------

            const thumbnails = page.locator('.thumbnail');
            const thumbnailCount = await thumbnails.count();

            check(
                'product gallery has thumbnails',
                thumbnailCount >= 2,
                `thumbnails=${thumbnailCount}`
            );

            const initialMainSrc = await page.$eval(
                '#main-product-image',
                image => image.getAttribute('src')
            );

            const targetThumbnail = thumbnails.nth(
                thumbnailCount >= 3 ? 2 : 1
            );

            const targetImage = await targetThumbnail.getAttribute('data-image');

            await targetThumbnail.scrollIntoViewIfNeeded();
            await page.waitForTimeout(200);
            await targetThumbnail.evaluate(element => element.click());
            await page.waitForFunction(
                expected => document.querySelector('#main-product-image')?.getAttribute('src') === expected,
                targetImage,
                { timeout: 2000 }
            );

            const changedMainSrc = await page.$eval(
                '#main-product-image',
                image => image.getAttribute('src')
            );

            check(
                'thumbnail click changes main product image',
                changedMainSrc === targetImage &&
                changedMainSrc !== initialMainSrc,
                `${initialMainSrc} -> ${changedMainSrc}`
            );

            check(
                'clicked thumbnail becomes active',
                await targetThumbnail.evaluate(
                    element => element.classList.contains('active')
                ),
                `active=${await targetThumbnail.evaluate(
                    element => element.classList.contains('active')
                )}`
            );

            check(
                'only one thumbnail is active',
                await activeCount(page, '.thumbnail') === 1,
                `active=${await activeCount(page, '.thumbnail')}`
            );

            // -----------------------------------------------------------
            // QUANTITY — MINIMUM
            // -----------------------------------------------------------

            const quantity = page.locator('#quantity');
            const minus = page.locator('.quantity-btn.minus');
            const plus = page.locator('.quantity-btn.plus');

            check(
                'quantity input starts at 1',
                Number(await quantity.inputValue()) === 1,
                `value=${await quantity.inputValue()}`
            );

            await minus.scrollIntoViewIfNeeded();
            await minus.click({ force: true });
            await page.waitForTimeout(150);

            check(
                'quantity cannot go below 1',
                Number(await quantity.inputValue()) === 1,
                `after minus=${await quantity.inputValue()}`
            );

            // -----------------------------------------------------------
            // QUANTITY — INCREMENT + UPPER BOUND
            // -----------------------------------------------------------

            await plus.scrollIntoViewIfNeeded();
            await plus.click({ force: true });
            await page.waitForTimeout(150);

            check(
                'quantity plus increments value',
                Number(await quantity.inputValue()) === 2,
                `after plus=${await quantity.inputValue()}`
            );

            for (let i = 0; i < 12; i++) {
                await plus.scrollIntoViewIfNeeded();
            await plus.click({ force: true });
            }

            await page.waitForTimeout(150);

            check(
                'quantity has upper bound of 10',
                Number(await quantity.inputValue()) === 10,
                `after repeated plus=${await quantity.inputValue()}`
            );

            // Return to 1 for predictable state.
            await quantity.fill('1');
            await page.waitForTimeout(100);

            // -----------------------------------------------------------
            // SIZE
            // -----------------------------------------------------------

            const sizeOptions = page.locator('.size-option');
            const sizeCount = await sizeOptions.count();

            check(
                'size selector exists',
                sizeCount >= 2,
                `sizes=${sizeCount}`
            );

            await sizeOptions.nth(1).scrollIntoViewIfNeeded();
            await sizeOptions.nth(1).click({ force: true });
            await page.waitForTimeout(150);

            check(
                'selected size becomes active',
                await sizeOptions.nth(1).evaluate(
                    element => element.classList.contains('active')
                ),
                `second size active=${await sizeOptions.nth(1).evaluate(
                    element => element.classList.contains('active')
                )}`
            );

            check(
                'only one size is active',
                await activeCount(page, '.size-option') === 1,
                `active=${await activeCount(page, '.size-option')}`
            );

            check(
                'first size is no longer active',
                !(await sizeOptions.nth(0).evaluate(
                    element => element.classList.contains('active')
                )),
                `first active=${await sizeOptions.nth(0).evaluate(
                    element => element.classList.contains('active')
                )}`
            );

            // -----------------------------------------------------------
            // COLORS / SHADES — product.html only
            // -----------------------------------------------------------

            if (config.hasColors) {
                const colors = page.locator('.color-option');
                const colorCount = await colors.count();

                check(
                    'color selector exists',
                    colorCount >= 2,
                    `colors=${colorCount}`
                );

                const secondColor = colors.nth(1);
                const colorImage = await secondColor.getAttribute('data-image');

                await secondColor.scrollIntoViewIfNeeded();
                await secondColor.evaluate(element => element.click());
                await page.waitForTimeout(150);

                check(
                    'selected color becomes active',
                    await secondColor.evaluate(
                        element => element.classList.contains('active')
                    ),
                    `second color active=${await secondColor.evaluate(
                        element => element.classList.contains('active')
                    )}`
                );

                await page.waitForFunction(
                    expected => document.querySelector('#main-product-image')?.getAttribute('src') === expected,
                    colorImage,
                    { timeout: 2000 }
                );

                const currentImage = await page.$eval(
                    '#main-product-image',
                    image => image.getAttribute('src')
                );

                check(
                    'only one color is active',
                    await activeCount(page, '.color-option') === 1,
                    `active=${await activeCount(page, '.color-option')}`
                );

                check(
                    'color selection updates product image',
                    currentImage === colorImage,
                    `${colorImage} -> ${currentImage}`
                );
            } else {
                note(
                    'product-detail has no color selector',
                    'not applicable on this page'
                );
            }

            // -----------------------------------------------------------
            // TABS
            // -----------------------------------------------------------

            const tabs = page.locator('.tab-btn');
            const tabPanels = page.locator('.tab-panel');
            const tabCount = await tabs.count();

            check(
                'product information tabs exist',
                tabCount >= 4,
                `tabs=${tabCount}`
            );

            check(
                'exactly one tab button is active initially',
                await activeCount(page, '.tab-btn') === 1,
                `active=${await activeCount(page, '.tab-btn')}`
            );

            check(
                'exactly one tab panel is active initially',
                await activeCount(page, '.tab-panel') === 1,
                `active=${await activeCount(page, '.tab-panel')}`
            );

            for (let i = 0; i < tabCount; i++) {
                const tab = tabs.nth(i);
                const tabId = await tab.getAttribute('data-tab');

                await tab.scrollIntoViewIfNeeded();
                await tab.click({ force: true });
                await page.waitForTimeout(150);

                const activeButtonCount = await activeCount(page, '.tab-btn');
                const activePanelCount = await activeCount(page, '.tab-panel');
                const states = await visiblePanelState(page);

                check(
                    `tab "${tabId}" becomes active`,
                    await tab.evaluate(
                        element => element.classList.contains('active')
                    ),
                    `active=${await tab.evaluate(
                        element => element.classList.contains('active')
                    )}`
                );

                check(
                    `tab "${tabId}" leaves exactly one active button`,
                    activeButtonCount === 1,
                    `active buttons=${activeButtonCount}`
                );

                check(
                    `tab "${tabId}" leaves exactly one active panel`,
                    activePanelCount === 1,
                    `active panels=${activePanelCount}`
                );

                check(
                    `tab "${tabId}" shows matching panel`,
                    states.length > 0 &&
                    states.filter(state => state.active).length === 1 &&
                    states.find(state => state.id === tabId)?.active === true,
                    JSON.stringify(states)
                );
            }

            // -----------------------------------------------------------
            // CHECK THAT THERE ARE NO STRAY ACTIVE STATES
            // -----------------------------------------------------------

            check(
                'only one thumbnail remains active',
                await activeCount(page, '.thumbnail') === 1,
                `active=${await activeCount(page, '.thumbnail')}`
            );

            check(
                'only one size remains active',
                await activeCount(page, '.size-option') === 1,
                `active=${await activeCount(page, '.size-option')}`
            );

            if (config.hasColors) {
                check(
                    'only one color remains active',
                    await activeCount(page, '.color-option') === 1,
                    `active=${await activeCount(page, '.color-option')}`
                );
            }

            await context.close();
        }
    } finally {
        await browser.close();
    }

    process.exit(summary() > 0 ? 1 : 0);
})().catch(error => {
    console.error('HARNESS ERROR:', error);
    process.exit(2);
});
