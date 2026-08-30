/* ==========================================================================
   icons.js — every icon in the OS, as inline SVG.
   Inline rather than files so the desktop paints in one request with no
   flash of missing icons, and so icons inherit crisp scaling on retina.
   All are drawn on a 32x32 grid to match real Win95 shell icon dimensions.
   ========================================================================== */

const svg = (body, vb = '0 0 32 32') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" shape-rendering="geometricPrecision">${body}</svg>`;

/* The four-pane Windows flag, sheared into its classic perspective. */
export const winFlag = svg(`
  <g transform="skewY(-9) translate(0 6)">
    <path fill="#ff3b30" d="M3 3h12v12H3z"/>
    <path fill="#4cd964" d="M17 3h12v12H17z"/>
    <path fill="#0a84ff" d="M3 17h12v12H3z"/>
    <path fill="#ffcc00" d="M17 17h12v12H17z"/>
  </g>`);

/* Brand marks ship as real files in assets/ rather than redrawn paths —
   they're the official logos and they downscale cleanly to 16px. */
const img = (src, alt) => `<img src="${src}" alt="${alt}" draggable="false">`;

export const github = img('assets/github.png', 'GitHub');
export const linkedin = img('assets/linkedin.png', 'LinkedIn');
export const berkeley = img('assets/berkeley.png', 'UC Berkeley');
export const spotify = img('assets/spotify.png', 'Spotify');

/* --- Shell icons --------------------------------------------------------- */

export const myComputer = svg(`
  <path fill="#c0c0c0" stroke="#000" d="M3.5 5.5h25v16h-25z"/>
  <path fill="#008080" d="M5 7h22v13H5z"/>
  <path fill="#00a8a8" d="M6 8h9v5H6z"/>
  <path fill="#c0c0c0" stroke="#000" d="M9.5 21.5h13v3h-13z"/>
  <path fill="#c0c0c0" stroke="#000" d="M5.5 24.5h21v4h-21z"/>
  <path fill="#fff" d="M7 26h9v1H7z"/>
  <circle cx="23" cy="26.5" r="1" fill="#0f0"/>`);

export const folder = svg(`
  <path fill="#e8c15a" stroke="#000" d="M2.5 7.5h10l2.5 3h16.5v17H2.5z"/>
  <path fill="#ffd970" stroke="#000" d="M2.5 11.5h29v16h-29z"/>`);

export const folderOpen = svg(`
  <path fill="#e8c15a" stroke="#000" d="M2.5 7.5h10l2.5 3h13.5v15H2.5z"/>
  <path fill="#ffd970" stroke="#000" d="M6.5 13.5h25l-4 14H2.5z"/>`);

export const notepad = svg(`
  <path fill="#fff" stroke="#000" d="M6.5 3.5h20v25h-20z"/>
  <path fill="#c0c0c0" stroke="#000" d="M6.5 3.5h4v25h-4z"/>
  <g stroke="#000080" stroke-width="1">
    <path d="M12.5 9.5h11M12.5 13.5h11M12.5 17.5h11M12.5 21.5h7"/>
  </g>
  <g fill="#808080"><circle cx="8.5" cy="7.5" r="1"/><circle cx="8.5" cy="12.5" r="1"/>
  <circle cx="8.5" cy="17.5" r="1"/><circle cx="8.5" cy="22.5" r="1"/></g>`);

export const mine = svg(`
  <circle cx="16" cy="17" r="9" fill="#000"/>
  <path stroke="#000" stroke-width="2.5" stroke-linecap="round" d="M16 4v6M16 24v6M4 17h6M22 17h6M8 9l4 4M24 9l-4 4M8 25l4-4M24 25l-4-4"/>
  <circle cx="12.5" cy="13.5" r="2.2" fill="#fff"/>`);

export const recycleEmpty = svg(`
  <path fill="#c0c0c0" stroke="#000" d="M9.5 9.5h13l-1.5 18h-10z"/>
  <path fill="#a0a0a0" stroke="#000" d="M8.5 6.5h15v3h-15z"/>
  <path fill="none" stroke="#008080" stroke-width="1.6" d="M13 13l1 11M16 13v11M19 13l-1 11"/>`);

