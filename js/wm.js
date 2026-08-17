/* ==========================================================================
   wm.js — the window manager.

   Apps register a definition and ask the WM to open it. The WM owns chrome,
   stacking, focus, drag/resize and the taskbar; apps only ever touch the
   body element they are handed.

   App definition:
     { id, title, icon, width, height, minWidth, minHeight,
       resizable = true, singleton = true, menu = [], mount(body, win) }
   ========================================================================== */

const MOBILE_QUERY = '(max-width: 767px), (pointer: coarse) and (max-width: 900px)';

/* Keep this in sync with the media query in desktop.css — the JS needs to
   know when the CSS has forced every window fullscreen so it can stop
   offering drag and resize. */
const mobile = window.matchMedia(MOBILE_QUERY);

export const isMobile = () => mobile.matches;

let zCounter = 100;
let cascade = 0;

export class WindowManager {
  /**
   * @param {HTMLElement} desktop  container windows are positioned inside
   * @param {HTMLElement} tasks    taskbar strip that holds task buttons
   */
  constructor(desktop, tasks) {
    this.desktop = desktop;
    this.tasks = tasks;
    this.windows = new Map(); // key -> window record
    this.focused = null;

    // A window that was fullscreen on mobile must get real geometry back
    // when the viewport grows, otherwise it stays pinned at 0,0.
    mobile.addEventListener('change', () => this.#reflow());
  }

  /* ---------------------------------------------------------------- open */

  open(app, opts = {}) {
    const key = app.singleton === false ? `${app.id}:${opts.key ?? ++cascade}` : app.id;

    const existing = this.windows.get(key);
    if (existing) {
      this.restore(existing);
      this.focus(existing);
      return existing;
    }

    const win = this.#build(app, key, opts);
    this.windows.set(key, win);
    this.desktop.appendChild(win.el);
    this.#addTaskButton(win);

    // Mount after insertion so apps can measure their own layout.
    try {
      app.mount?.(win.body, win);
    } catch (err) {
      console.error(`[${app.id}] failed to mount`, err);
      win.body.innerHTML =
        `<div class="w95-pad">This application has performed an illegal operation.<br><br>
         <span class="w95-mono w95-selectable">${escapeHtml(String(err))}</span></div>`;
    }

    this.focus(win);
    return win;
  }

  #build(app, key, opts) {
    const el = document.createElement('div');
    el.className = 'w95-window';
    el.dataset.app = app.id;

    const w = opts.width ?? app.width ?? 520;
    const h = opts.height ?? app.height ?? 380;

    const el_ = el.style;

    // autoSize apps shrink-wrap their content instead of being given a size.
    // Measuring chrome from JS to fake this is fragile — CSS knows better.
    if (app.autoSize) {
      el.classList.add('is-autosize');
    } else {
      el_.width = `${w}px`;
      el_.height = `${h}px`;
    }

    const pos = this.#nextPosition(w, h);
    el_.left = `${pos.x}px`;
    el_.top = `${pos.y}px`;
    el_.zIndex = ++zCounter;

    el.innerHTML = `
      <div class="w95-titlebar">
        <div class="w95-titlebar-icon">${app.icon ?? ''}</div>
        <div class="w95-titlebar-text"></div>
        <div class="w95-titlebar-controls">
          <button class="w95-tbtn w95-tbtn--min" aria-label="Minimize" title="Minimize"></button>
          ${app.autoSize ? '' :
            `<button class="w95-tbtn w95-tbtn--max" aria-label="Maximize" title="Maximize"></button>`}
          <button class="w95-tbtn w95-tbtn--close" aria-label="Close" title="Close"></button>
        </div>
      </div>
      ${app.menu?.length ? `<div class="w95-menubar"></div>` : ''}
      <div class="w95-body"></div>`;

    const win = {
      key,
      app,
      el,
      opts,        // whatever the opener passed, e.g. the repo an app should show
      wm: this,    // so an app can open further windows without importing the shell
      title: opts.title ?? app.title,
      body: el.querySelector('.w95-body'),
      titleEl: el.querySelector('.w95-titlebar-text'),
      minimized: false,
      maximized: false,
      // Geometry remembered across maximize and across mobile fullscreen.
      rect: { x: pos.x, y: pos.y, w, h },
      taskBtn: null,
    };

    win.titleEl.textContent = win.title;

    if (app.menu?.length) this.#buildMenu(win, el.querySelector('.w95-menubar'));
    if (app.resizable !== false) this.#addResizeHandles(win);

    this.#wireChrome(win);
    return win;
  }

