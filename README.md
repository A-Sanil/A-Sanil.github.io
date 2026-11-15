# Aaditya Sanil’s portfolio

A Windows 95-style desktop built with plain HTML, CSS, and JavaScript. Live at [a-sanil.github.io](https://a-sanil.github.io/).

- **My Computer** opens a short bio and an **Open résumé** button.
- **Resume.pdf** opens the current public résumé in a new tab. You can also find it under **Start → Documents**.
- **Projects** includes the LeetCode extension, SynAgent, Aegis Route, and more.
- GitHub, LinkedIn, and Minesweeper are still on the desktop.

## Develop locally

From the repository root, run `python -m http.server 8000` and open `http://localhost:8000/`. The site uses JavaScript modules, so opening `index.html` directly from disk isn’t sufficient. Edit `js/apps/computer.js` for the desktop bio, `index.html` for the no-JavaScript bio, or `js/apps/projects.js` for project details.

## Update the résumé

The public file is [resume.pdf](https://a-sanil.github.io/resume.pdf). Replace that file with a reviewed, public-safe PDF; the desktop links don’t need to change.

- [Manual Overleaf export and review](.github/resume-sync/README.md): no secrets or Overleaf plan upgrade.
- [Optional automatic Overleaf publishing](.github/resume-sync/AUTOMATIC.md): private source and publisher setup; only the compiled public PDF is pushed here.

The live site deploys with GitHub Pages. Do not put private résumé source or unredacted PDFs in this public Git repository, even on an unmerged branch.
