# Triple H Contracts & Hire Website, CMS and Portals

A production-oriented Next.js App Router website with a built-in content management system, employee portal and customer portal. It includes dynamic services, projects, news and careers, reusable enquiries, CV applications, newsletter management, targeted portal notifications, submission storage, email delivery, role-based accounts and a Cloudinary-backed media library.

## Technology

- Next.js 16 App Router and React 19
- JavaScript with static quality checks
- MongoDB and Mongoose
- Cloudinary image and video storage
- Nodemailer and SMTP notifications
- TipTap rich-text editing
- dnd-kit sortable CMS fields
- React Select, React Datepicker, Swiper, and Tailwind CSS

## Requirements

- Node.js **22.12 or newer in the Node 22 LTS line**
- npm 10 or newer
- MongoDB database
- Cloudinary account
- SMTP account for form notifications

Confirm the active runtime:

```bash
node --version
npm --version
```

The application will not build on Node 18.

## Quick start

1. Install the locked dependencies.

   ```bash
   npm ci
   ```

2. Create the local environment file.

   ```bash
   cp .env.example .env.local
   ```

3. Fill in every required value in `.env.local`. See [Environment variables](#environment-variables).

4. Create the administrator, six employee accounts, six customer accounts, CMS content, forms and demo notifications.

   ```bash
   npm run seed:triple-h
   ```

5. Start the development server.

   ```bash
   npm run dev
   ```

6. Open the public site at [http://localhost:3000](http://localhost:3000).

7. Open the CMS at `http://localhost:3000/<ADMIN_PATH>/login`. With the example configuration this is [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

The first sign-in uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. Change the password after setup and never use the example password in production.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Absolute public origin, such as `https://www.example.com`. Used by metadata, canonical URLs, robots, and sitemap. |
| `ADMIN_PATH` | Yes | Visible CMS path without leading/trailing slashes. This is not a substitute for authentication. |
| `AUTH_SECRET` | Yes | Long random secret used to sign CMS sessions. Use at least 32 random bytes. |
| `MONGODB_URI` | Yes | MongoDB connection string and database name. |
| `RATE_LIMIT_STORE` | No | Leave unset to use MongoDB-backed production limits. Set to `memory` only for single-process development/testing. |
| `SEED_ADMIN_NAME` | Seeding | Initial administrator display name. |
| `SEED_ADMIN_EMAIL` | Seeding | Initial administrator email address. |
| `SEED_ADMIN_PASSWORD` | Seeding | Initial administrator password, at least 10 characters. |
| `CLOUDINARY_CLOUD_NAME` | Media | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Media | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Media | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | No | Root upload folder; defaults to `website`. |
| `SMTP_HOST` | Forms | SMTP hostname. |
| `SMTP_PORT` | Forms | SMTP port, commonly `587` or `465`. |
| `SMTP_SECURE` | Forms | `true` for implicit TLS, normally on port 465. |
| `SMTP_USER` | Forms | SMTP username. |
| `SMTP_PASS` | Forms | SMTP password or application password. |
| `SMTP_FROM_EMAIL` | Forms | Verified sender email address. |
| `SMTP_FROM_NAME` | No | Sender name shown in notifications. |
| `CONTACT_RECIPIENT_EMAIL` | Forms | Fallback recipient when a form has no configured recipient. |

Generate an authentication secret with either command:

```bash
openssl rand -base64 48
```

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Never expose authentication, MongoDB, Cloudinary, SMTP, or seed credentials through a `NEXT_PUBLIC_` variable.

## Seed commands

### Triple H application seed

```bash
npm run seed:triple-h
```

This idempotently creates the configured main administrator, six employees, six customers, dynamic site content, the Triple H service, careers and newsletter forms, demo notifications and newsletter subscribers. Portal accounts use `SEED_PORTAL_PASSWORD` when provided, or the documented local demo password printed by the seed command, and are flagged to change it after first sign-in.

### Core CMS seed

```bash
npm run seed:admin
```

This is safe to run again. It creates or updates the configured administrator and fills missing defaults for Triple H pages, global settings, navigation, and forms.

## Everyday CMS use

The CMS URL is controlled by `ADMIN_PATH`. It must be one lowercase URL segment containing letters, numbers, and hyphens, and it cannot collide with public/system routes such as `api`, `contact`, `_next`, or `cms-internal`. Invalid values fail clearly instead of shadowing another route. All CMS mutations require a signed HTTP-only administrator session; changing the path only reduces casual discovery.

### Pages

Open **Pages**, choose any Triple H public page, and edit each tab. Definitions live under `src/lib/pages/`. The SEO tab controls page title, description, social sharing copy/image, canonical URL, and indexing preference.

Click **Save page** after editing. Public content is sanitised and the affected cache is invalidated after a successful save.

### Globals

Use **Globals** for shared footer copy, contact details, social links, and testimonials. Saving globals refreshes all public areas that consume them.

### Navigation

Use **Navigation** to reorder links and choose an existing CMS page or a validated custom URL. Use “open in a new tab” only for destinations that leave the site. Unsafe URL schemes are rejected.

### Forms

Use **Form maker** to create reusable forms with text, date, select, textarea, consent, and submit fields. Fields can be reordered and grouped into responsive rows.

Important rules:

- every input field needs a unique machine name;
- select option values must be unique;
- configure a recipient or provide `CONTACT_RECIPIENT_EMAIL`;
- keep consent wording explicit;
- success and error copy may use only the supported rich-text subset.

Public submissions are validated against the saved server definition and unexpected keys are discarded. A failed email does not discard an enquiry; its status becomes `email_failed`.

Render a form by key or MongoDB ID:

```jsx
import FormRenderer from "@/components/forms/FormRenderer";

export default function EnquirySection() {
  return <FormRenderer formId="contact" />;
}
```

### Media library

Image and video uploads are limited to 25 MB and stored in Cloudinary. The CMS requests an authenticated, same-origin upload signature, sends the file directly from the browser to Cloudinary, and asks the server to verify the uploaded asset before it enters the media library. This avoids Vercel's 4.5 MB Function request-body limit without exposing the Cloudinary API secret. Unsupported or oversized assets are rejected and removed.

Add meaningful alternative text to informative images; use empty alt text only for decorative images. **Remove selection** disconnects a file from that field but deliberately does not delete the shared library asset, because another page may still use it. Permanent deletion is available through the authenticated media API and should be performed only after auditing references.

```bash
node scripts/audit-media.mjs
```

### Submissions

Use **Submissions** to review paginated enquiries and delivery state. Treat submissions as personal data: restrict access, define a retention period, remove records no longer needed, and apply the same policy to backups.

### Administrator accounts

Use **Admin users** to create, edit, deactivate, or delete administrators. The current account cannot deactivate or delete itself, and the API protects the last active administrator. Give each person their own account.

## Frontend development

### Project structure

```text
src/
├── app/                 Routes, layouts, metadata, APIs, and CMS entry
├── components/
│   ├── admin/           CMS shell, feature views, editors, and controls
│   ├── forms/           Public form renderer and controls
│   ├── global/          Header, footer, navigation, consent, and USPs
│   ├── sections/        Page-specific and shared sections
│   └── ui/              Reusable presentation and interaction primitives
├── lib/                 Data, auth, validation, sanitisation, and definitions
├── models/              Mongoose schemas
├── styles/              Tokens and component-oriented CSS
└── proxy.js             Configurable public CMS-path rewrite
```

### Public data flow

1. A server page reads a page, navigation, or globals through `src/lib/site-data.js`.
2. Database reads are cached across requests and tagged by content type.
3. Data is serialised and sanitised before rendering.
4. A successful CMS mutation invalidates the relevant cache tag/path.
5. Server components render the page; only interactive islands ship client JavaScript.

Do not query Mongoose directly from a new public component. Extend the shared data layer so sanitisation, serialisation, caching, and invalidation remain consistent.

### Adding or changing a CMS field

1. Open the relevant definition in `src/lib/pages/` or `src/lib/admin/`.
2. Add the definition and a safe default.
3. Update the matching section component.
4. Add validation for URLs, rich text, media, repeaters, or constrained options.
5. Add normalisation and rendering tests.
6. Seed only when existing databases need a missing default; do not overwrite editor content.

### Adding a public page

1. Add `src/app/(site)/<slug>/page.js`.
2. Add and register its CMS definition.
3. Add section components under `src/components/sections/<slug>/`.
4. Use `getPage()` and `notFound()` when the required record is absent.
5. Generate metadata with `createPageMetadata()`.
6. Add it to sitemap/navigation where appropriate.
7. Add tests and run a production Lighthouse pass.

### Styling and accessibility

Tokens live in `src/styles/variables.css`; typography, buttons, forms, UI, animation, header, Swiper, and admin concerns have separate files. Prefer tokens and existing primitives over literal colours, spacing, radii, or z-indexes.

Frontend changes must retain logical headings, native controls, visible focus, WCAG AA contrast, reduced-motion support, useful alt text, keyboard operation, and deliberate live-region behaviour. Test dialogs, menus, sliders, forms, date controls, drag-and-drop alternatives, and rich-text editing by keyboard.

### Rich text and links

CMS HTML remains untrusted even when only administrators edit it. Save and render through the central sanitisation utilities; do not introduce a new raw `dangerouslySetInnerHTML` path. Validate CMS-controlled links with the shared URL helper instead of assigning arbitrary strings to `href`.

## Quality checks

Run the complete local gate before deployment:

```bash
npm run verify
```

Individual checks:

```bash
npm test
npm run test:coverage
npm run lint
npm run format:check
npm run typecheck
npm run build
```

The build script deliberately selects Webpack so local verification and Vercel use the same proven bundler. Use that same command for before/after performance comparisons.

## Production build and preview

```bash
npm run build
npm run preview
```

Preview listens on [http://localhost:3001](http://localhost:3001). Production builds need MongoDB connectivity because the CMS-backed public pages are prerendered with hourly revalidation.

## Deploying to Vercel

The repository is configured for the normal GitHub-to-Vercel workflow. There is no generated output directory to configure and no `vercel.json` is required.

### One-time launch setup

1. Push the project to a private GitHub repository. Do not commit `.env.local` or any downloaded production environment file.
2. In Vercel, choose **Add New → Project**, import the repository, and leave the detected framework as **Next.js**. Keep the project root as `./`, the build command as `npm run build`, and the output setting at its default.
3. In **Project → Settings → General**, select Node.js 22.x. The package engine prevents deployment on an older unsupported runtime.
4. Provision MongoDB Atlas, Cloudinary, and SMTP. You can create/link Atlas through Vercel's MongoDB Atlas Marketplace integration or supply an existing `MONGODB_URI`. Ensure Atlas permits connections from the deployment environment and use a dedicated least-privilege database user.
5. Add the environment variables from the table above in **Project → Settings → Environment Variables**. Apply the production values to **Production**. For **Preview**, use a separate database, Cloudinary folder, admin seed password, and mail recipient whenever possible; this prevents a branch preview from changing live content.
6. Set `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS origin. Set `ADMIN_PATH` without slashes. Generate a unique production `AUTH_SECRET`; never reuse the local secret.
7. Open **Project → Analytics**, click **Enable**, and deploy. The `@vercel/analytics` component is already mounted in the root layout, so page views and client-side navigation begin recording after deployment. Web Analytics is cookieless and stores anonymised aggregate data; still disclose analytics in the site's privacy notice.
8. Trigger the first deployment. If Vercel reports a database connection error during the build, fix the Atlas network access/URI and redeploy; public CMS pages are prerendered and therefore require the database during the build.
9. Seed the production CMS once from a trusted local checkout linked to the Vercel project:

   ```bash
   npx vercel link
   npx vercel env run -e production -- npm run seed:admin
   ```

   The core seed is repeatable: it creates/updates the configured initial administrator and fills missing defaults without replacing normal editor content. Run the optional design seed commands only if those imported page designs are required. When seeding finishes, redeploy Production so every prerendered route starts with the seeded content. The three `SEED_ADMIN_*` values are not needed by the running website and may be removed from Vercel after this one-time setup; keep normal administrator management inside the CMS.
10. In **Project → Settings → Domains**, add the preferred domain and follow the exact DNS records Vercel displays. Add both apex and `www` if required, choose one canonical domain, and redirect the other. If the domain differs from `NEXT_PUBLIC_SITE_URL`, update that variable and redeploy—environment-variable changes do not alter an existing deployment.

From then on, a push to the production branch (normally `main`) creates a production deployment; other branches create Preview deployments. Content changes made in the CMS do not require a redeploy.

### Values to configure in Vercel

Copy the names, not secrets, from `.env.example`. The minimum complete production set is:

```text
NEXT_PUBLIC_SITE_URL
ADMIN_PATH
AUTH_SECRET
MONGODB_URI
SEED_ADMIN_NAME
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
SMTP_FROM_EMAIL
SMTP_FROM_NAME
CONTACT_RECIPIENT_EMAIL
```

`RATE_LIMIT_STORE` should stay unset in production so the MongoDB-backed distributed limiter is used. Never put secret values in a `NEXT_PUBLIC_` variable; only `NEXT_PUBLIC_SITE_URL` is intentionally public.

### Five-minute post-deploy acceptance test

1. Visit `/`, `/services`, `/careers`, `/contact`, and an unknown URL to confirm the custom 404.
2. Sign in at `/<ADMIN_PATH>/login`, change a harmless text field, save, refresh, and undo the test change.
3. Upload an image and a video from the media library and confirm both render after refresh.
4. Submit the public contact form and confirm both the stored submission and notification email.
5. Visit `/robots.txt` and `/sitemap.xml`; confirm their URLs use the canonical domain.
6. Check **Vercel → Analytics** after visiting several pages. Analytics may take a short time to populate.
7. Run `npm run verify` locally against the exact commit being promoted, then run a mobile Lighthouse audit against the production URL.

Before deploying:

1. Set a real HTTPS `NEXT_PUBLIC_SITE_URL`.
2. Use production-only service credentials and a new high-entropy `AUTH_SECRET`.
3. Restrict MongoDB/Cloudinary access to required permissions and networks.
4. Confirm SMTP sender verification.
5. Run `npm run verify` using the deployment Node version.
6. Back up MongoDB and test restoration.
7. Confirm security headers at the deployed edge. The application sends HSTS with `includeSubDomains` in production, so every current and future subdomain must support HTTPS before using this policy.
8. Submit a test form and verify stored and emailed states.
9. Check robots, sitemap, canonicals, and public 404s.
10. Run accessibility and mobile Lighthouse against the deployment.

## Mobile Lighthouse

Audit a production build, never `npm run dev`:

```bash
npx lighthouse@13.4.0 http://localhost:3001/ \
  --chrome-flags="--headless" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output=json --output-path=/tmp/triple-h-mobile
```

Use default mobile throttling and a clean browser. Run at least three times on an idle machine, report the median, and separate cold database/image-cache results. Historical evidence lives in `reports/mobile-performance/`.

## Security and operations

- Authentication, not the configurable CMS path, is the security boundary.
- Sessions are signed HTTP-only same-site cookies checked against the active administrator.
- CMS HTML and URLs are allow-list sanitised on write and read.
- Login and public forms use atomic MongoDB-backed production rate limits with TTL cleanup. A Redis/KV adapter implementing `consume({ key, limit, windowMs })` may be assigned to `globalThis.__cmsRateLimitAdapter` for high-scale deployments; edge rate limiting remains useful defence in depth.
- Mutation routes reject untrusted cross-site requests.
- Form data is bounded, normalised, and checked against its server definition.
- Media uploads are validated and partial Cloudinary/database failures are cleaned up where possible.
- Security headers are defined in Next configuration and must remain aligned with the CDN.

Alert on database failures, repeated login failures, rate limits, email failures, and media cleanup failures. Never log passwords, tokens, credentials, or full submission bodies.

## Troubleshooting

### Unsupported Node version

Switch to Node 22.12+ (Node 22 LTS), then rerun `npm ci` and the build.

### CMS path redirects home

Use `ADMIN_PATH`, not `/cms-internal`. The internal route is intentionally hidden behind `src/proxy.js`.

### Login always fails

Check `MONGODB_URI`, `AUTH_SECRET`, and seed values. Rerun `npm run seed:admin` to update the configured seed account. Confirm the account is active and secure cookies are accepted on HTTPS.

### Form saves but email does not arrive

Check its CMS status. `email_failed` means the enquiry was stored but SMTP failed. Verify host, port, TLS mode, credentials, sender, recipient, and provider logs.

### Uploaded image is missing

Check Cloudinary credentials, resource type/size, folder, and MongoDB record. Run `node scripts/audit-media.mjs`.

### Why the build script selects Webpack

```bash
npm run build
```

The app previously hit a sandbox-only Turbopack CSS-worker port restriction. Webpack is therefore selected explicitly as the consistent local, CI, and Vercel production build.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development on port 3000. |
| `npm run build` | Create the default production build. |
| `npm start` | Start a completed build on port 3000. |
| `npm run preview` | Start a completed build on port 3001. |
| `npm test` | Run the Node tests. |
| `npm run test:coverage` | Run tests with coverage. |
| `npm run lint` | Run static lint checks. |
| `npm run format:check` | Check formatting without rewriting files. |
| `npm run typecheck` | Check JavaScript/JSDoc types without emitting. |
| `npm run verify` | Run the complete quality gate. |
| `npm run seed:admin` | Seed administrator and core CMS defaults. |
| `npm run seed:triple-h` | Seed Triple H content, portal users and forms. |

## Data and backups

Collections are `users`, `pages`, `globals`, `navigations`, `forms`, `formsubmissions`, `media`, and short-lived rate-limit buckets. Seed bookkeeping may also use `contentseeds`.

Back up MongoDB before destructive replacement, bulk deletion, schema migration, or retention cleanup. Cloudinary and MongoDB are separate systems, so recovery procedures must account for both.
# triple-h
