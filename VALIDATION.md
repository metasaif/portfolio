# Validation

Verified locally in headless Microsoft Edge using Playwright:

- Homepage layouts at 320, 375, 430, 768, 1024, 1280, 1440 and 1920px: no horizontal overflow.
- All four case study pages at 320 and 1440px; after mobile refinement, all five pages at 320, 375, 430 and 768px: no horizontal overflow.
- Mobile navigation links have at least 44px-high touch areas. Build Matrix responds to touch and keyboard input.
- Grid experiment changes density correctly. Reduced-motion preference disables the intro animation.
- JavaScript-disabled homepage retains project links, contact placeholders and working native disclosures.
- Skip link transfers focus to the main landmark.
- A 720px viewport reflow check represents the available CSS width of a 1440px display at 200% browser zoom. This is not a complete text-zoom or assistive-technology audit.
- No observed JavaScript exceptions. Static local asset and page references resolved.
- Configured contact links, optional WhatsApp link, canonical URL, absolute social image URL, sitemap, and nested 404 base passed build checks in a temporary copy. Test contact values were not included in the delivered site.
- Desktop, mobile, project preview and Build Matrix screenshots were visually reviewed.

Not measured: deployed Lighthouse scores, real-user Core Web Vitals, screen-reader testing, or cross-browser Safari/Firefox behavior. The requested 95+ Lighthouse scores remain targets rather than verified results.

Before publication: replace the documented content placeholders, configure the actual site URL and contact links, rebuild, deploy and audit the real URL.
