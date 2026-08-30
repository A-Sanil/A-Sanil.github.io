# Spotify now-playing Worker

This endpoint exposes only the track actively playing. It does not request or read listening history.

1. Create an app at https://developer.spotify.com/dashboard and add the redirect URI shown in `wrangler.toml`.
2. Replace `YOUR-SUBDOMAIN` in `wrangler.toml`, then run `npx wrangler deploy`.
3. Add secrets with `npx wrangler secret put SPOTIFY_CLIENT_ID` and `npx wrangler secret put SPOTIFY_CLIENT_SECRET`.
4. Visit `https://YOUR-WORKER.workers.dev/connect`, approve the one requested permission, and copy the returned refresh token.
5. Save it with `npx wrangler secret put SPOTIFY_REFRESH_TOKEN`, then deploy again.
6. Put the Worker `/now-playing` URL into `js/apps/spotify.js`.

Never commit the client secret or refresh token.