export const exeFile = svg(`
  <path fill="#fff" stroke="#000" d="M7.5 2.5h13l5 5v22h-18z"/>
  <path fill="#c0c0c0" stroke="#000" d="M20.5 2.5l5 5h-5z"/>
  <path fill="#000080" d="M10 13h13v11H10z"/>
  <path fill="#fff" d="M11 14h11v2H11z"/>
  <text x="12" y="22" font-family="monospace" font-size="6" fill="#0f0">&gt;_</text>`);

export const pdfFile = svg(`
  <path fill="#fff" stroke="#000" d="M7.5 2.5h13l5 5v22h-18z"/>
  <path fill="#c0c0c0" stroke="#000" d="M20.5 2.5l5 5h-5z"/>
  <rect x="6" y="16" width="21" height="10" rx="1" fill="#c8102e"/>
  <text x="16.5" y="23.8" font-family="Arial,sans-serif" font-size="7.5" font-weight="bold"
    fill="#fff" text-anchor="middle">PDF</text>`);

export const mail = svg(`
  <path fill="#fff" stroke="#000" d="M2.5 7.5h27v17h-27z"/>
  <path fill="none" stroke="#000" d="M2.5 7.5L16 18 29.5 7.5"/>
  <path fill="none" stroke="#808080" d="M2.5 24.5L12 15M29.5 24.5L20 15"/>`);

export const globe = svg(`
  <circle cx="16" cy="16" r="13" fill="#4a9edb" stroke="#000"/>
  <path fill="#3a7d3a" d="M8 10c3 1 5 0 7 2s-1 4 1 5 4-1 5 1-2 3-1 5c-4 2-9 1-12-2-2-4-2-8 0-11z"/>
  <path fill="none" stroke="#00305a" d="M3 16h26M16 3c4 4 4 22 0 26M16 3c-4 4-4 22 0 26"/>`);

export const settings = svg(`
  <path fill="#c0c0c0" stroke="#000" d="M13 3h6l.7 3.6 2.6 1.5 3.4-1.3 3 5.2-2.7 2.3v3l2.7 2.3-3 5.2-3.4-1.3-2.6 1.5L19 29h-6
    l-.7-3.6-2.6-1.5-3.4 1.3-3-5.2 2.7-2.3v-3L3.3 12l3-5.2 3.4 1.3 2.6-1.5z"/>
  <circle cx="16" cy="16" r="4.5" fill="#008080" stroke="#000"/>`);

export const helpBook = svg(`
  <path fill="#000080" stroke="#000" d="M4.5 5.5h23v22h-23z"/>
  <path fill="#fff" stroke="#000" d="M7.5 5.5h20v22h-20z"/>
  <text x="17.5" y="22" font-family="Arial,sans-serif" font-size="15" font-weight="bold"
    fill="#000080" text-anchor="middle">?</text>`);

export const shutdown = svg(`
  <circle cx="16" cy="17" r="10" fill="none" stroke="#000" stroke-width="3"
    stroke-dasharray="46 20" transform="rotate(-105 16 17)"/>
  <path stroke="#000" stroke-width="3" stroke-linecap="round" d="M16 4v11"/>`);

export const run = svg(`
  <path fill="#c0c0c0" stroke="#000" d="M3.5 6.5h25v19h-25z"/>
  <path fill="#000" d="M5 12h22v12H5z"/>
  <text x="7" y="21" font-family="monospace" font-size="8" fill="#c0c0c0">C:\\&gt;</text>`);

/* Small monochrome glyph used in title bars, keyed by app id. */
export const titleGlyph = {
  github: '🐙', linkedin: '💼', spotify: '🎵', projects: '📁', notepad: '📝',
  minesweeper: '💣', computer: '🖥', resume: '📄', help: '❓',
};

export default {
  winFlag, github, linkedin, berkeley, myComputer, folder, folderOpen,
  notepad, mine, recycleEmpty, exeFile, pdfFile, mail, globe, settings,
  helpBook, shutdown, run,
};
