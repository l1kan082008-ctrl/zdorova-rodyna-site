# Security deployment checklist

The application-level controls are implemented in the repository. The items
below are deployment controls that require access to the Cloudflare account and
must not be hard-coded in the project.

## Required Worker secrets

Store these values with Cloudflare Secrets (never as plaintext `vars` in
`wrangler.jsonc`):

- `ADMIN_PASSWORD_HASH` — generated PBKDF2 password hash.
- `ADMIN_SESSION_SECRET` — at least 32 random bytes; rotate it to revoke every
  active admin session.
- `PUBLIC_FORM_RATE_LIMIT_SECRET` — separate random HMAC key for anonymous form
  and AI rate-limit fingerprints.
- `OPENAI_API_KEY` — only if the test voice operator is enabled.
- `TURNSTILE_SECRET_KEY` — only after the public Turnstile site key is also
  configured.

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is intentionally public. Configure it as a
build-time environment variable in the hosting project. The server-side secret
and client-side site key must be enabled together.

## Admin MFA and edge access

Place both `/admin*` and `/api/admin*` behind a Cloudflare Access self-hosted
application. The Access policy should:

1. allow only named administrator identities;
2. require the identity provider's MFA signal or a one-time PIN plus an
   additional MFA-capable identity provider;
3. use a short Access session lifetime;
4. deny all other identities;
5. keep the application's own password and server-backed session enabled as a
   second layer.

Do not implement Access by trusting a request header in application code. The
edge policy must enforce it before the Worker receives the request.

## Turnstile

Create one managed Turnstile widget limited to the production hostnames. Add
the public key to the build environment and the secret with Cloudflare Secrets.
The site verifies every token server-side, checks the hostname and uses a
single-use idempotency key.

## Before every deployment

Run:

```text
npm ci --ignore-scripts
npm run security:ci
npm run lint
npm run build
```

The secure build wrapper removes `.dev.vars`, `.env*` and local credential
files from `dist` and fails if a forbidden secret file remains. Never deploy by
calling `vinext build` directly.

After deployment, verify:

- unauthenticated `/admin` redirects or is blocked by Access;
- cross-origin POSTs to `/api/bookings` and `/api/admin/*` are rejected;
- the admin cookie is `__Host-`, `Secure`, `HttpOnly`, and `SameSite=Strict`;
- CSP, HSTS, `nosniff`, frame denial and no-store headers are present;
- an SVG renamed to `.png` is rejected by every upload endpoint;
- the deployed bundle contains no `.dev.vars`, `.env*`, plaintext password or
  API key.

Rotate production secrets immediately if a credential was ever committed,
published in a build artifact, pasted into logs, or shared outside the password
manager.
