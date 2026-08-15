const { chromium, check, note, summary } = require('./lib');

const PATH = '/pages/checkout.html';
const WAIT = 700;

async function activeFormStep(page) {
    return page.$eval('.form-step.active', el => el.id);
}

async function fillInformation(page) {
    await page.fill('#first-name', 'Fatima');
    await page.fill('#last-name', 'Saleh');
    await page.fill('#email', 'test@example.com');
    await page.fill('#address', '123 Main Street');
    await page.fill('#city', 'Beirut');
    await page.fill('#zip', '0000');
    await page.selectOption('#country', 'US');
    await page.fill('#phone', '+96170123456');
}

(async () => {
    const browser = await chromium.launch();

    try {
        const page = await browser.newPage({
            viewport: { width: 1440, height: 900 }
        });

        const errors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        page.on('pageerror', err => {
            errors.push('UNCAUGHT: ' + err.message);
        });

        await page.goto(
            `http://127.0.0.1:5500${PATH}`,
            { waitUntil: 'load' }
        );

        await page.waitForTimeout(WAIT);

        check(
            'checkout page loads',
            page.url().includes('/pages/checkout.html'),
            page.url()
        );

        check(
            'starts on information step',
            await activeFormStep(page) === 'information-step',
            `active=${await activeFormStep(page)}`
        );

        check(
            'three checkout steps exist',
            await page.locator('.checkout-steps .step').count() === 3,
            `count=${await page.locator('.checkout-steps .step').count()}`
        );

        // Empty validation
        await page.locator('.next-step').first().click({ force: true });
        await page.waitForTimeout(250);

        check(
            'empty information is rejected',
            await page.locator('.error-message').count() > 0,
            `errors=${await page.locator('.error-message').count()}`
        );

        check(
            'validation keeps information step active',
            await activeFormStep(page) === 'information-step',
            `active=${await activeFormStep(page)}`
        );

        // Valid information
        await fillInformation(page);

        await page.locator(
            '.next-step[data-step="shipping-step"]'
        ).click({ force: true });

        await page.waitForTimeout(WAIT);

        check(
            'information advances to shipping',
            await activeFormStep(page) === 'shipping-step',
            `active=${await activeFormStep(page)}`
        );

        // Shipping
        check(
            'three shipping options exist',
            await page.locator('input[name="shipping"]').count() === 3,
            `count=${await page.locator('input[name="shipping"]').count()}`
        );

        check(
            'standard shipping is free initially',
            (await page.locator('.shipping-value').textContent()).trim() === 'Free',
            (await page.locator('.shipping-value').textContent()).trim()
        );

        await page.locator('label[for="express"]').click({ force: true });
        await page.waitForTimeout(150);

        check(
            'express shipping costs $12',
            (await page.locator('.shipping-value').textContent()).trim() === '$12.00',
            (await page.locator('.shipping-value').textContent()).trim()
        );

        await page.locator('label[for="overnight"]').click({ force: true });
        await page.waitForTimeout(150);

        check(
            'overnight shipping costs $25',
            (await page.locator('.shipping-value').textContent()).trim() === '$25.00',
            (await page.locator('.shipping-value').textContent()).trim()
        );

        // Payment
        await page.locator(
            '.next-step[data-step="payment-step"]'
        ).click({ force: true });

        await page.waitForTimeout(WAIT);

        check(
            'shipping advances to payment',
            await activeFormStep(page) === 'payment-step',
            `active=${await activeFormStep(page)}`
        );

        check(
            'three payment methods exist',
            await page.locator('input[name="payment"]').count() === 3,
            `count=${await page.locator('input[name="payment"]').count()}`
        );

        check(
            'credit card form initially active',
            await page.locator('.credit-card-form').evaluate(
                el => el.classList.contains('active')
            ),
            'active=true'
        );

        await page.locator('label[for="paypal"]').click({ force: true });
        await page.waitForTimeout(150);

        check(
            'PayPal hides credit card form',
            !(await page.locator('.credit-card-form').evaluate(
                el => el.classList.contains('active')
            )),
            'active=false'
        );

        await page.locator('label[for="apple-pay"]').click({ force: true });
        await page.waitForTimeout(150);

        check(
            'Apple Pay hides credit card form',
            !(await page.locator('.credit-card-form').evaluate(
                el => el.classList.contains('active')
            )),
            'active=false'
        );

        await page.locator('label[for="credit-card"]').click({ force: true });
        await page.waitForTimeout(150);

        check(
            'credit card restores credit card form',
            await page.locator('.credit-card-form').evaluate(
                el => el.classList.contains('active')
            ),
            'active=true'
        );

        // Card formatting
        await page.fill('#card-number', '1234567890123456');
        await page.waitForTimeout(100);

        check(
            'card number formatting works',
            await page.inputValue('#card-number') === '1234 5678 9012 3456',
            `value=${await page.inputValue('#card-number')}`
        );

        await page.fill('#expiry', '1230');
        await page.waitForTimeout(100);

        check(
            'expiry formatting works',
            await page.inputValue('#expiry') === '12/30',
            `value=${await page.inputValue('#expiry')}`
        );

        await page.fill('#cvv', '123');
        await page.fill('#name-on-card', 'Fatima Saleh');

        // Promo
        await page.locator('.gift-code-input input').fill('WELCOME15');
        await page.locator('.apply-code').click({ force: true });
        await page.waitForTimeout(150);

        check(
            'WELCOME15 promo succeeds',
            await page.locator('.promo-success').count() === 1,
            `success=${await page.locator('.promo-success').count()}`
        );

        check(
            'WELCOME15 updates total',
            (await page.locator('.amount').textContent()).trim() === '$315.16',
            `total=${(await page.locator('.amount').textContent()).trim()}`
        );

        // Complete order
        await page.locator('.complete-order').click({ force: true });
        await page.waitForTimeout(2300);

        check(
            'confirmation modal opens',
            await page.locator('.order-confirmation-modal').evaluate(
                el => el.classList.contains('active')
            ),
            'active=true'
        );

        check(
            'confirmation contains order number',
            /Order #/i.test(
                await page.locator('.order-confirmation-modal').textContent()
            ),
            'order number present'
        );

        check(
            'confirmation email is updated',
            (await page.locator('.order-email').textContent()).trim()
                === 'test@example.com',
            (await page.locator('.order-email').textContent()).trim()
        );

        // Close confirmation
        await page.locator(
            '.order-confirmation-modal .close-modal'
        ).click({ force: true });

        await page.waitForTimeout(200);

        check(
            'confirmation modal closes',
            !(await page.locator('.order-confirmation-modal').evaluate(
                el => el.classList.contains('active')
            )),
            'active=false'
        );

        check(
            'checkout has no console/page errors',
            errors.length === 0,
            errors.length ? errors.slice(0, 5).join(' | ') : 'none'
        );

        await browser.close();
        process.exit(summary() > 0 ? 1 : 0);

    } catch (error) {
        console.error('HARNESS ERROR:', error);
        await browser.close();
        process.exit(2);
    }
})();
