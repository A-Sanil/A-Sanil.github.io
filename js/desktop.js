/* ==========================================================================
   desktop.js — the shell. Boots the machine, paints the desktop, owns the
   taskbar, Start menu and context menu, and wires icons to applications.
   ========================================================================== */

import { WindowManager, isMobile, escapeHtml } from './wm.js';
import * as icons from './icons.js';

import { githubApp } from './apps/github.js';
import { linkedinApp } from './apps/linkedin.js';
import { projectsApp } from './apps/projects.js';
import { notepadApp } from './apps/notepad.js';
import { minesweeperApp } from './apps/minesweeper.js';
import { computerApp } from './apps/computer.js';
import { spotifyApp } from './apps/spotify.js';

const desktopEl = document.getElementById('desktop');
const iconsEl = document.getElementById('icons');
const tasksEl = document.getElementById('tasks');
const startBtn = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');
const ctxMenu = document.getElementById('context-menu');
const clockEl = document.getElementById('clock');

const wm = new WindowManager(desktopEl, tasksEl);

/* ============================================================ message box */

/* A one-off dialog window. Cheap enough to define as an app on the fly. */
function messageBox({ title, text, icon = icons.helpBook, buttons = ['OK'] }) {
  return wm.open({
    id: 'msgbox',
    title,
    icon,
    singleton: false,
    resizable: false,
    width: 340,
    height: 160,
    mount(body, win) {
      body.innerHTML = `
        <div class="w95-pad" style="display:flex;gap:14px;flex:1;align-items:flex-start">
          <div style="width:32px;height:32px;flex:none">${icon}</div>
          <div class="w95-selectable" style="flex:1">${text}</div>
        </div>
        <div style="display:flex;gap:6px;justify-content:center;padding:0 8px 8px">
          ${buttons.map((b) => `<button class="w95-btn">${escapeHtml(b)}</button>`).join('')}
        </div>`;
      for (const b of body.querySelectorAll('.w95-btn')) {
        b.addEventListener('click', () => wm.close(win));
      }
    },
  }, { key: `msg-${Date.now()}` });
}

const openExternal = (url) => window.open(url, '_blank', 'noopener');

/* ========================================================== desktop icons */

const DESKTOP_ICONS = [
  { label: 'My Computer',   icon: icons.myComputer,  app: computerApp },
  { label: 'Projects',      icon: icons.folder,      app: projectsApp },
  { label: 'GitHub.exe',    icon: icons.github,      app: githubApp },
  { label: 'Spotify.exe',   icon: icons.spotify,     app: spotifyApp },
  // Opens the real profile in a new tab. The in-desktop LinkedIn window is
  // still available from Start -> Programs.
  { label: 'LinkedIn',      icon: icons.linkedin,
    action: () => openExternal('https://www.linkedin.com/in/aaditya-sanil') },
  { label: 'about_me.txt',  icon: icons.notepad,     app: notepadApp },
  { label: 'Minesweeper',   icon: icons.mine,        app: minesweeperApp },
  {
    label: 'Recycle Bin',
    icon: icons.recycleEmpty,
    action: () => messageBox({
      title: 'Recycle Bin',
      text: 'The Recycle Bin is empty.<br><br>Every abandoned side project is still on a branch somewhere.',
      icon: icons.recycleEmpty,
    }),
  },
];

function paintIcons() {
  iconsEl.innerHTML = DESKTOP_ICONS.map((d, i) => `
    <div class="icon" data-i="${i}" tabindex="0" role="button">
      <div class="icon-img">${d.icon}</div>
      <div class="icon-label">${escapeHtml(d.label)}</div>
    </div>`).join('');

  let selected = null;

  for (const el of iconsEl.querySelectorAll('.icon')) {
    const def = DESKTOP_ICONS[+el.dataset.i];
    const launch = () => (def.app ? wm.open(def.app) : def.action());

    el.addEventListener('click', () => {
      selected?.classList.remove('is-selected');
      el.classList.add('is-selected');
      selected = el;
      // Touch has no hover and no reliable dblclick — one tap opens.
      if (isMobile()) launch();
    });

    el.addEventListener('dblclick', launch);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); launch(); }
    });
  }

  // Clicking bare desktop clears the selection.
  desktopEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.icon') || e.target.closest('.w95-window')) return;
    selected?.classList.remove('is-selected');
    selected = null;
  });
}

