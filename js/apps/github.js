/* ==========================================================================
   github.js — GitHub.exe, an Explorer-style browser over the real account.

   Data comes from data/github.json, refreshed nightly by a GitHub Action.
   That keeps the window instant and spends none of a visitor's 60-req/hr
   unauthenticated API budget. If the file is missing we fall back to hitting
   the API live so the app still works on a fresh clone.
   ========================================================================== */

import { escapeHtml } from '../wm.js';
import { renderMarkdown, fetchReadme } from '../md.js';
import * as icons from '../icons.js';

const USER = 'A-Sanil';

/* GitHub's own language colours, for the bars and list dots. */
const LANG_COLOR = {
  Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
  CSS: '#563d7c', 'Jupyter Notebook': '#DA5B0B', Julia: '#a270ba', 'C#': '#178600',
  C: '#555555', 'C++': '#f34b7d', Java: '#b07219', Rust: '#dea584', Go: '#00ADD8',
  Shell: '#89e051', PowerShell: '#012456', Dockerfile: '#384d54', Makefile: '#427819',
  Batchfile: '#C1F12E', R: '#198CE7', Ruby: '#701516',
};

const langColor = (l) => LANG_COLOR[l] ?? '#8b8b8b';

let cache = null;

async function loadData() {
  if (cache) return cache;

  try {
    const res = await fetch('data/github.json', { cache: 'no-cache' });
    if (res.ok) return (cache = await res.json());
  } catch { /* fall through to the live API */ }

  // Live fallback: enough to populate the list, without language totals.
  const [user, repos] = await Promise.all([
    fetch(`https://api.github.com/users/${USER}`).then((r) => r.json()),
    fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`).then((r) => r.json()),
  ]);

  return (cache = {
    generated: null,
    user,
    languages: {},
    repos: (Array.isArray(repos) ? repos : [])
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name, description: r.description, language: r.language,
        stars: r.stargazers_count, forks: r.forks_count, size: r.size,
        topics: r.topics ?? [], url: r.html_url, homepage: r.homepage,
        pushed: r.pushed_at, created: r.created_at,
      })),
  });
}

/* -------------------------------------------------------------- formatting */

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ` +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const fmtBytes = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} KB`;
  return `${n} B`;
};

/* ============================================================== GitHub.exe */

export const githubApp = {
  id: 'github',
  title: 'GitHub — A-Sanil',
  icon: icons.github,
  width: 720,
  height: 460,
  minWidth: 420,
  minHeight: 260,

  menu: [
    { label: 'File', onSelect: (w) => w.wm.close(w) },
    { label: 'View', onSelect: (w) => w.el.querySelector('.gh-tree')?.classList.toggle('is-hidden') },
    { label: 'Help', onSelect: () => window.open(`https://github.com/${USER}`, '_blank', 'noopener') },
  ],

  async mount(body, win) {
    body.innerHTML = `
      <div class="gh-toolbar">
        <span>Address</span>
        <div class="gh-address w95-sunken"><span>https://github.com/${USER}</span></div>
        <button class="w95-btn gh-open">Open in browser</button>
      </div>
      <div class="gh-split">
        <div class="gh-tree w95-field w95-scroll"></div>
        <div class="gh-main w95-field w95-scroll"></div>
      </div>
      <div class="w95-statusbar">
        <div class="w95-statusbar-cell gh-status">Loading…</div>
        <div class="w95-statusbar-cell gh-sync" style="flex:0 0 auto"></div>
      </div>`;

    const tree = body.querySelector('.gh-tree');
    const main = body.querySelector('.gh-main');
    const status = body.querySelector('.gh-status');
    const sync = body.querySelector('.gh-sync');

    body.querySelector('.gh-open')
      .addEventListener('click', () => window.open(`https://github.com/${USER}`, '_blank', 'noopener'));

    let data;
    try {
      data = await loadData();
    } catch (err) {
      main.innerHTML = `<div class="w95-pad">Could not reach GitHub.<br><br>
        <span class="w95-mono">${escapeHtml(String(err))}</span></div>`;
      status.textContent = 'Offline';
      return;
    }

    const repos = data.repos ?? [];
    sync.textContent = data.generated ? `Synced ${fmtDate(data.generated)}` : 'Live';

    /* --- left tree --- */
    const views = [
      { id: 'repos', label: `Repositories (${repos.length})`, icon: icons.folder },
      { id: 'languages', label: 'Languages', icon: icons.settings },
      { id: 'profile', label: 'Profile', icon: icons.myComputer },
    ];

    tree.innerHTML = `
      <div class="w95-list">
        <div class="w95-item gh-root"><span class="gh-ico">${icons.github}</span>${escapeHtml(USER)}</div>
        ${views.map((v) => `
          <div class="w95-item gh-node" data-view="${v.id}">
            <span class="gh-ico">${v.icon}</span>${escapeHtml(v.label)}
          </div>`).join('')}
      </div>`;

    const show = (viewId) => {
      for (const n of tree.querySelectorAll('.gh-node')) {
        n.classList.toggle('is-selected', n.dataset.view === viewId);
      }
      main.scrollTop = 0;

      if (viewId === 'repos')     return renderRepos(main, status, repos, win);
      if (viewId === 'languages') return renderLanguages(main, status, data.languages ?? {});
      if (viewId === 'profile')   return renderProfile(main, status, data.user ?? {}, repos);
    };

    for (const node of tree.querySelectorAll('.gh-node')) {
      node.addEventListener('click', () => show(node.dataset.view));
    }

    show('repos');
  },
};

/* ------------------------------------------------------------------ views */

