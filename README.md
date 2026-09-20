# Mohammad Saif Khan — The Digital Workbench

A complete, framework-free portfolio built for GitHub Pages. The design uses paper, ink, vermilion and a technical green, with editorial project layouts and a native, keyboard-accessible Build Matrix. It deliberately uses one light theme. No trackers, runtime dependencies, API calls, web fonts, fake contact forms or backend are included.

## Preview

Open `index.html` directly, or serve this directory with any static HTTP server. Everything needed to read the portfolio is already in HTML. JavaScript enhances the local time, navigation indicator, grid experiment and disclosure exclusivity.

## Customize

1. Edit `content/site.json`: email, GitHub, LinkedIn, optional WhatsApp and résumé URLs, and the final HTTPS `siteUrl`. For a project site, include its repository path, for example your real Pages URL followed by `/repository-name/`. Do not use an invented domain.
2. Edit `content/projects.json` for project names, descriptions, modules and product context. The four case study routes are generated from these records; additional records receive a detail page and appear in the project index. Use a unique, lowercase, hyphenated `id`.
3. Run `node scripts/build.mjs` from this directory. Node is an optional authoring tool, never a deployment backend. Commit the generated HTML alongside the source. The build preserves the JSON content and CSS/JS files.
4. Edit `scripts/build.mjs` for the profile copy, toolkit, case study sections, exact project roles, dates, verified implementation details, links and actual screenshots. Then rebuild. The native HTML interface studies are placeholders, with invented demonstration records explicitly labeled as illustrative. They do not claim production metrics or shipped features.
5. `assets/css/style.css` holds the visual tokens, responsive layout, interaction states and reduced-motion rules. `assets/js/main.js` contains the small progressive enhancements.

Until contact values are supplied, the footer explicitly says the contact details are awaiting configuration. It never claims a message was sent. A configured email becomes a real `mailto:` link in the static HTML, including when JavaScript is disabled. Optional WhatsApp and résumé links are omitted unless supplied. Social URLs must be HTTPS.

The toolkit represents the brief's supplied working direction, not a certification or a proficiency claim. Confirm the suggested location, availability and all public-facing content before publication.

## PERSONALIZATION CHECKLIST

- [ ] email
- [ ] GitHub profile
- [ ] LinkedIn
- [ ] WhatsApp
- [ ] domain / final GitHub Pages siteUrl
- [ ] profile image (optional; a monogram is provided)
- [ ] favicon (`assets/icons/favicon.svg`)
- [ ] Open Graph image (`assets/images/og-cover.jpg`, 1200 × 630)
- [ ] project screenshots (`assets/images/projects/`)
- [ ] project descriptions, dates, roles, architecture, challenges and lessons
- [ ] project URLs
- [ ] résumé link if wanted

## Publish with GitHub Pages

1. Create an empty GitHub repository. Use `USERNAME.github.io` for a user site, or any repository name for a project site.
2. Copy the contents of this folder into the repository root, including `.nojekyll`.
3. Configure the final `siteUrl` in `content/site.json` and run `node scripts/build.mjs`. This generates absolute canonical/social URLs, a sitemap and the robots sitemap directive. It also fixes custom-404 assets for arbitrary nested missing URLs.
4. In the repository folder, run:

   ```sh
   git init
   git add .
   git commit -m "Build digital workbench portfolio"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPOSITORY_URL
   git push -u origin main
   ```

5. Open GitHub → Settings → Pages.
6. Under Build and deployment, select **Deploy from a branch**, **main**, and **/(root)**, then Save.
7. Wait for the Pages deployment to complete, open the published URL, and test all project links and a missing nested path. All normal asset/navigation paths are relative and work under repository subdirectories.
8. Run a Lighthouse audit against the actual deployed URL on mobile and desktop. Target 95+; no score or Core Web Vitals result is claimed without measurement.

No GitHub repository was created or published as part of this local delivery.

## Custom domain

Add your real domain in Settings → Pages → Custom domain and follow GitHub's DNS instructions. Put that same hostname in a root `CNAME` file when maintaining it in Git. Update `siteUrl` to the complete HTTPS custom-domain URL and rebuild to refresh canonical URLs, the sitemap, social URLs and 404 base. Enable HTTPS once DNS is verified. A fake CNAME is intentionally not included.

## Assets, SEO and privacy

- The included 1200 × 630 social cover and favicon are replaceable personal-brand placeholders. Project mock interfaces are HTML/CSS, so there are no large raster assets on the homepage.
- Optional portraits should have meaningful alt text, explicit dimensions and an optimized format. Screenshots need descriptive captions, dimensions, `loading="lazy"` below the fold and responsive source sizes. Do not lazy-load a future hero image.
- System sans-serif and Georgia fonts eliminate font network requests and font-swap shifts. Substitute licensed, self-hosted WOFF2 fonts with `font-display: swap` if desired.
- Person structured data contains only the supplied name and professional positioning. WebSite structured data and canonical URLs are emitted after a real siteUrl is configured. The initial empty sitemap is an explicit domain placeholder, not a claim that SEO is deployment-complete.
- Analytics is optional: add a privacy-friendly provider's snippet in the shared head template in `scripts/build.mjs`, only after deciding your privacy policy. Never include private credentials.
- Build content is trusted author content. This is not a CMS for untrusted user submissions.

## Accessibility and performance

Semantic landmarks, a skip link, visible focus outlines, native disclosures, radio inputs, no hover-only project links, reduced-motion handling and responsive layouts are included. The native pointer stays visible. The matrix is a vertical sequence on mobile; large previews are bounded inside their containers. No animation loops or scroll listeners are used. The progress bar uses scroll-driven CSS where supported.

Before publishing, verify keyboard-only navigation, 200% zoom, a screen-reader heading outline, reduced motion, all configured links, missing-page behavior and real content contrast. Case study TODOs should be replaced with verified information before you present them as complete case studies.
