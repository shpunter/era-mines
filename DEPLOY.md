# Deploying to mines.eraplanner.com (Cloudflare Workers — static assets)

This app is a Module Federation **remote**. Cloudflare serves the static build
as an **assets-only Worker** (no server code); the host app (`eraplanner.com`)
loads `remoteEntry.js` from here at runtime.

## One-time setup (Cloudflare dashboard)

1. **Workers & Pages → Create → Connect to Git → select this repo.**
2. Build settings:
   - **Build command:** `pnpm build`
   - **Deploy command:** `npx wrangler deploy` (default — uses `wrangler.toml`)
   - Cloudflare detects `pnpm-lock.yaml` and uses pnpm automatically.
   - `wrangler.toml` declares `[assets] directory = "./dist"`, so no
     "output directory" / entry-point field is needed.
3. **Settings → Domains & Routes → Add → Custom domain →** `mines.eraplanner.com`.
   Cloudflare adds the DNS record automatically when the zone is on Cloudflare.

That's it — no environment variables are required. The production asset base is
baked into the build as `https://mines.eraplanner.com/` (see `vite.config.ts`).
If the domain ever changes, set a `PUBLIC_URL` build env var (e.g.
`https://mines.example.com/`) instead of editing the config.

## What's already wired for this

- `vite.config.ts` — production `base` defaults to `https://mines.eraplanner.com/`
  so the host resolves chunks/assets from the right origin.
- `public/_headers` — sends `Access-Control-Allow-Origin: *` (the host is a
  different origin) and `Cache-Control: no-cache` on `remoteEntry.js` so the
  host never pins a stale manifest.
- `wrangler.toml` — Worker name `era-mines`, assets from `./dist`.

## Point the host (era) at production

In the **era** repo, set the remote entry to the deployed URL:

```
VITE_MINES_REMOTE_ENTRY=https://mines.eraplanner.com/remoteEntry.js
```

(See `era/.env.example`.) Set it in era's own deploy environment.

## Local production smoke test

```
PUBLIC_URL=http://localhost:8086/ pnpm serve
```

Builds with a localhost base and serves it on :8086, matching the dev remote URL
so a locally-running era host can consume it.

## Every deploy

Push to the connected branch — the Worker rebuilds and deploys automatically.
After deploy, confirm `remoteEntry.js` loads with CORS:

```
curl -sI https://mines.eraplanner.com/remoteEntry.js | grep -i 'access-control\|cache-control'
```