function renderRepos(main, status, repos, win) {
  main.innerHTML = `
    <div class="gh-cols">
      <span class="gh-c-name">Name</span>
      <span class="gh-c-lang">Language</span>
      <span class="gh-c-num">Stars</span>
      <span class="gh-c-date">Last push</span>
    </div>
    <div class="gh-rows">
      ${repos.map((r, i) => `
        <div class="gh-row w95-item" data-i="${i}" tabindex="0">
          <span class="gh-c-name" title="${escapeHtml(r.description ?? '')}">
            <span class="gh-ico">${icons.folder}</span>${escapeHtml(r.name)}
          </span>
          <span class="gh-c-lang">
            ${r.language ? `<i class="gh-dot" style="background:${langColor(r.language)}"></i>${escapeHtml(r.language)}` : '—'}
          </span>
          <span class="gh-c-num">${r.stars || ''}</span>
          <span class="gh-c-date">${fmtDate(r.pushed)}</span>
        </div>`).join('')}
    </div>`;

  status.textContent = `${repos.length} object(s)  —  double-click to open`;

  let selected = null;
  for (const row of main.querySelectorAll('.gh-row')) {
    const repo = repos[+row.dataset.i];

    row.addEventListener('click', () => {
      selected?.classList.remove('is-selected');
      row.classList.add('is-selected');
      selected = row;
      status.textContent = repo.description || repo.name;
    });

    const open = () => win.wm.open(repoApp, { key: repo.name, title: repo.name, data: repo });
    row.addEventListener('dblclick', open);
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
  }
}

function renderLanguages(main, status, languages) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  if (!total) {
    main.innerHTML = `<div class="w95-pad">No language data in this snapshot.</div>`;
    status.textContent = 'Languages';
    return;
  }

  main.innerHTML = `
    <div class="w95-pad">
      <div class="gh-langbar">
        ${entries.map(([l, v]) =>
          `<i style="width:${(v / total) * 100}%;background:${langColor(l)}" title="${escapeHtml(l)}"></i>`).join('')}
      </div>
      <table class="gh-table">
        ${entries.map(([l, v]) => `
          <tr>
            <td><i class="gh-dot" style="background:${langColor(l)}"></i>${escapeHtml(l)}</td>
            <td class="gh-c-num">${((v / total) * 100).toFixed(1)}%</td>
            <td class="gh-c-num">${fmtBytes(v)}</td>
          </tr>`).join('')}
      </table>
    </div>`;

  status.textContent = `${entries.length} languages  —  ${fmtBytes(total)} total`;
}

function renderProfile(main, status, user, repos) {
  const stars = repos.reduce((s, r) => s + (r.stars || 0), 0);

  main.innerHTML = `
    <div class="w95-pad gh-profile">
      <img class="gh-avatar" src="${escapeHtml(user.avatar_url ?? '')}" alt="" width="96" height="96">
      <div class="gh-profile-copy w95-selectable">
        <h2>${escapeHtml(user.name ?? user.login ?? USER)}</h2>
        <p class="gh-login">@${escapeHtml(user.login ?? USER)}</p>
        ${user.bio ? `<p>${escapeHtml(user.bio.trim())}</p>` : ''}
        <div class="w95-divider"></div>
        <table class="gh-table">
          <tr><td>Location</td><td>${escapeHtml(user.location ?? '—')}</td></tr>
          <tr><td>Public repos</td><td>${user.public_repos ?? repos.length}</td></tr>
          <tr><td>Total stars</td><td>${stars}</td></tr>
          <tr><td>Followers</td><td>${user.followers ?? '—'}</td></tr>
          <tr><td>Member since</td><td>${fmtDate(user.created_at)}</td></tr>
        </table>
      </div>
    </div>`;

  status.textContent = `Profile — @${user.login ?? USER}`;
}

/* ================================================== repo detail sub-window */

export const repoApp = {
  id: 'repo',
  title: 'Repository',
  icon: icons.folder,
  singleton: false,   // one window per repo
  width: 620,
  height: 480,
  minWidth: 340,
  minHeight: 220,

  async mount(body, win) {
    const r = win.opts.data;

    body.innerHTML = `
      <div class="repo-head">
        <h2 class="w95-selectable">${escapeHtml(r.name)}</h2>
        ${r.description ? `<p class="w95-selectable">${escapeHtml(r.description)}</p>` : ''}
        <div class="repo-meta">
          ${r.language ? `<span><i class="gh-dot" style="background:${langColor(r.language)}"></i>${escapeHtml(r.language)}</span>` : ''}
          <span>★ ${r.stars || 0}</span>
          <span>⑂ ${r.forks || 0}</span>
          <span>${fmtBytes((r.size || 0) * 1024)}</span>
          <span>Pushed ${fmtDate(r.pushed)}</span>
        </div>
        ${r.topics?.length
          ? `<div class="repo-topics">${r.topics.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
          : ''}
        <div class="repo-actions">
          <button class="w95-btn repo-open">Open on GitHub</button>
          ${r.homepage ? `<button class="w95-btn repo-site">Live site</button>` : ''}
        </div>
      </div>
      <div class="w95-field w95-scroll repo-readme"><div class="w95-pad">Loading README…</div></div>`;

    body.querySelector('.repo-open')
      .addEventListener('click', () => window.open(r.url, '_blank', 'noopener'));

    body.querySelector('.repo-site')
      ?.addEventListener('click', () => window.open(r.homepage, '_blank', 'noopener'));

    const pane = body.querySelector('.repo-readme');
    const md = await fetchReadme(USER, r.name);

    pane.innerHTML = md
      ? `<div class="w95-pad md w95-selectable">${renderMarkdown(md)}</div>`
      : `<div class="w95-pad">This repository has no README.</div>`;
  },
};
