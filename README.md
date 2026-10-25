# Wuese Philip Portfolio — Next.js

Full-stack Next.js portfolio and CMS. It includes the established UI, animation system, responsive behavior, MySQL content, administrator accounts, 2FA, media, leads, analytics, and CMS revisions.

## Local development

1. Copy `.env.example` to `.env.local` and supply the existing MySQL connection values.
2. Run `npm install` and `npm run dev`.
3. Open `http://localhost:3000`.

No CMS content is stored in local storage or session storage. Public content is read from MySQL and server-rendered into the initial response. Authentication uses a signed, HTTP-only cookie.

## Production

Run:

```text
npm ci
npm run build
npm start
```

Production builds use Next.js' stable Webpack compiler explicitly. This avoids host-specific Turbopack/PostCSS worker crashes while producing the same application and standalone server bundle.

The deployment must support a persistent Node.js process. On Hostinger, use a plan with Node.js application hosting, select Node 22 or newer, set the application root to this directory, and use `.next/standalone/server.js` as the startup file.

Configure all values from `.env.example` in the hosting control panel. Do not upload `.env.local`. Copy `public`, including `public/storage` and `public/uploads`, with the deployment. Ensure the runtime can write to `public/uploads` or replace local media storage with an object-storage adapter.

Before switching the domain, validate the hosting environment with `npm run check:production`. The command rejects missing secrets, placeholder values, invalid encryption keys, and a non-HTTPS public URL. Put the application behind Hostinger's HTTPS reverse proxy and enable process restart/health monitoring. The server binds to the platform-provided `PORT` and `HOSTNAME` values.

The build automatically prepares `.next/standalone` with its static assets and public files. Deploy `package.json`, `.next/standalone`, and the writable media directory; retain `public/uploads` on persistent storage between releases. Database backups and uploaded-media backups should be scheduled independently.

Switch the domain to this application only after production database, mail, media upload, login, 2FA, and CMS smoke tests pass.
