// Shared harness for the browser audit.
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:5500';

const results = [];
let currentPage = '(setup)';

function setPage(name) { currentPage = name; }

function check(name, condition, observed) {
    results.push({ page: currentPage, name, pass: !!condition, observed });
    const tag = condition ? 'PASS' : 'FAIL';
    console.log(`  [${tag}] ${name}`);
    if (observed !== undefined) console.log(`         observed: ${observed}`);
}

function note(name, observed) {
    results.push({ page: currentPage, name, pass: null, observed });
    console.log(`  [INFO] ${name}`);
    if (observed !== undefined) console.log(`         ${observed}`);
}

// Launch a page with console/pageerror capture attached.
async function open(browser, path) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    const warnings = [];
    page.on('console', m => {
        if (m.type() === 'error') errors.push(m.text());
        if (m.type() === 'warning') warnings.push(m.text());
    });
    page.on('pageerror', e => errors.push('UNCAUGHT: ' + e.message));
    page.on('requestfailed', r => {
        // ignore favicon noise
        if (!/favicon/.test(r.url())) errors.push('REQ FAILED: ' + r.url());
    });
    const resp = await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(700); // let DOMContentLoaded handlers settle
    return { page, errors, warnings, status: resp.status() };
}

function summary() {
    const pass = results.filter(r => r.pass === true).length;
    const fail = results.filter(r => r.pass === false).length;
    const info = results.filter(r => r.pass === null).length;
    console.log('\n' + '='.repeat(70));
    console.log(`TOTAL: ${pass} passed, ${fail} failed, ${info} informational`);
    if (fail) {
        console.log('\nFAILURES:');
        results.filter(r => r.pass === false).forEach(r => {
            console.log(`  - [${r.page}] ${r.name}`);
            if (r.observed !== undefined) console.log(`      observed: ${r.observed}`);
        });
    }
    console.log('='.repeat(70));
    return fail;
}

module.exports = { chromium, BASE, open, check, note, setPage, summary, results };
