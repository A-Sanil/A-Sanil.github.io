/* ==========================================================================
   minesweeper.js — the real thing: first-click safety, flags, chording,
   the three standard difficulties, LED counters and a smiley that reacts.
   ========================================================================== */

import * as icons from '../icons.js';

const LEVELS = {
  beginner:     { cols: 9,  rows: 9,  mines: 10, label: 'Beginner' },
  intermediate: { cols: 16, rows: 16, mines: 40, label: 'Intermediate' },
  expert:       { cols: 30, rows: 16, mines: 99, label: 'Expert' },
};

const CELL = 16;

export const minesweeperApp = {
  id: 'minesweeper',
  title: 'Minesweeper',
  icon: icons.mine,
  resizable: false,
  autoSize: true,   // the board decides the window size, not the other way round

  menu: [
    { label: 'Game', onSelect: (w) => w.game?.cycleLevel() },
    { label: 'Help', onSelect: () => alert(
        'Left click: reveal\nRight click: flag\n' +
        'Click a number with both buttons (or middle click) to clear its neighbours ' +
        'once you have flagged that many mines.\n\n' +
        'The first click is always safe.') },
  ],

  mount(body, win) {
    const game = new Minesweeper(body, win);
    win.game = game;              // so the Game menu can reach it
    game.start('beginner');
  },

  onClose(win) { win.game?.stopTimer(); },
};

