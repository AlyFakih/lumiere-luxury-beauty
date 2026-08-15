// ============================================================================
// Account page
// Front-end demonstration only. Nothing is submitted to a server and no
// credentials are stored; the forms exercise the shared validation helpers in
// utils.js and then show a confirmation state.
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const tabs = Array.from(document.querySelectorAll('.account-tab'));
    const panels = Array.from(document.querySelectorAll('.account-form'));
    if (!tabs.length) return;

    function select(tab) {
        tabs.forEach(t => {
            const selected = t === tab;
            t.setAttribute('aria-selected', selected ? 'true' : 'false');
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) panel.hidden = !selected;
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => select(tab));

        // Roving arrow-key navigation, per the WAI tabs pattern.
        tab.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            const i = tabs.indexOf(tab);
            const next = e.key === 'ArrowRight'
                ? tabs[(i + 1) % tabs.length]
                : tabs[(i - 1 + tabs.length) % tabs.length];
            next.focus();
            select(next);
        });
    });

    // Both forms validate client-side then confirm. No network request is made.
    panels.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (typeof validateForm === 'function' && !validateForm(form)) {
                if (typeof showToast === 'function') {
                    showToast('Please correct the highlighted fields', 'error', 3000);
                }
                return;
            }

            const isRegister = form.id === 'panel-register';
            if (typeof showToast === 'function') {
                showToast(
                    isRegister
                        ? 'Demo only - no account was created'
                        : 'Demo only - no sign-in was performed',
                    'info',
                    3500
                );
            }
            form.reset();
        });
    });
});
