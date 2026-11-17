# Contributing

Thanks for helping with the GlitchPrints site. It's plain HTML, so most changes are
small text edits.

## Ground rules

- Work on a branch off `website` and open a pull request into `website`. Don't push to
  `main`; it holds an older site.
- One change per pull request, with a short note on what a visitor will see differently.
- Don't commit customer or prospect names, emails or phone numbers, costs or margins,
  passwords or keys. The repo is public.
- No made-up reviews, testimonials, certifications or safety claims.

## Editing a page

1. Open `<slug>/index.html` (the home page is `index.html` at the root).
2. Change the text inside `<main>`. Keep one `<h1>` per page.
3. If you change the page's topic or headline, update its `<title>`, meta description,
   `og:title` and `og:description` to match.
4. If you change a price, follow the checklist in [docs/pricing.md](docs/pricing.md).
5. Preview with `python3 -m http.server 8000` and check the page on a phone-width window.

## Site-wide changes (nav, footer, colors, fonts)

The CSS, header and footer are copied into every page. Make the same change in all
`*/index.html` files, `index.html` and `404.html`. A find-and-replace across the repo
works well; check the count of files changed is 25.

## Adding a page

1. Copy the closest existing folder, for example `custom-coasters/`, to a new slug.
2. Update `<title>`, meta description, canonical URL, `og:url`, `og:title`,
   `og:description`, the `BreadcrumbList`, `Service` and `FAQPage` JSON-LD, the `<h1>`
   and the content.
3. Add the URL to `sitemap.xml`.
4. Link it from the footer (and the home page's "What are you making?" list if it fits),
   in every page.
5. Check [docs/search.md](docs/search.md) so the page targets a search no other page targets.

## Photos

Photo spots are marked with a dashed "Photo to add" box (`.ph-box`). Replace the box
with an `<img>` as shown in the HTML comment next to it. Use real photos of real work,
resized to about 1200 px wide, saved under `assets/` (create it), with descriptive `alt` text.

## Brand

Follow [docs/brand.md](docs/brand.md).
