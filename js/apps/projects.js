/* ==========================================================================
   projects.js — the Projects folder, plus the per-project detail window.

   Content is authored here rather than derived from the GitHub list: several
   of these live in private repos or have no repo at all, and the framing
   matters more than the commit history.
   ========================================================================== */

import { escapeHtml } from '../wm.js';
import * as icons from '../icons.js';

export const PROJECTS = [
  {
    name: 'SynAgent',
    kind: 'AI / ML Infrastructure',
    image: null,
    repo: 'https://github.com/A-Sanil/SynAgent',
    bullets: [
      'Autonomous agent built around RAG workflows for unstructured data traversal.',
      'Designed to synthesize noisy inputs into faster, more confident decisions.',
    ],
    tags: ['AI/ML', 'RAG', 'Infrastructure', 'Python'],
  },
  {
    name: 'ProteinLLMV1',
    kind: 'Language model',
    image: 'projects/blosum62-matrix.svg',
    repo: 'https://github.com/A-Sanil/ProteinLLM',
    bullets: [
      'Built a custom protein language model using a nanoGPT-style architecture.',
      'Wrapped the model in a full-stack app integrating ESMFold for structure generation.',
    ],
    tags: ['PyTorch', 'nanoGPT', 'Inference'],
  },
  {
    name: 'Provably Robust Deep Classifiers',
    kind: 'Research',
    image: 'projects/adversarial-screenshot.png',
    repo: 'https://github.com/A-Sanil/adversarial-robustness-classifier',
    bullets: [
      'Built a provably robust classifier by optimizing a worst-case adversarial loss bound.',
      'Focused on certification, stability, and stronger guarantees than baseline training.',
    ],
    tags: ['PyTorch', 'Convex Optimization', 'CVXPY'],
  },
  {
    name: 'Valorant Rank Tracker',
    kind: 'Analytics',
    image: null,
    repo: null,
    bullets: [
      'Tracks player rank progression, match history, and seasonal performance trends.',
      'Uses model-based forecasting to predict game wins with about 87% confidence.',
    ],
    tags: ['Prediction', 'Analytics', 'Game Data'],
  },
  {
    name: 'Coevolutionary Trait Dynamics Analyzer',
    kind: 'Research tooling',
    image: 'projects/coevolution-screenshot.png',
    repo: 'https://github.com/A-Sanil/Coevolutionary-Dynamics-Cryptic-Female-Choice',
    bullets: [
      'Analyzed coevolutionary simulations to measure trait emergence, stability, and divergence.',
      'Built quantitative tooling to inspect model behavior across repeated life cycles.',
    ],
    tags: ['Python', 'Pandas', 'scikit-learn', 'Julia'],
  },
  {
    name: 'Build Your Own World',
    kind: 'Game',
    image: 'encounter.gif',
    repo: null,
    bullets: [
      'Procedurally generated exploration game with seed-based world generation.',
      'Designed interactive gameplay systems around movement, discovery, and replayability.',
    ],
    tags: ['Java', 'Procedural Gen'],
  },
  {
    name: 'Diabetes Classifier',
    kind: 'Machine learning',
    image: 'projects/diabetes-screenshot.png',
    repo: 'https://github.com/A-Sanil/Diabetes-classifier',
    bullets: [
      'Compact classification pipeline for predictive diagnostic analysis.',
      'Achieved an F1-score of 0.84 using KNN, Naive Bayes, and Extra Trees.',
    ],
    tags: ['Python', 'scikit-learn'],
  },
  {
    name: 'BMRC Logistics System',
    kind: 'Full stack',
    image: 'projects/bmrc-logistics-screenshot.png',
    repo: null,
    bullets: [
      'Scalable inventory system with relational data modeling and validation logic.',
      'Designed clean query workflows for tracking, search, and operational visibility.',
    ],
    tags: ['Full Stack', 'Database', 'SQL'],
  },
];

/* ========================================================= Projects folder */

export const projectsApp = {
  id: 'projects',
  title: 'Projects',
  icon: icons.folder,
  width: 560,
  height: 420,
  minWidth: 300,
  minHeight: 220,

  menu: [
    { label: 'File', onSelect: (w) => w.wm.close(w) },
    { label: 'Edit' },
    { label: 'View' },
    { label: 'Help' },
  ],

  mount(body, win) {
    body.innerHTML = `
      <div class="w95-field w95-scroll">
        <div class="pj-grid">
          ${PROJECTS.map((p, i) => `
            <div class="pj-icon" data-i="${i}" tabindex="0" title="${escapeHtml(p.kind)}">
              <div class="pj-icon-img">${icons.folder}</div>
              <div class="pj-icon-label">${escapeHtml(p.name)}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="w95-statusbar">
        <div class="w95-statusbar-cell pj-status">${PROJECTS.length} object(s)</div>
      </div>`;

    const status = body.querySelector('.pj-status');
    let selected = null;

    for (const el of body.querySelectorAll('.pj-icon')) {
      const p = PROJECTS[+el.dataset.i];

      el.addEventListener('click', () => {
        selected?.classList.remove('is-selected');
        el.classList.add('is-selected');
        selected = el;
        status.textContent = `${p.name} — ${p.kind}`;
      });

      const open = () => win.wm.open(projectApp, { key: p.name, title: p.name, data: p });
      el.addEventListener('dblclick', open);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    }
  },
};

/* ================================================ single-project sub-window */

export const projectApp = {
  id: 'project',
  title: 'Project',
  icon: icons.folderOpen,
  singleton: false,
  width: 520,
  height: 420,
  minWidth: 300,
  minHeight: 200,

  mount(body, win) {
    const p = win.opts.data;

    body.innerHTML = `
      <div class="w95-field w95-scroll">
        <div class="w95-pad pj-detail w95-selectable">
          ${p.image ? `
            <div class="pj-shot w95-sunken-thin">
              <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}"
                   onerror="this.closest('.pj-shot').remove()">
            </div>` : ''}
          <h2>${escapeHtml(p.name)}</h2>
          <p class="pj-kind">${escapeHtml(p.kind)}</p>
          <ul>${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
          <div class="pj-tags">${p.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</div>
        </div>
      </div>
      <div class="pj-actions">
        ${p.repo
          ? `<button class="w95-btn pj-repo">View source</button>`
          : `<button class="w95-btn" disabled title="No public repository">View source</button>`}
        <button class="w95-btn pj-close">Close</button>
      </div>`;

    body.querySelector('.pj-repo')
      ?.addEventListener('click', () => window.open(p.repo, '_blank', 'noopener'));

    body.querySelector('.pj-close')
      .addEventListener('click', () => win.wm.close(win));
  },
};
