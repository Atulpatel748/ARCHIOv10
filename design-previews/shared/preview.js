// Shared behaviour for the design-preview prototypes: scroll reveals, accessible menu dialog, preview-only forms.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal once on entering the viewport; with reduced motion, show everything immediately.
const revealables = document.querySelectorAll('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.12 }); // no negative root margin: content near the bottom of the first screen must still appear
  revealables.forEach((el) => io.observe(el));
}

// Menu dialog: focus moves in, Escape closes, focus returns to the toggle, page behind is inert.
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.getElementById('menu');
if (toggle && menu) {
  const behind = [...document.querySelectorAll('main, footer')];
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('[data-menu-label]')?.replaceChildren(open ? 'Close' : 'Menu');
    menu.toggleAttribute('data-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    behind.forEach((el) => (el.inert = open));
    document.documentElement.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a, button')?.focus();
    else toggle.focus();
  };
  menu.setAttribute('aria-hidden', 'true');
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false); });
}

// Tabs (WAI-ARIA pattern): click or arrow keys select; only the active tab is in the tab order.
for (const list of document.querySelectorAll('[role="tablist"]')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus();
  };
  list.addEventListener('click', (e) => { const t = e.target.closest('[role="tab"]'); if (t) select(t); });
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length]);
  });
}

// Preview forms never send anything; they show validation and a clear "preview only" state.
for (const form of document.querySelectorAll('[data-preview-form]')) {
  const status = form.querySelector('[data-form-status]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstInvalid = [...form.elements].find((el) => el.willValidate && !el.checkValidity());
    form.querySelectorAll('[data-error-for]').forEach((msg) => {
      const field = form.elements[msg.dataset.errorFor];
      const els = field instanceof RadioNodeList ? [...field] : [field];
      const bad = els.some((el) => !el.checkValidity());
      msg.hidden = !bad;
      els.forEach((el) => el.setAttribute('aria-invalid', String(bad)));
    });
    if (firstInvalid) {
      status.textContent = 'Please check the highlighted fields.';
      firstInvalid.focus();
      return;
    }
    status.textContent = 'Preview only: this form is not connected, so nothing was sent.';
  });
}
