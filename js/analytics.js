/* ==========================================================================
   analytics.js — Umami event tracking.

   The desktop builds its UI from JavaScript, so instead of tagging each
   element with data-umami-event we listen once, at the document, and name
   every click from its own label. A new button is tracked with no extra code.

   Why not data-umami-event: Umami's tracker intercepts clicks on those
   elements, which can swallow the page's own click handlers.

   Events show up under Events in the Umami dashboard. The name says what was
   clicked ("Start menu: GitHub.exe"); the properties say where (app, window).
   ========================================================================== */

const MAX_NAME = 50;   // Umami rejects longer event names

/** Send one event. Never throws: analytics must not break the desktop. */
export function track(name, data) {
  try {
    window.umami?.track(String(name).slice(0, MAX_NAME), data);
  } catch { /* tracker blocked, offline or not loaded yet */ }
}

const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

/* aria-label first: icon-only buttons (window controls, Minesweeper face)
   have an emoji or no text at all. */
const labelOf = (el) =>
  el.getAttribute('aria-label') || el.getAttribute('title') || text(el) || 'unlabeled';

/* Which window a click happened in, e.g. the project or repo it is showing. */
function windowContext(el) {
  const win = el.closest('.w95-window');
  if (!win) return undefined;
  return { app: win.dataset.app, window: text(win.querySelector('.w95-titlebar-text')) };
}

function outboundEvent(rawUrl) {
  const u = new URL(rawUrl, location.href);
  return [`Outbound: ${u.hostname || u.protocol}`, { url: u.href }];
}

/* First matching rule wins, so keep the specific selectors above the
   generic `button` / `a[href]` fallbacks. Returning null ignores the click. */
const RULES = [
  ['.ms-cell',          () => null],   // thousands of board clicks per game
  ['.w95-tbtn',         (el) => [`Window: ${labelOf(el)}`, windowContext(el)]],
  ['.task-btn',         (el) => [`Taskbar: ${text(el)}`]],
  ['#start-btn',        () => ['Start button']],
  ['.start-item',       (el) => [`Start menu: ${text(el.querySelector(':scope > span'))}`]],
  ['.ctx-item',         (el) => [`Context menu: ${text(el)}`]],
  ['.w95-menubar-item', (el) => [`Menu bar: ${text(el)}`, windowContext(el)]],
  ['.icon',             (el) => [`Desktop icon: ${text(el.querySelector('.icon-label'))}`]],
  ['.pj-icon',          (el) => [`Project: ${text(el.querySelector('.pj-icon-label'))}`]],
  ['.gh-row',           (el) => [`Repo: ${text(el.querySelector('.gh-c-name'))}`]],
  ['.gh-node',          (el) => [`GitHub view: ${text(el)}`]],
  ['#boot, #splash',    () => ['Boot skipped']],
  ['a[href]',           (el) => {
    const u = new URL(el.getAttribute('href'), location.href);
    return u.origin === location.origin ? null : outboundEvent(u.href);   // skip in-page anchors
  }],
  ['button',            (el) => [`Button: ${labelOf(el)}`, windowContext(el)]],
];

function onClick(e) {
  if (!(e.target instanceof Element)) return;

  for (const [selector, build] of RULES) {
    const el = e.target.closest(selector);
    if (!el) continue;

    const event = build(el);
    if (event) track(...event);
    return;
  }
}

let started = false;

export function initAnalytics() {
  if (started) return;
  started = true;

  // Capture phase: several handlers in the shell call stopPropagation().
  document.addEventListener('click', onClick, true);

  // Buttons open external sites through window.open() with no <a> to inspect.
  // Wrapping it records the destination, which the button label can't say
  // (e.g. which project "View source" points at).
  const nativeOpen = window.open.bind(window);
  window.open = (url, ...rest) => {
    try { if (url) track(...outboundEvent(String(url))); } catch { /* bad URL */ }
    return nativeOpen(url, ...rest);
  };
}
