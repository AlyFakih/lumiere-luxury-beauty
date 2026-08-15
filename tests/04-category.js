const {
    chromium,
    BASE,
    check,
    note,
    setPage,
    summary
} = require('./lib');

const WAIT = 1800;

async function visibleProducts(page) {
    return page.$$eval('.product-card', cards =>
        cards
            .filter(card => {
                const style = getComputedStyle(card);
                return style.display !== 'none' &&
                       parseFloat(style.opacity || '1') > 0;
            })
            .map(card => ({
                name: card.querySelector('h3')?.textContent.trim() || '',
                category: card.dataset.category || '',
                type: card.dataset.type || '',
                price: Number(card.dataset.price)
            }))
    );
}

async function productCount(page) {
    return page.$eval('#product-count', el => Number(el.textContent.trim()));
}

async function clearFilters(page) {
    await page.locator('.clear-filters').click();
    await page.waitForTimeout(WAIT);
}

async function selectFilter(page, selector) {
    await page.locator(selector).check();
    await page.waitForTimeout(WAIT);
}

async function selectSort(page, value) {
    await page.locator('#sort-select').selectOption(value);
    await page.waitForTimeout(WAIT);
}

(async () => {
    const browser = await chromium.launch();

    try {
        setPage('category.html');

        const context = await browser.newContext({
            viewport: { width: 1440, height: 900 }
        });

        const page = await context.newPage();
        const errors = [];

        page.on('console', message => {
            if (message.type() === 'error') errors.push(message.text());
        });

        page.on('pageerror', error => {
            errors.push('UNCAUGHT: ' + error.message);
        });

        await page.goto(BASE + '/pages/category.html', {
            waitUntil: 'load'
        });

        await page.waitForTimeout(1000);

        // ---------------------------------------------------------------
        // PAGE BASELINE
        // ---------------------------------------------------------------

        const initialProducts = await visibleProducts(page);
        const initialDisplayedCount = await productCount(page);

        check(
            'category page loads',
            initialProducts.length > 0,
            `visible products=${initialProducts.length}`
        );

        check(
            'initial product-count matches visible products',
            initialDisplayedCount === initialProducts.length,
            `displayed=${initialDisplayedCount} actual=${initialProducts.length}`
        );

        // Keep the real baseline for later clear-filter verification.
        const baselineCount = initialProducts.length;
        const baselineNames = initialProducts.map(p => p.name);

        // ---------------------------------------------------------------
        // CATEGORY FILTERS — individually
        // ---------------------------------------------------------------

        const categoryFilters = [
            ['makeup', '#makeup'],
            ['skincare', '#skincare'],
            ['fragrance', '#fragrance'],
            ['tools', '#tools']
        ];

        for (const [name, selector] of categoryFilters) {
            await clearFilters(page);
            await selectFilter(page, selector);

            const visible = await visibleProducts(page);
            const count = await productCount(page);

            check(
                `${name} filter changes visible product count`,
                visible.length > 0 && visible.length < baselineCount,
                `visible=${visible.length} baseline=${baselineCount}`
            );

            check(
                `${name} filter shows only ${name} products`,
                visible.every(product => product.category === name),
                visible.map(product => product.category).join(', ') || 'none'
            );

            check(
                `${name} filter updates product-count`,
                count === visible.length,
                `displayed=${count} actual=${visible.length}`
            );
        }

        // ---------------------------------------------------------------
        // PRODUCT TYPE FILTERS — individually
        // ---------------------------------------------------------------

        const typeFilters = [
            ['lipstick', '#lipstick'],
            ['foundation', '#foundation'],
            ['moisturizer', '#moisturizer'],
            ['serum', '#serum'],
            ['perfume', '#perfume'],
            ['brush', '#brush']
        ];

        for (const [name, selector] of typeFilters) {
            await clearFilters(page);
            await selectFilter(page, selector);

            const visible = await visibleProducts(page);
            const count = await productCount(page);

            check(
                `${name} type filter returns products`,
                visible.length > 0,
                `visible=${visible.length}`
            );

            check(
                `${name} type filter shows only ${name}`,
                visible.every(product => product.type === name),
                visible.map(product => product.type).join(', ') || 'none'
            );

            check(
                `${name} type filter updates product-count`,
                count === visible.length,
                `displayed=${count} actual=${visible.length}`
            );
        }

        // ---------------------------------------------------------------
        // COMBINED FILTERS
        // ---------------------------------------------------------------

        await clearFilters(page);

        await page.locator('#skincare').check();
        await page.locator('#serum').check();
        await page.waitForTimeout(WAIT);

        let visible = await visibleProducts(page);
        let count = await productCount(page);

        check(
            'combined skincare + serum filter returns products',
            visible.length > 0,
            `visible=${visible.length}`
        );

        check(
            'combined skincare + serum filter requires both conditions',
            visible.every(product =>
                product.category === 'skincare' &&
                product.type === 'serum'
            ),
            visible.map(product => `${product.category}/${product.type}`).join(', ') || 'none'
        );

        check(
            'combined filter updates product-count',
            count === visible.length,
            `displayed=${count} actual=${visible.length}`
        );

        // Makeup + lipstick
        await clearFilters(page);

        await page.locator('#makeup').check();
        await page.locator('#lipstick').check();
        await page.waitForTimeout(WAIT);

        visible = await visibleProducts(page);

        check(
            'combined makeup + lipstick filter requires both conditions',
            visible.every(product =>
                product.category === 'makeup' &&
                product.type === 'lipstick'
            ),
            visible.map(product => `${product.category}/${product.type}`).join(', ') || 'none'
        );

        // ---------------------------------------------------------------
        // CLEAR ALL
        // ---------------------------------------------------------------

        await clearFilters(page);

        const afterClear = await visibleProducts(page);
        const countAfterClear = await productCount(page);

        check(
            'Clear All restores baseline product count',
            afterClear.length === baselineCount,
            `restored=${afterClear.length} baseline=${baselineCount}`
        );

        check(
            'Clear All restores original product order',
            afterClear.map(product => product.name).join('|') === baselineNames.join('|'),
            afterClear.map(product => product.name).join(' | ')
        );

        check(
            'Clear All resets product-count',
            countAfterClear === baselineCount,
            `displayed=${countAfterClear} actual=${baselineCount}`
        );

        // ---------------------------------------------------------------
        // SORTING — full unfiltered grid
        // ---------------------------------------------------------------

        const sortOptions = [
            ['featured', 'Featured'],
            ['price-low', 'Price: Low to High'],
            ['price-high', 'Price: High to Low'],
            ['newest', 'Newest'],
            ['bestselling', 'Best Selling']
        ];

        const fullNames = afterClear.map(product => product.name);
        note(
            'baseline product order',
            fullNames.join(' | ')
        );

        for (const [value, label] of sortOptions) {
            await clearFilters(page);

            await selectSort(page, value);

            const sorted = await visibleProducts(page);

            check(
                `${label} sort preserves product count`,
                sorted.length === baselineCount,
                `visible=${sorted.length} baseline=${baselineCount}`
            );

            check(
                `${label} sort contains valid product data`,
                sorted.every(product =>
                    product.name &&
                    product.category &&
                    product.type &&
                    Number.isFinite(product.price)
                ),
                sorted.map(product => `${product.name}:$${product.price}`).join(' | ')
            );

            if (value === 'price-low') {
                const prices = sorted.map(product => product.price);
                const ascending = prices.every(
                    (price, i) => i === 0 || prices[i - 1] <= price
                );

                check(
                    'Price: Low to High is actually ascending',
                    ascending,
                    prices.join(' -> ')
                );
            }

            if (value === 'price-high') {
                const prices = sorted.map(product => product.price);
                const descending = prices.every(
                    (price, i) => i === 0 || prices[i - 1] >= price
                );

                check(
                    'Price: High to Low is actually descending',
                    descending,
                    prices.join(' -> ')
                );
            }

            if (value === 'featured') {
                const names = sorted.map(product => product.name);

                check(
                    'Featured preserves original ordering',
                    names.join('|') === fullNames.join('|'),
                    names.join(' | ')
                );
            }

            if (value === 'newest' || value === 'bestselling') {
                note(
                    `${label} is non-deterministic demo sort`,
                    sorted.map(product => product.name).join(' | ')
                );
            }
        }

        // ---------------------------------------------------------------
        // SORT AFTER FILTER — important regression check
        // ---------------------------------------------------------------

        await clearFilters(page);

        await page.locator('#makeup').check();
        await page.waitForTimeout(WAIT);

        const makeupBeforeSort = await visibleProducts(page);

        await selectSort(page, 'price-low');

        const makeupAfterSort = await visibleProducts(page);

        check(
            'sorting a filtered category preserves filtered product set',
            makeupAfterSort.length === makeupBeforeSort.length &&
            makeupAfterSort.every(product => product.category === 'makeup'),
            makeupAfterSort.map(product => `${product.name}:${product.category}`).join(' | ')
        );

        const makeupPrices = makeupAfterSort.map(product => product.price);
        const makeupAscending = makeupPrices.every(
            (price, i) => i === 0 || makeupPrices[i - 1] <= price
        );

        check(
            'sorting filtered category preserves price ordering',
            makeupAscending,
            makeupPrices.join(' -> ')
        );

        // ---------------------------------------------------------------
        // CONSOLE CLEANLINESS
        // ---------------------------------------------------------------

        check(
            'category.html has no console/page errors',
            errors.length === 0,
            errors.length ? errors.slice(0, 5).join(' | ') : 'none'
        );

        await context.close();
    } finally {
        await browser.close();
    }

    process.exit(summary() > 0 ? 1 : 0);
})().catch(error => {
    console.error('HARNESS ERROR:', error);
    process.exit(2);
});