/* ============================================================= Start menu */

const START_ITEMS = [
  {
    label: 'Programs', icon: icons.folder, sub: [
      { label: 'GitHub.exe',   icon: icons.github,  app: githubApp },
      { label: 'LinkedIn.exe', icon: icons.linkedin, app: linkedinApp },
      { label: 'Spotify.exe',  icon: icons.spotify, app: spotifyApp },
      { label: 'Projects',     icon: icons.folder,  app: projectsApp },
      { label: 'Notepad',      icon: icons.notepad, app: notepadApp },
      { label: 'Minesweeper',  icon: icons.mine,    app: minesweeperApp },
    ],
  },
  {
    label: 'Documents', icon: icons.notepad, sub: [
      { label: 'about_me.txt', icon: icons.notepad, app: notepadApp },
    ],
  },
  {
    label: 'Settings', icon: icons.settings, sub: [
      { label: 'Restart', icon: icons.run, action: () => location.reload() },
    ],
  },
  { label: 'Find', icon: icons.globe, action: () => openExternal('https://github.com/A-Sanil') },
  {
    label: 'Help', icon: icons.helpBook,
    action: () => messageBox({
      title: 'Help',
      text: 'Double-click a desktop icon to open it.<br>' +
            'Drag title bars to move windows, edges to resize.<br><br>' +
            'In Minesweeper, right-click to flag and middle-click a number to chord.',
    }),
  },
  {
    label: 'Run...', icon: icons.run,
    action: () => messageBox({
      title: 'Run',
      text: 'Windows cannot find <b>a_real_command_prompt.exe</b>.<br><br>' +
            'Make sure you typed the name correctly, and then try again.',
      icon: icons.run,
    }),
  },
  { separator: true },
  { label: 'Shut Down...', icon: icons.shutdown, action: shutDown },
];

function renderStartItems(items) {
  return items.map((item, i) => {
    if (item.separator) return '<div class="start-sep"></div>';
    const hasSub = !!item.sub;
    return `
      <div class="start-item${hasSub ? ' has-sub' : ''}" data-path="${i}">
        ${item.icon ?? ''}<span>${escapeHtml(item.label)}</span>
        ${hasSub ? `<div class="start-sub">${renderStartItems(item.sub)}</div>` : ''}
      </div>`;
  }).join('');
}

function buildStartMenu() {
  startMenu.innerHTML = `
    <div class="start-banner"><span>Sanil<b>95</b></span></div>
    <div class="start-items">${renderStartItems(START_ITEMS)}</div>`;

  // Walk the rendered tree and bind leaves back to their definitions.
  const bind = (container, items) => {
    const rows = [...container.children].filter((el) => el.classList.contains('start-item'));
    let n = 0;
    for (const item of items) {
      if (item.separator) continue;
      const el = rows[n++];
      if (!el) continue;

      if (item.sub) {
        bind(el.querySelector('.start-sub'), item.sub);
        // On mobile the submenu is always expanded, so the parent is inert.
        if (isMobile()) continue;
        el.addEventListener('click', (e) => e.stopPropagation());
      } else {
        el.addEventListener('click', () => {
          closeStart();
          if (item.app) wm.open(item.app);
          else item.action?.();
        });
      }
    }
  };

  bind(startMenu.querySelector('.start-items'), START_ITEMS);
}

const openStart = () => {
  startMenu.classList.add('is-open');
  startBtn.classList.add('is-active');
};

const closeStart = () => {
  startMenu.classList.remove('is-open');
  startBtn.classList.remove('is-active');
};

const toggleStart = () =>
  (startMenu.classList.contains('is-open') ? closeStart() : openStart());

/* =========================================================== context menu */

const CTX_ITEMS = [
  { label: 'Open GitHub.exe', action: () => wm.open(githubApp) },
  { label: 'Open Projects',   action: () => wm.open(projectsApp) },
  { separator: true },
  { label: 'Properties',      action: () => wm.open(computerApp) },
];