  #nextPosition(w, h) {
    if (isMobile()) return { x: 0, y: 0 };

    const bounds = this.desktop.getBoundingClientRect();
    const step = 24;
    const n = this.windows.size;

    // Cascade, then wrap back to the top-left once we would run off-screen.
    const maxSteps = Math.max(1, Math.floor((bounds.height - h - 40) / step));
    const i = n % maxSteps;

    let x = 32 + i * step;
    let y = 24 + i * step;

    x = Math.max(0, Math.min(x, bounds.width - w));
    y = Math.max(0, Math.min(y, bounds.height - h));
    return { x, y };
  }

  /* -------------------------------------------------------------- chrome */

  #wireChrome(win) {
    const { el } = win;
    const bar = el.querySelector('.w95-titlebar');

    el.addEventListener('pointerdown', () => this.focus(win), true);

    el.querySelector('.w95-tbtn--min').addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimize(win);
    });

    el.querySelector('.w95-tbtn--max')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(win);
    });

    el.querySelector('.w95-tbtn--close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.close(win);
    });

    bar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.w95-tbtn')) return;
      this.toggleMaximize(win);
    });

    this.#makeDraggable(win, bar);
  }

  #buildMenu(win, bar) {
    for (const item of win.app.menu) {
      const el = document.createElement('div');
      el.className = 'w95-menubar-item';
      el.textContent = item.label;
      el.addEventListener('click', () => item.onSelect?.(win));
      bar.appendChild(el);
    }
  }

  /* ---------------------------------------------------------------- drag */

  #makeDraggable(win, handle) {
    handle.addEventListener('pointerdown', (e) => {
      // Buttons, and mobile where windows are pinned fullscreen.
      if (e.button !== 0 || e.target.closest('.w95-tbtn')) return;
      if (isMobile() || win.maximized) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = win.el.offsetLeft;
      const origY = win.el.offsetTop;
      const bounds = this.desktop.getBoundingClientRect();

      handle.setPointerCapture(e.pointerId);
      win.el.classList.add('is-dragging');

      const move = (ev) => {
        // Clamp so the title bar can never be dragged out of reach.
        const x = clamp(origX + ev.clientX - startX, -(win.el.offsetWidth - 80), bounds.width - 80);
        const y = clamp(origY + ev.clientY - startY, 0, bounds.height - 24);
        win.el.style.left = `${x}px`;
        win.el.style.top = `${y}px`;
      };

      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        win.el.classList.remove('is-dragging');
        this.#remember(win);
      };

      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
      e.preventDefault();
    });
  }

  /* -------------------------------------------------------------- resize */

  #addResizeHandles(win) {
    for (const dir of ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se']) {
      const grip = document.createElement('div');
      grip.className = `w95-resize w95-resize--${dir}`;
      grip.addEventListener('pointerdown', (e) => this.#startResize(e, win, dir, grip));
      win.el.appendChild(grip);
    }
  }

  #startResize(e, win, dir, grip) {
    if (e.button !== 0 || isMobile() || win.maximized) return;
    e.stopPropagation();
    e.preventDefault();

    const minW = win.app.minWidth ?? 200;
    const minH = win.app.minHeight ?? 120;
    const startX = e.clientX;
    const startY = e.clientY;
    const r = { x: win.el.offsetLeft, y: win.el.offsetTop, w: win.el.offsetWidth, h: win.el.offsetHeight };

    grip.setPointerCapture(e.pointerId);
    win.el.classList.add('is-dragging');

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let { x, y, w, h } = r;

      if (dir.includes('e')) w = Math.max(minW, r.w + dx);
      if (dir.includes('s')) h = Math.max(minH, r.h + dy);
      // West/north edges move the origin as well as the size, and must stop
      // moving once the window hits its minimum or it drifts.
      if (dir.includes('w')) { w = Math.max(minW, r.w - dx); x = r.x + (r.w - w); }
      if (dir.includes('n')) { h = Math.max(minH, r.h - dy); y = r.y + (r.h - h); }

      Object.assign(win.el.style, {
        left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`,
      });
    };

    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
      win.el.classList.remove('is-dragging');
      this.#remember(win);
      win.app.onResize?.(win);
    };

    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  }

  #remember(win) {
    if (isMobile() || win.maximized || win.app.autoSize) return;
    win.rect = {
      x: win.el.offsetLeft, y: win.el.offsetTop,
      w: win.el.offsetWidth, h: win.el.offsetHeight,
    };
  }

  #reflow() {
    // Coming back from mobile: restore each window's remembered geometry.
    if (isMobile()) return;
    for (const win of this.windows.values()) {
      if (win.maximized || win.app.autoSize) continue;
      Object.assign(win.el.style, {
        left: `${win.rect.x}px`, top: `${win.rect.y}px`,
        width: `${win.rect.w}px`, height: `${win.rect.h}px`,
      });
    }
  }

  /* --------------------------------------------------------- state changes */

  focus(win) {
    if (this.focused === win && !win.minimized) return;

    for (const w of this.windows.values()) {
      w.el.classList.toggle('is-focused', w === win);
      w.taskBtn?.classList.toggle('is-active', w === win && !w.minimized);
    }

    win.el.style.zIndex = ++zCounter;
    this.focused = win;
    win.app.onFocus?.(win);
  }

  minimize(win) {
    win.minimized = true;
    win.el.classList.add('is-minimized');
    win.taskBtn?.classList.remove('is-active');
    if (this.focused === win) this.focused = null;
    this.#focusTopmost();
  }

  restore(win) {
    win.minimized = false;
    win.el.classList.remove('is-minimized');
  }

  toggleMaximize(win) {
    if (isMobile()) return;        // already fullscreen; the button is hidden anyway
    if (win.app.autoSize) return;  // shrink-wrapped windows have no other size

    win.maximized = !win.maximized;
    win.el.classList.toggle('is-maximized', win.maximized);

    const btn = win.el.querySelector('.w95-tbtn--max, .w95-tbtn--restore');
    btn.className = `w95-tbtn w95-tbtn--${win.maximized ? 'restore' : 'max'}`;
    btn.setAttribute('aria-label', win.maximized ? 'Restore' : 'Maximize');
    btn.title = win.maximized ? 'Restore' : 'Maximize';

    if (!win.maximized) {
      Object.assign(win.el.style, {
        left: `${win.rect.x}px`, top: `${win.rect.y}px`,
        width: `${win.rect.w}px`, height: `${win.rect.h}px`,
      });
    }

    win.app.onResize?.(win);
  }

  close(win) {
    win.app.onClose?.(win);
    win.el.remove();
    win.taskBtn?.remove();
    this.windows.delete(win.key);
    if (this.focused === win) this.focused = null;
    this.#focusTopmost();
  }

  closeAll() {
    for (const win of [...this.windows.values()]) this.close(win);
  }

  #focusTopmost() {
    let top = null;
    for (const w of this.windows.values()) {
      if (w.minimized) continue;
      if (!top || +w.el.style.zIndex > +top.el.style.zIndex) top = w;
    }
    if (top) this.focus(top);
  }

  setTitle(win, title) {
    win.title = title;
    win.titleEl.textContent = title;
    const label = win.taskBtn?.querySelector('span');
    if (label) label.textContent = title;
  }

  /* ------------------------------------------------------------- taskbar */

  #addTaskButton(win) {
    const btn = document.createElement('button');
    btn.className = 'w95-btn task-btn';
    btn.innerHTML = `${win.app.icon ?? ''}<span></span>`;
    btn.querySelector('span').textContent = win.title;

    btn.addEventListener('click', () => {
      // Clicking the active window's button minimizes it, matching Win95.
      if (this.focused === win && !win.minimized) {
        this.minimize(win);
      } else {
        this.restore(win);
        this.focus(win);
      }
    });

    win.taskBtn = btn;
    this.tasks.appendChild(btn);
  }
}

/* ------------------------------------------------------------- utilities */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
