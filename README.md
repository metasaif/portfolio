# Your portfolio: edit, commit, publish

This version has no build step. Edit the HTML directly. You do not need Node, JSON configuration, Git commands or a terminal.

## Which file do I edit?

| What you want to change | File |
| --- | --- |
| Your introduction, biography, skills, availability and contact links | index.html |
| Project summaries on the homepage | index.html |
| Cliniaro's full case study | projects/cliniaro.html |
| WhatsCRM's full case study | projects/whatscrm.html |
| WFH Connect's full case study | projects/wfh-connect.html |
| Webdivi's full case study | projects/webdivi.html |
| Colors, fonts, spacing and mobile layouts | assets/css/style.css |
| Grid interaction and other small enhancements | assets/js/main.js |
| Browser icon | assets/icons/favicon.svg |
| Social sharing image | assets/images/og-cover.jpg |

## Make a normal content change on GitHub

1. Open your portfolio repository and select the branch used by Pages (your uploaded files used the branch named first).
2. Open the relevant HTML file and click its pencil / Edit control.
3. Search for the visible text you want to change, or search EDIT to find the section comments. Text between tags is the visible copy. Preserve the tags around it.
4. Make the edit and click Commit changes. Commit to the publishing branch.
5. Wait for the Pages deployment to complete, then reload the site.

Example: change <h3>PHP</h3> to <h3>PHP / Laravel</h3> only if it reflects your actual stack.

## Add your email

In index.html, find this placeholder:

```html
<span class="pending-contact">Email <small>To be added</small></span>
```

Replace it with the following, changing YOUR_EMAIL to your actual email address:

```html
<a href="mailto:YOUR_EMAIL">Email <span aria-hidden="true">↗</span></a>
```

Replace the LinkedIn placeholder in the same way, using your real profile URL as href. GitHub already links to https://github.com/metasaif. Once your details are filled in, remove the paragraph saying that email and LinkedIn are awaiting configuration. There is no fake form or form submission.

## Edit a project

Change its short introduction in index.html and its full story in projects/PROJECT-NAME.html. These are ordinary independent HTML pages. Search TODO in the project page to find facts you still need to supply. Replace illustrative interfaces with real screenshots when ready, retaining descriptive alt text and image dimensions. No revenue, results or credentials have been invented.

## Replace your current version

Use the separate saif-portfolio-simple-update.zip for the smallest update:

1. Extract the ZIP.
2. In your repository root, use Add file → Upload files and upload index.html, 404.html, README.md, robots.txt and sitemap.xml from the extracted update.
3. Open the existing projects folder on GitHub. Use Add file → Upload files and upload the four HTML files from the update's projects folder. Do not upload those four files at the root.
4. Open assets/css on GitHub. Upload style.css from the update ZIP assets/css folder and commit. This applies the new blue, lime, violet and coral design. Keep the rest of your assets folder.

The complete saif-portfolio-simple.zip includes the existing CSS, JavaScript and images if you need to restore anything. Preserve its folder structure when uploading.

## Old files you no longer need

After replacing the HTML, you can delete content/site.json, content/projects.json and scripts/build.mjs. If they still sit at the repository root, their names are site.json, projects.json and build.mjs. These old files are not used by this version; leaving them temporarily will not break the website. Do not run the old build script because it can overwrite your direct HTML edits. The old VALIDATION.md can also be removed because it describes the earlier version.

Keep assets/js/main.js: it is the browser interaction code, not a build script. Keep site.webmanifest, robots.txt, sitemap.xml and .nojekyll. Do not delete your working assets or projects folders.

## Website address and deployment

SEO URLs and missing-page navigation are configured for https://metasaif.github.io/portfolio/. Settings → Pages should use the branch containing your corrected files and the root folder. No deployment was performed by preparing this package.

If you switch domains, replace the old URL in each HTML page, robots.txt and sitemap.xml. The base URL in 404.html must also match. The regular page paths remain relative for GitHub Pages project hosting.

## PERSONALIZATION CHECKLIST

- [ ] Email
- [x] GitHub profile: metasaif
- [ ] LinkedIn
- [ ] WhatsApp, if wanted
- [x] Current GitHub Pages domain configured
- [ ] Profile image, if wanted
- [ ] Favicon, if you want to change it
- [ ] Open Graph image, if you want to change it
- [ ] Real project screenshots
- [ ] Verified project descriptions, dates, roles, decisions and lessons
- [ ] Live project and repository URLs
- [ ] Résumé link, if wanted

The responsive layout, touch navigation, native Build Matrix and reduced-motion support remain. No analytics or external runtime dependencies are included. Lighthouse scores and real-user performance are not claimed without a deployed audit.

