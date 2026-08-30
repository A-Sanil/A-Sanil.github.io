const SPOTIFY_TOKEN = 'https://accounts.spotify.com/api/token';
const CURRENTLY_PLAYING = 'https://api.spotify.com/v1/me/player/currently-playing';

const response = (body, status = 200, headers = {}) => new Response(body, {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

const cors = (env) => ({
  'access-control-allow-origin': env.ALLOWED_ORIGIN,
  'access-control-allow-methods': 'GET, OPTIONS',
  'vary': 'Origin',
});

const basicAuth = (env) => btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);

async function tokenRequest(env, fields) {
  return fetch(SPOTIFY_TOKEN, {
    method: 'POST',
    headers: { authorization: `Basic ${basicAuth(env)}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return response('', 204, cors(env));

    if (url.pathname === '/connect') {
      const auth = new URL('https://accounts.spotify.com/authorize');
      auth.search = new URLSearchParams({
        client_id: env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: env.SPOTIFY_REDIRECT_URI,
        scope: 'user-read-currently-playing',
        show_dialog: 'true',
      });
      return Response.redirect(auth.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return response(JSON.stringify({ error: 'Missing authorization code' }), 400);
      const exchange = await tokenRequest(env, {
        grant_type: 'authorization_code', code, redirect_uri: env.SPOTIFY_REDIRECT_URI,
      });
      const tokens = await exchange.json();
      if (!exchange.ok) return response(JSON.stringify({ error: 'Spotify authorization failed' }), 502);
      return new Response(`<!doctype html><meta charset="utf-8"><title>Spotify connected</title>
        <style>body{font:16px system-ui;max-width:720px;margin:40px auto;padding:20px}code{word-break:break-all;background:#eee;padding:12px;display:block}</style>
        <h1>Spotify connected</h1><p>Save this once as the Worker secret <b>SPOTIFY_REFRESH_TOKEN</b>, then close this page:</p>
        <code>${tokens.refresh_token}</code><p>This value is private. Do not commit or share it.</p>`,
        { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }

    if (url.pathname !== '/now-playing') return response(JSON.stringify({ error: 'Not found' }), 404, cors(env));
    if (request.headers.get('Origin') && request.headers.get('Origin') !== env.ALLOWED_ORIGIN) {
      return response(JSON.stringify({ error: 'Origin denied' }), 403, cors(env));
    }

    const refreshed = await tokenRequest(env, {
      grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    });
    const token = await refreshed.json();
    if (!refreshed.ok) return response(JSON.stringify({ error: 'Token refresh failed' }), 502, cors(env));

    const current = await fetch(CURRENTLY_PLAYING, {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    if (current.status === 204) return response(JSON.stringify({ isPlaying: false }), 200, cors(env));
    if (!current.ok) return response(JSON.stringify({ error: 'Spotify request failed' }), 502, cors(env));
    const data = await current.json();
    if (!data.is_playing || !data.item) return response(JSON.stringify({ isPlaying: false }), 200, cors(env));

    const item = data.item;
    const track = {
      title: item.name,
      artists: (item.artists || []).map((artist) => artist.name),
      album: item.album?.name || item.show?.name || '',
      albumArt: item.album?.images?.[0]?.url || item.images?.[0]?.url || '',
      url: item.external_urls?.spotify || 'https://open.spotify.com/',
      progressPercent: item.duration_ms ? (data.progress_ms / item.duration_ms) * 100 : 0,
    };
    return response(JSON.stringify({ isPlaying: true, track }), 200, cors(env));
  },
};
