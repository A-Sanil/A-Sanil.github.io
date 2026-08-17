/* ==========================================================================
   notepad.js — Notepad, holding about_me.txt

   Deliberately plain text in a monospace field: the joke only lands if it
   behaves like the real Notepad, which means no styling inside the document.
   ========================================================================== */

import { escapeHtml } from '../wm.js';
import * as icons from '../icons.js';

const ABOUT = String.raw`
 ____________________________________________________
|                                                    |
|                   ABOUT_ME.TXT                     |
|____________________________________________________|

 Aaditya Sanil
 Computer Science, UC Berkeley
 SDE Intern @ Amazon Web Services
 Bay Area, California


 ---- WHAT I ACTUALLY WRITE ------------------------

 Rust, Python, C/C++.

 Python for the modelling and the glue. Rust when
 something has to be fast and correct at the same
 time and I don't want to spend a week proving it.
 C/C++ when I'm close enough to the metal that the
 abstraction would cost more than it saves.


 ---- WHAT I'M INTERESTED IN -----------------------

 [1] INFRASTRUCTURE
     The layer underneath the model. Pipelines,
     schedulers, storage, the parts nobody demos
     but everybody depends on. I like systems that
     stay boring under load.

 [2] LOW LATENCY
     Most of the interesting engineering lives in
     the tail. p50 is a marketing number; p99 is
     where you find out what you actually built.

 [3] ML INFRASTRUCTURE
     Training and serving are systems problems
     wearing a research hat. Data movement, memory
     pressure, and scheduling decide far more
     outcomes than architecture choices do.


 ---- CURRENTLY ------------------------------------

 SDE Intern at Amazon Web Services.

 Previously: ML Engineer Intern at Lawrence Berkeley
 National Laboratory, building AI/ML infrastructure
 for drug discovery workflows.

 Also poking at: agent systems that don't fall over,
 and making my own tooling fast enough that I stop
 noticing it.


 ---- ELSEWHERE ------------------------------------

 Email    asanil@berkeley.edu
 GitHub   github.com/A-Sanil
 LinkedIn linkedin.com/in/aaditya-sanil


 [EOF]
`.trim();

export const notepadApp = {
  id: 'notepad',
  title: 'about_me.txt — Notepad',
  icon: icons.notepad,
  width: 560,
  height: 480,
  minWidth: 320,
  minHeight: 200,

  menu: [
    { label: 'File', onSelect: (w) => w.wm.close(w) },
    { label: 'Edit' },
    { label: 'Search' },
    { label: 'Help' },
  ],

  mount(body) {
    body.innerHTML = `
      <div class="w95-field w95-scroll">
        <pre class="np-text w95-selectable">${escapeHtml(ABOUT)}</pre>
      </div>`;
  },
};
