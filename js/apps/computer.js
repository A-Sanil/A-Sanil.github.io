/* ==========================================================================
   computer.js — My Computer, in the shape of the System Properties dialog.
   ========================================================================== */

import * as icons from '../icons.js';

const LINKS = [
  ['Email',    'mailto:asanil@berkeley.edu'],
  ['GitHub',   'https://github.com/A-Sanil'],
  ['LinkedIn', 'https://www.linkedin.com/in/aaditya-sanil'],
];

export const computerApp = {
  id: 'computer',
  title: 'System Properties',
  icon: icons.myComputer,
  width: 420,
  height: 400,
  minWidth: 300,
  minHeight: 240,

  mount(body, win) {
    body.innerHTML = `
      <div class="w95-field w95-scroll">
        <div class="w95-pad w95-selectable">
          <div class="mc-head">
            <div class="mc-head-icon">${icons.myComputer}</div>
            <div>
              <h2>Aaditya Sanil</h2>
              <p>CS @ UC Berkeley · SDE Intern @ AWS</p>
            </div>
          </div>

          <div class="mc-intro">
            <p>I’m a UC Berkeley CS student working on backend infrastructure and performance. At AWS, I built a version-keyed cache that cut calls to a rate-limited API by 37%.</p>
            <a class="w95-btn mc-resume" href="resume.pdf" target="_blank" rel="noopener">
              <span aria-hidden="true">${icons.pdfFile}</span>Open résumé (PDF)
            </a>
          </div>

          <fieldset class="w95-group">
            <legend>System</legend>
            <table class="mc-table">
              <tr><td>Operating System</td><td>Sanil OS 95</td></tr>
              <tr><td>Currently</td><td>SDE Intern, Amazon Web Services</td></tr>
              <tr><td>Institution</td><td>University of California, Berkeley</td></tr>
              <tr><td>Field</td><td>Computer Science</td></tr>
              <tr><td>Home base</td><td>Berkeley, California</td></tr>
              <tr><td>Registered to</td><td>asanil@berkeley.edu</td></tr>
            </table>
          </fieldset>

          <fieldset class="w95-group">
            <legend>Languages</legend>
            <table class="mc-table">
              <tr><td>Primary</td><td>Python, Java, C</td></tr>
              <tr><td>Also</td><td>Rust, Julia, SQL, Bash</td></tr>
              <tr><td>Tooling</td><td>PyTorch, FastAPI, Docker</td></tr>
            </table>
          </fieldset>

          <fieldset class="w95-group">
            <legend>Focus</legend>
            <table class="mc-table">
              <tr><td>Infrastructure</td><td>Pipelines, scheduling, storage</td></tr>
              <tr><td>Performance</td><td>Caching, concurrency, parallel simulations</td></tr>
              <tr><td>ML infrastructure</td><td>Training and validation pipelines</td></tr>
            </table>
          </fieldset>

          <div class="mc-links">
            ${LINKS.map(([label, href]) =>
              `<button class="w95-btn" data-href="${href}">${label}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="w95-statusbar">
        <div class="w95-statusbar-cell">Resume.pdf opens in a new browser tab.</div>
      </div>`;

    for (const btn of body.querySelectorAll('[data-href]')) {
      btn.addEventListener('click', () =>
        window.open(btn.dataset.href, '_blank', 'noopener'));
    }
  },
};