class Minesweeper {
  constructor(body, win) {
    this.win = win;
    this.body = body;

    body.innerHTML = `
      <div class="ms-outer w95-sunken">
        <div class="ms-hud w95-sunken">
          <div class="ms-led ms-mines">000</div>
          <button class="ms-face" aria-label="New game">🙂</button>
          <div class="ms-led ms-time">000</div>
        </div>
        <div class="ms-board w95-sunken"></div>
      </div>`;

    this.minesEl = body.querySelector('.ms-mines');
    this.timeEl = body.querySelector('.ms-time');
    this.faceEl = body.querySelector('.ms-face');
    this.boardEl = body.querySelector('.ms-board');

    this.faceEl.addEventListener('click', () => this.start(this.levelKey));

    // The face reacts to a press anywhere on the board, like the original.
    this.boardEl.addEventListener('pointerdown', () => {
      if (!this.over) this.faceEl.textContent = '😮';
    });
    document.addEventListener('pointerup', () => {
      if (!this.over) this.faceEl.textContent = '🙂';
    });

    this.boardEl.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /* ----------------------------------------------------------------- setup */

  start(levelKey) {
    this.stopTimer();

    this.levelKey = levelKey;
    const lv = LEVELS[levelKey];
    Object.assign(this, { cols: lv.cols, rows: lv.rows, mines: lv.mines });

    this.cells = Array.from({ length: this.cols * this.rows }, () => ({
      mine: false, revealed: false, flagged: false, n: 0,
    }));

    this.seeded = false;    // mines are placed on the first click, not before
    this.over = false;
    this.won = false;
    this.revealedCount = 0;
    this.flagCount = 0;
    this.time = 0;

    this.faceEl.textContent = '🙂';
    this.render();
    this.updateHud();

    this.win.wm.setTitle(this.win, `Minesweeper — ${lv.label}`);
  }

  cycleLevel() {
    const keys = Object.keys(LEVELS);
    const next = keys[(keys.indexOf(this.levelKey) + 1) % keys.length];
    this.start(next);
  }

  /* ---------------------------------------------------------------- render */

  render() {
    this.boardEl.style.gridTemplateColumns = `repeat(${this.cols}, ${CELL}px)`;

    this.boardEl.innerHTML = this.cells
      .map((_, i) => `<button class="ms-cell" data-i="${i}"></button>`)
      .join('');

    this.cellEls = [...this.boardEl.querySelectorAll('.ms-cell')];

    for (const el of this.cellEls) {
      const i = +el.dataset.i;

      el.addEventListener('pointerdown', (e) => {
        if (this.over) return;

        // Chord: both buttons held, or middle click.
        if (e.buttons === 3 || e.button === 1) { this.chord(i); return; }
        if (e.button === 2) { this.toggleFlag(i); return; }
        if (e.button === 0) this.pendingReveal = i;
      });

      el.addEventListener('pointerup', (e) => {
        if (this.over || e.button !== 0) return;
        if (this.pendingReveal === i) this.reveal(i);
        this.pendingReveal = null;
      });
    }
  }

  paint(i) {
    const c = this.cells[i];
    const el = this.cellEls[i];

    el.className = 'ms-cell';
    el.textContent = '';
    el.removeAttribute('data-n');

    if (c.flagged && !c.revealed) { el.classList.add('is-flag'); el.textContent = '🚩'; return; }
    if (!c.revealed) return;

    el.classList.add('is-open');

    if (c.mine) {
      el.classList.add('is-mine');
      el.textContent = '💣';
      return;
    }

    if (c.n) { el.textContent = c.n; el.dataset.n = c.n; }
  }

  paintAll() { this.cells.forEach((_, i) => this.paint(i)); }

  updateHud() {
    const left = Math.max(-99, Math.min(999, this.mines - this.flagCount));
    this.minesEl.textContent = pad(left);
    this.timeEl.textContent = pad(Math.min(999, this.time));
  }

  /* ------------------------------------------------------------------ grid */

  *neighbours(i) {
    const x = i % this.cols;
    const y = (i / this.cols) | 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
        yield ny * this.cols + nx;
      }
    }
  }

  /* Mines are placed after the first click so it can never lose instantly —
     the safe zone is the clicked cell and everything touching it. */
  seed(safeIndex) {
    const banned = new Set([safeIndex, ...this.neighbours(safeIndex)]);

    const pool = [];
    for (let i = 0; i < this.cells.length; i++) if (!banned.has(i)) pool.push(i);

    // If the board is too small to keep the full ring clear, only spare the
    // clicked cell itself (Expert on a 9x9 would otherwise be impossible).
    const usable = pool.length >= this.mines
      ? pool
      : this.cells.map((_, i) => i).filter((i) => i !== safeIndex);

    for (let i = usable.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [usable[i], usable[j]] = [usable[j], usable[i]];
    }

    for (const i of usable.slice(0, this.mines)) this.cells[i].mine = true;

    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].mine) continue;
      let n = 0;
      for (const j of this.neighbours(i)) if (this.cells[j].mine) n++;
      this.cells[i].n = n;
    }

    this.seeded = true;
    this.startTimer();
  }

  /* ---------------------------------------------------------------- actions */

  reveal(i) {
    const c = this.cells[i];
    if (c.revealed || c.flagged) return;

    if (!this.seeded) this.seed(i);

    if (c.mine) { this.lose(i); return; }

    // Flood fill outwards from any zero, iteratively — recursion blows the
    // stack on Expert boards with large empty regions.
    const stack = [i];
    while (stack.length) {
      const k = stack.pop();
      const cell = this.cells[k];
      if (cell.revealed || cell.flagged || cell.mine) continue;

      cell.revealed = true;
      this.revealedCount++;
      this.paint(k);

      if (cell.n === 0) for (const j of this.neighbours(k)) stack.push(j);
    }

    this.checkWin();
  }

  toggleFlag(i) {
    const c = this.cells[i];
    if (c.revealed) return;

    c.flagged = !c.flagged;
    this.flagCount += c.flagged ? 1 : -1;
    this.paint(i);
    this.updateHud();
  }

  /* Clear a satisfied number's un-flagged neighbours. */
  chord(i) {
    const c = this.cells[i];
    if (!c.revealed || !c.n) return;

    let flags = 0;
    for (const j of this.neighbours(i)) if (this.cells[j].flagged) flags++;
    if (flags !== c.n) return;

    for (const j of this.neighbours(i)) {
      if (!this.cells[j].flagged && !this.cells[j].revealed) this.reveal(j);
      if (this.over) return;
    }
  }

  /* ------------------------------------------------------------- end states */

  checkWin() {
    if (this.revealedCount !== this.cells.length - this.mines) return;

    this.over = true;
    this.won = true;
    this.stopTimer();
    this.faceEl.textContent = '😎';

    // Auto-flag whatever is left, as the original does.
    for (const c of this.cells) if (c.mine && !c.flagged) { c.flagged = true; this.flagCount++; }
    this.paintAll();
    this.updateHud();
  }

  lose(hitIndex) {
    this.over = true;
    this.stopTimer();
    this.faceEl.textContent = '😵';

    for (const c of this.cells) if (c.mine) c.revealed = true;
    this.paintAll();

    this.cellEls[hitIndex].classList.add('is-blast');

    // Mark wrong flags with a struck-through mine.
    this.cells.forEach((c, i) => {
      if (c.flagged && !c.mine) {
        this.cellEls[i].classList.add('is-open', 'is-wrong');
        this.cellEls[i].textContent = '💣';
      }
    });
  }

  /* ----------------------------------------------------------------- timer */

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (this.time >= 999) return this.stopTimer();
      this.time++;
      this.updateHud();
    }, 1000);
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

const pad = (n) => (n < 0 ? '-' + String(-n).padStart(2, '0') : String(n).padStart(3, '0'));
