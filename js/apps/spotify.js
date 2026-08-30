/* Spotify.exe — shows only the track playing right now. No history is read. */
import { escapeHtml } from '../wm.js';
import * as icons from '../icons.js';

// Replace this after deploying workers/spotify-now-playing/.
const NOW_PLAYING_ENDPOINT = 'https://sanil-spotify-now-playing.YOUR-SUBDOMAIN.workers.dev/now-playing';
const POLL_MS = 15_000;
const configured = () => !NOW_PLAYING_ENDPOINT.includes('YOUR-SUBDOMAIN');

export const spotifyApp = {
  id: 'spotify', title: 'Spotify — Now Playing', icon: icons.spotify,
  width: 430, height: 292, minWidth: 340, minHeight: 245,
  mount(body) {
    body.innerHTML = `
      <div class="sp-shell"><div class="sp-brand">${icons.spotify}<strong>Spotify</strong></div>
        <div class="sp-content" aria-live="polite"><div class="sp-idle"><div class="sp-note">♫</div>
          <h2>${configured() ? 'Checking Spotify…' : 'Spotify connection required'}</h2>
          <p>${configured() ? 'This window updates only while Aaditya is actively listening.' : 'The app UI is installed. Connect the private now-playing endpoint to make it live.'}</p>
        </div></div><div class="sp-privacy">Live status only · no listening history</div></div>
      <div class="w95-statusbar"><div class="w95-statusbar-cell sp-status">${configured() ? 'Connecting…' : 'Not configured'}</div></div>`;
    if (!configured()) return;
    const content = body.querySelector('.sp-content');
    const status = body.querySelector('.sp-status');
    let stopped = false;
    const idle = () => {
      content.innerHTML = `<div class="sp-idle"><div class="sp-note">♫</div><h2>Not listening right now</h2><p>When Aaditya starts playing music, it will appear here.</p></div>`;
      status.textContent = 'Idle';
    };
    const playing = (track) => {
      content.innerHTML = `<a class="sp-track" href="${escapeHtml(track.url)}" target="_blank" rel="noopener">
        <img src="${escapeHtml(track.albumArt)}" alt="${escapeHtml(track.album)} album cover">
        <div class="sp-copy"><span class="sp-live"><i></i> NOW PLAYING</span><h2>${escapeHtml(track.title)}</h2>
          <p>${escapeHtml(track.artists.join(', '))}</p><small>${escapeHtml(track.album)}</small>
          <div class="sp-progress"><i style="width:${Math.max(0, Math.min(100, track.progressPercent))}%"></i></div></div></a>`;
      status.textContent = 'Playing now · refreshes every 15 seconds';
    };
    const refresh = async () => {
      try {
        const response = await fetch(`${NOW_PLAYING_ENDPOINT}?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error();
        const data = await response.json();
        data.isPlaying && data.track ? playing(data.track) : idle();
      } catch {
        content.innerHTML = `<div class="sp-idle"><div class="sp-note">!</div><h2>Spotify is unavailable</h2><p>The private status endpoint could not be reached.</p></div>`;
        status.textContent = 'Connection error';
      }
    };
    refresh();
    const timer = setInterval(() => { if (!stopped) refresh(); }, POLL_MS);
    const observer = new MutationObserver(() => {
      if (!body.isConnected) { stopped = true; clearInterval(timer); observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
};