function buildContextMenu() {
  ctxMenu.innerHTML = CTX_ITEMS
    .map((it, i) => (it.separator
      ? '<div class="start-sep"></div>'
      : `<div class="ctx-item" data-i="${i}">${escapeHtml(it.label)}</div>`))
    .join('');

  for (const el of ctxMenu.querySelectorAll('.ctx-item')) {
    el.addEventListener('click', () => {
      ctxMenu.classList.remove('is-open');
      CTX_ITEMS[+el.dataset.i].action();
    });
  }

  desktopEl.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.w95-window')) return;   // let apps have their own
    e.preventDefault();
    ctxMenu.classList.add('is-open');

    // Flip the menu back on-screen when opened near an edge.
    const { offsetWidth: w, offsetHeight: h } = ctxMenu;
    ctxMenu.style.left = `${Math.min(e.clientX, window.innerWidth - w - 4)}px`;
    ctxMenu.style.top = `${Math.min(e.clientY, window.innerHeight - h - 4)}px`;
  });
}

/* ================================================================ shutdown */

function shutDown() {
  closeStart();
  wm.closeAll();

  const screen = document.createElement('div');
  screen.id = 'shutdown';
  screen.innerHTML = `
    <p>It is now safe to turn off<br>your computer.</p>
    <button class="w95-btn">Restart</button>`;
  document.body.appendChild(screen);

  screen.querySelector('.w95-btn').addEventListener('click', () => location.reload());
}

/* =================================================================== clock */

function startClock() {
  const tick = () => {
    clockEl.textContent = new Date()
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  tick();
  setInterval(tick, 10_000);
}

/* ==================================================================== boot */

const BIOS = [
  'Award Modular BIOS v4.51PG, An Energy Star Ally',
  'Copyright (C) 1984-95, Award Software, Inc.',
  '',
  'SANIL SYSTEMS  ::  PORTFOLIO BUILD 95.08',
  '',
  'Main Processor      : Pentium(R) 200MHz',
  'Memory Test         : 65536K OK',
  '',
  'Detecting IDE Primary Master   ... A-SANIL-PORTFOLIO',
  'Detecting IDE Primary Slave    ... GITHUB.EXE',
  'Detecting IDE Secondary Master ... LINKEDIN.EXE',
  'Detecting IDE Secondary Slave  ... SPOTIFY.EXE',
  '',
  'Berkeley, CA                   ... OK',
  'Rust / Python / C++            ... OK',
  'Coffee                         ... NOT FOUND',
  '',
  'Starting Windows 95...',
];

async function boot() {
  const bootEl = document.getElementById('boot');
  const splashEl = document.getElementById('splash');
  const lines = bootEl.querySelector('.boot-lines');
  const fill = splashEl.querySelector('.w95-progress-fill');

  // The boot plays on every load — it's the first impression. The only
  // automatic bypass is a reduced-motion preference; everyone else can
  // click, tap or press a key to skip it.
  let skipped = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skip = () => { skipped = true; };

  bootEl.addEventListener('click', skip);
  splashEl.addEventListener('click', skip);
  document.addEventListener('keydown', skip, { once: true });

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  if (!skipped) {
    for (const line of BIOS) {
      if (skipped) break;
      lines.textContent += line + '\n';
      await wait(line ? 85 : 30);
    }
    if (!skipped) await wait(350);
  }

  bootEl.classList.add('is-hidden');
  splashEl.classList.remove('is-hidden');

  // Progress bar runs for ~1.4s, or snaps shut if the visitor skipped.
  for (let p = 0; p <= 100; p += 4) {
    if (skipped) break;
    fill.style.width = `${p}%`;
    await wait(55);
  }
  if (!skipped) await wait(300);

  splashEl.classList.add('is-hidden');

  // Nothing is auto-opened on a phone — a window would cover the desktop
  // before the visitor has seen there is one.
  if (!isMobile()) wm.open(computerApp);
}

/* =================================================================== init */

paintIcons();
buildStartMenu();
buildContextMenu();
startClock();

startBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleStart(); });

document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) closeStart();
  if (!e.target.closest('#context-menu')) ctxMenu.classList.remove('is-open');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeStart(); ctxMenu.classList.remove('is-open'); }
});

boot();
