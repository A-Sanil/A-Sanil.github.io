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

          <fieldset class="w95-group">
            <legend>System</legend>
            <table class="mc-table">
              <tr><td>Operating System</td><td>Sanil OS 95</td></tr>
              <tr><td>Currently</td><td>SDE Intern, Amazon Web Services</td></tr>
              <tr><td>Institution</td><td>University of California, Berkeley</td></tr>
              <tr><td>Field</td><td>Computer Science</td></tr>
              <tr><td>Location</td><td>Bay Area, California</td></tr>
              <tr><td>Registered to</td><td>asanil@berkeley.edu</td></tr>
            </table>
          </fieldset>

          <fieldset class="w95-group">
            <legend>Languages</legend>
            <table class="mc-table">
              <tr><td>Primary</td><td>Rust, Python, C/C++</td></tr>
              <tr><td>Also</td><td>JavaScript, Java, Julia, SQL</td></tr>
              <tr><td>Tooling</td><td>PyTorch, FastAPI, Docker</td></tr>
            </table>
          </fieldset>

          <fieldset class="w95-group">
            <legend>Focus</legend>
            <table class="mc-table">
              <tr><td>Infrastructure</td><td>Pipelines, scheduling, storage</td></tr>
              <tr><td>Low latency</td><td>Tail behaviour over average case</td></tr>
              <tr><td>ML infra</td><td>Training and serving as systems problems</td></tr>
            </table>
          </fieldset>

          <div class="mc-links">
            ${LINKS.map(([label, href]) =>
              `<button class="w95-btn" data-href="${href}">${label}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="w95-statusbar">
        <div class="w95-statusbar-cell">Double-click an icon on the desktop to open an application.</div>
      </div>`;

    for (const btn of body.querySelectorAll('[data-href]')) {
      btn.addEventListener('click', () =>
        window.open(btn.dataset.href, '_blank', 'noopener'));
    }
  },
};
