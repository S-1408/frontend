# React + TypeScript + Vite

## Authentication

The dashboard and application routes require a successful login. The flow
separates short-lived API access from long-lived session restoration so the
access token does not need to be persisted in browser storage.

### Login and session restoration

- The `/login` page sends credentials to `/auth/login`. On success, the backend
  returns `{ "accessToken": "..." }` and sets the refresh token in an `HttpOnly`
  cookie. The cookie is not readable by JavaScript, which helps protect it from
  token theft through client-side script injection.
- The access token is held only in memory. This avoids persisting a bearer token
  in local or session storage, but means it is lost on reload or in a new tab.
- On app startup, the frontend sends the refresh cookie to `/auth/refresh` and
  stores the new access token in memory. Protected routes wait for restoration
  to finish, preventing a brief incorrect login screen or protected page.
- If restoration fails because the refresh session is invalid, the user must log
  in again. Temporary network or server errors are reported separately so they
  are not mistaken for an expired session.

### Protected API requests and token expiry

- Only API calls marked as requiring authentication attach the access token or
  attempt refresh. This keeps public requests from accidentally using or
  refreshing a user's session.
- When an authenticated request receives a refreshable `401`, the client shares
  one refresh request across concurrent calls in that app instance, then retries
  each eligible request once. The retry limit prevents an infinite refresh loop.
- `403` responses are not refreshed: they generally mean the user is signed in
  but lacks permission. A repeated `401` clears local authentication state.
- Protected API `401` responses should include
  `{ "code": "ACCESS_TOKEN_EXPIRED" }` when refreshing is appropriate.
  `SESSION_REVOKED` and `ACCOUNT_DISABLED` end the local session without
  refreshing; other coded `401` responses are not refreshed. For compatibility,
  an uncoded protected `401` is treated as refreshable.
- Refresh requests are not coordinated across browser tabs. If the backend
  rotates refresh cookies, it should support concurrent refreshes or the
  frontend should add cross-tab coordination.

### Logout and account changes

- Logout calls `/auth/logout` to invalidate the refresh session on the server.
  The frontend immediately clears the in-memory access token and React Query
  cache, so cached data is not shown after logout even while the request is in
  flight.
- Logging in clears the prior account's cache before requesting new credentials,
  preventing one user's cached data from appearing in another account's session.
- A late refresh response must not restore authentication after logout or an
  account change.

### Backend and cookie configuration

The API client sends credentials with requests so the browser can include the
refresh cookie. For cross-origin deployments, the backend must allow credentials
for the frontend's specific origin (not `*`) and configure the refresh cookie
with appropriate `SameSite` and `Secure` attributes. The backend must also
implement `/auth/logout` to invalidate the refresh session and clear the cookie.

## Dashboard statistics API

The dashboard loads its application status cards from the protected `GET /stats`
endpoint. The response includes the total and count for each application status,
for example:

```json
{
  "total": 2,
  "byStatus": {
    "applied": 1,
    "interview": 1,
    "offer": 0,
    "rejected": 0
  }
}
```

The stats request includes the access token and participates in the shared
refresh/retry flow. Successful application create, update, and delete actions
invalidate the application query cache, which also refreshes dashboard stats.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses Oxc
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses SWC

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace it with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, use this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])

```
