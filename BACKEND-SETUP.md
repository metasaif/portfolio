# Activate your project inquiry form and private dashboard

## Current deployment

The backend has been created in your Cloudflare account. API: `https://saif-portfolio-api.mohammadsaifkhan.workers.dev`. The database, rate limits, Turnstile widget and private Worker secrets are configured. The public frontend settings are filled in. You do not need to repeat the setup below; it is retained for recovery or deploying another copy.

Your private dashboard access key was saved locally as `portfolio-private-admin-access.txt` outside the site folder and was not committed to GitHub. Store it in your password manager. Open `https://mohammadsaifkhan.pages.dev/admin.html` to sign in.

The frontend runs on GitHub Pages and the backend code in `backend/` runs on Cloudflare. If the backend is unavailable, visitors can use your existing email and WhatsApp links.

## What you get

- A project inquiry form with validation, consent, a honeypot, Cloudflare Turnstile and request rate limits.
- A private dashboard at `https://mohammadsaifkhan.pages.dev/admin.html` to read inquiries, filter them, change their status, open a reply in your email app, and delete them.
- Cloudflare D1 stores inquiries. It does not store your admin key or raw IP addresses. Turnstile receives an IP for verification; Cloudflare may process request metadata under its privacy policy.
- No email notification service is included. Check the dashboard for new inquiries. Saving an inquiry is not the same as sending an email.
- Free-tier operation is subject to Cloudflare quotas. Stay on the Free plan; do not enable paid features solely for this project.

## One-time setup

You need a Cloudflare account, Node.js 22.13+ (Node 24 recommended), and a downloaded copy of this repository. Do not put passwords, admin keys or API tokens in GitHub files or chat messages.

1. In the Cloudflare dashboard, create a Turnstile widget. Choose Managed mode and allow the hostname `metasaif.github.io`. Save the **site key** (public) and **secret key** (private) separately.
2. Open a terminal in this repository's `backend` folder. Log in using the official Cloudflare CLI:

   ```sh
   npx wrangler@4 login
   npx wrangler@4 d1 create saif-portfolio-inquiries
   ```

3. Copy the returned database ID into `backend/wrangler.jsonc`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`. Keep the binding name `DB`. The ID is configuration, not a password. Commit this configuration update to GitHub so future deployments use the same database.
4. Create the database table:

   ```sh
   npx wrangler@4 d1 migrations apply saif-portfolio-inquiries --remote
   ```

5. Create a strong, random admin access key in your password manager: at least 32 characters, preferably 64 random characters. Save it privately. Add both secrets using the interactive prompts:

   ```sh
   npx wrangler@4 secret put ADMIN_TOKEN
   npx wrangler@4 secret put TURNSTILE_SECRET_KEY
   ```

   Paste the admin key only into the first prompt and the Turnstile secret only into the second. If Wrangler offers to create the named Worker, allow it. Do not write secret values into wrangler.jsonc or backend-config.js.
6. Deploy the backend:

   ```sh
   npx wrangler@4 deploy
   ```

   Keep the displayed HTTPS Worker URL. The existing configuration supplies the `DB`, `INQUIRY_LIMITER` and `ADMIN_LIMITER` bindings, and limits the permitted browser origin to `https://metasaif.github.io`.
7. Open `assets/js/backend-config.js` on GitHub and fill in the two PUBLIC settings:

   ```js
   export const API_BASE = 'YOUR_HTTPS_WORKER_URL';
   export const TURNSTILE_SITE_KEY = 'YOUR_PUBLIC_TURNSTILE_SITE_KEY';
   ```

   Use your actual values. API_BASE must have no trailing slash or `/api` suffix. Never put ADMIN_TOKEN or the Turnstile secret here.
8. Commit and wait for Pages to deploy. Open the Worker URL followed by `/api/health`; it should return `{"ready":true}`. Visit the portfolio, submit one clearly labeled test inquiry, then open `/portfolio/admin.html` and enter your private access key. Verify the record and delete the test inquiry when done.

## Everyday use

Open `admin.html`, enter your key, and review new inquiries. The key stays in tab memory only; it is not saved in localStorage, cookies, URLs or the repository. Signing out, refreshing, or 15 minutes without an admin action clears it. The dashboard HTML is public, but every data request requires the private key. Only you should have this key; it is a single-owner dashboard, not multi-user authentication.

You can keep editing portfolio copy directly in HTML. Only changes to `backend/worker.mjs` require redeploying the Worker with `npx wrangler@4 deploy`. GitHub Pages updates do not automatically redeploy the Worker. No GitHub Actions workflow or paid plan is required.

To rotate a lost key, run `npx wrangler@4 secret put ADMIN_TOKEN` again with a new random key. Existing tabs using the old key will lose access on their next request. Inquiries remain in the database until you delete them. Review and delete unneeded inquiries regularly, and honor deletion requests sent to your contact email. This version has no automatic retention policy or file uploads.

## Local verification

From the backend folder:

```sh
node --test worker.test.mjs
```

Tests use an in-memory SQLite database and a simulated Turnstile verification response; they never contact real prospects. They cover data persistence, auth, validation, retry deduplication, rate limiting, pagination, status updates, deletion and failure cases. A real Cloudflare deployment and real Turnstile widget still require the end-to-end test in step 8.

## Troubleshooting

- **Form says it is being connected:** the two public frontend settings are still empty.
- **Form unavailable:** check the Worker URL, database migration, bindings and both private secrets.
- **Verification fails:** Turnstile hostname must be `metasaif.github.io`; use the site's public key, its matching secret and the built-in `inquiry` action. Test keys are for local testing only.
- **Unauthorized:** check the private admin key; its length must be at least 32 characters. Do not use your Cloudflare account password.
- **Origin error after moving domains:** update ALLOWED_ORIGIN, TURNSTILE_HOSTNAME and the widget hostname, then deploy again.
- **Too many requests:** wait a minute. Limits are per IP and per Cloudflare location, not an absolute global quota or full DDoS protection.

Official references: [D1 setup](https://developers.cloudflare.com/d1/get-started/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/), [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).
