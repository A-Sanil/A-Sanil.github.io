/* ==========================================================================
   linkedin.js — LinkedIn.exe

   Hand-authored rather than live: LinkedIn has no public read API for your
   own profile without partner OAuth approval, scraping is against their ToS
   and actively blocked, and they send X-Frame-Options: DENY so the page
   can't be embedded either. Authored content is under our control, loads
   instantly, and still reads as an app.
   ========================================================================== */

import { escapeHtml } from '../wm.js';
import * as icons from '../icons.js';

const PROFILE_URL = 'https://www.linkedin.com/in/aaditya-sanil';

const profile = {
  name: 'Aaditya Sanil',
  headline: 'CS @ UC Berkeley · SDE Intern @ Amazon Web Services',
  location: 'Bay Area, California',
};

const experience = [
  {
    role: 'Software Development Engineer Intern',
    org: 'Amazon Web Services',
    dates: 'Present',
    current: true,
    bullets: [
      'Building and shipping backend services on AWS infrastructure.',
    ],
  },
  {
    role: 'Machine Learning Engineer Intern',
    org: 'Lawrence Berkeley National Laboratory',
    dates: '2026',
    bullets: [
      'Build AI/ML infrastructure for training-data workflows and agent systems supporting drug discovery.',
      'Develop SynAgent-style tooling for cleaner experimentation, faster iteration, and more reliable model development.',
    ],
  },
  {
    role: 'Undergraduate ML Researcher',
    org: 'Martin Computational Speciation Lab',
    dates: 'Jun 2025 – Present',
    bullets: [
      'Optimized Julia simulation pipelines and cut latency through parallel execution.',
      'Built telemetry for large-scale evolutionary experiments.',
    ],
  },
  {
    role: 'Software Engineer Intern',
    org: 'Imagine Games Network',
    dates: 'Aug 2025 – Dec 2025',
    bullets: [
      'Built feature selection and data ingestion systems for production AI workflows.',
      'Focused on throughput, stability, and clean data movement.',
    ],
  },
];

const education = {
  school: 'University of California, Berkeley',
  degree: 'B.A. Computer Science',
  detail: 'Coursework in data structures, computer architecture, machine learning, and optimization.',
};

const skills = [
  'Python', 'Rust', 'C', 'C++', 'PyTorch', 'FastAPI',
  'SQL', 'Docker', 'JavaScript', 'Julia', 'Distributed Systems',
];

export const linkedinApp = {
  id: 'linkedin',
  title: 'LinkedIn — Aaditya Sanil',
  icon: icons.linkedin,
  width: 640,
  height: 500,
  minWidth: 360,
  minHeight: 260,

  menu: [
    { label: 'File', onSelect: (w) => w.wm.close(w) },
    { label: 'View', onSelect: () => window.open(PROFILE_URL, '_blank', 'noopener') },
  ],

  mount(body) {
    body.innerHTML = `
      <div class="w95-field w95-scroll li-scroll">
        <div class="li-banner"></div>

        <div class="li-head">
          <div class="li-avatar">${icons.berkeley}</div>
          <div class="li-head-copy w95-selectable">
            <h2>${escapeHtml(profile.name)}</h2>
            <p class="li-headline">${escapeHtml(profile.headline)}</p>
            <p class="li-loc">${escapeHtml(profile.location)}</p>
          </div>
          <button class="w95-btn li-open">View profile</button>
        </div>

        <div class="li-section">
          <h3>Experience</h3>
          ${experience.map((e) => `
            <div class="li-entry w95-selectable">
              <div class="li-entry-icon">${icons.exeFile}</div>
              <div>
                <p class="li-role">${escapeHtml(e.role)}${e.current ? '<em class="li-now">current</em>' : ''}</p>
                <p class="li-org">${escapeHtml(e.org)}</p>
                <p class="li-dates">${escapeHtml(e.dates)}</p>
                <ul>${e.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
              </div>
            </div>`).join('')}
        </div>

        <div class="li-section">
          <h3>Education</h3>
          <div class="li-entry w95-selectable">
            <div class="li-entry-icon">${icons.berkeley}</div>
            <div>
              <p class="li-role">${escapeHtml(education.school)}</p>
              <p class="li-org">${escapeHtml(education.degree)}</p>
              <p class="li-dates">${escapeHtml(education.detail)}</p>
            </div>
          </div>
        </div>

        <div class="li-section">
          <h3>Skills</h3>
          <div class="li-skills">
            ${skills.map((s) => `<span>${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>

        <p class="li-note">
          This window is authored content, not a live LinkedIn feed —
          LinkedIn provides no public profile API.
        </p>
      </div>

      <div class="w95-statusbar">
        <div class="w95-statusbar-cell">linkedin.com/in/aaditya-sanil</div>
      </div>`;

    for (const btn of body.querySelectorAll('.li-open')) {
      btn.addEventListener('click', () => window.open(PROFILE_URL, '_blank', 'noopener'));
    }
  },
};
