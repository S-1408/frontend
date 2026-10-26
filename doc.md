# Frontend deployment

This project is a Vite + React single-page application. Build it with
`npm run build`; the production files are written to `dist`.

## Before deploying

1. Deploy the backend API and have its public HTTPS base URL available. The
   frontend expects the API under `/api`, for example:
   `https://api.example.com/api`.
2. Push this repository to GitHub (or another Git provider supported by your
   hosting service).
3. Make sure the backend allows requests from the deployed frontend origin.
   Authentication uses an HttpOnly refresh cookie, so the backend must allow
   credentials for the exact frontend origin (not `*`) and configure the cookie
   with appropriate `SameSite` and `Secure` attributes. See the authentication
   section in [README.md](./README.md).

## Deploy with Vercel

1. Import the repository into Vercel and select the frontend repository.
2. Use these project settings:
   - Framework preset: **Vite**
   - Root directory: `./` (the repository root)
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install` (Vercel's default is also fine)
3. In **Project Settings → Environment Variables**, add:
   - `VITE_API_BASE_URL` = the deployed backend URL including `/api`, such as
     `https://api.example.com/api`
   - `VITE_SENTRY_DSN` = your Sentry browser DSN, if using Sentry; omit it to
     disable browser error reporting.
4. Apply the variables to the environments you use (at least **Production**),
   then deploy or redeploy.

The included [vercel.json](./vercel.json) routes browser requests to the app
entry point so React Router URLs work when opened directly or refreshed.

## Deploy with Netlify or Cloudflare Pages

Create a new static-site project from the repository and use:

- Build command: `npm run build`
- Publish/output directory: `dist`
- Environment variables: the same `VITE_API_BASE_URL` and optional
  `VITE_SENTRY_DSN` values listed above.

The included [public/_redirects](./public/_redirects) file is copied into the
build output and provides the SPA fallback required by these hosts.

## Environment variables and secrets

Vite embeds variables prefixed with `VITE_` into the frontend at build time.
Set them in the hosting provider before building, and redeploy after changing
them. `VITE_API_BASE_URL` must point to the deployed API; otherwise the app's
development fallback (`http://localhost:4000/api`) will not reach your backend
for production visitors.

`SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are optional build-time
settings for uploading source maps to Sentry. Configure them only if you use
that integration. `SENTRY_AUTH_TOKEN` is a secret: do not prefix it with
`VITE_`, expose it in frontend code, or commit it to the repository.

## Verify a deployment

1. Confirm the hosting build completes successfully.
2. Open the deployed site and refresh `/login` and `/applications`; both should
   load rather than return a host-level 404.
3. Sign in and check the browser network panel for successful API requests to
   the configured backend URL. If authentication fails, check backend CORS,
   cookie settings, and allowed frontend origin.
4. For a local production-build check, run:

   ```sh
   npm run build
   npm run preview
   ```

   Then open the local URL printed by Vite.
