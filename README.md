# GlitchPrints website

GlitchPrints makes custom 3D printed and laser cut pieces in small batches for families,
schools, teams, restaurants and events around Queens and Westchester, New York.
This branch (`website`) is the public site for **glitchprints.com**.

- Email: printsglitch@gmail.com
- Phone and text: (646) 345-1727
- Site: https://glitchprints.com/ (not live yet, see [docs/deploy.md](docs/deploy.md))

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | Home page |
| `<page-name>/index.html` | One folder per page, so URLs are clean: `/custom-coasters/` |
| `404.html` | Page-not-found page |
| `sitemap.xml`, `robots.txt` | Search engine files |
| `CNAME` | Tells GitHub Pages the custom domain (`glitchprints.com`) |
| `.nojekyll` | Tells GitHub Pages to serve files as they are |
| `CLAUDE.md` | Start here if you're an AI assistant |
| `CONTRIBUTING.md` | How to make a change |
| `docs/` | Business context: what we sell, prices, searches, areas, brand, deploy |

The site is plain HTML with no build step and no JavaScript framework. Each page carries
its own copy of the CSS, header and footer, so a site-wide change (nav, footer, colors)
has to be made in every page. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000/. The quote form only sends from the live domain.

## Pages (24)

- **Home:** `/`
- **Families and parties:** `/birthday-party-favors/`, `/custom-cake-toppers/`, `/custom-toy-from-drawing/`, `/christmas-ornaments-gifts/`
- **Schools and teams:** `/class-gifts/`, `/custom-clicker-keychains/`, `/custom-name-keychains/`, `/custom-medals/`
- **Restaurants and businesses:** `/restaurant-table-numbers/`, `/qr-code-table-stands/`, `/google-review-stands/`, `/custom-coasters/`, `/custom-acrylic-signs/`
- **Events:** `/event-table-numbers-place-cards/`
- **Services and areas:** `/3d-printing-service/`, `/laser-engraving-service/`, `/3d-printing-queens/`, `/3d-printing-westchester/`
- **Other:** `/pricing/`, `/faq/`, `/about/`, `/contact/` (quote form), `/thanks/` (after the form, not indexed)

## Docs

- [Business overview](docs/business.md)
- [Prices and offers](docs/pricing.md)
- [What customers search for](docs/search.md)
- [Service areas](docs/service-areas.md)
- [Brand rules](docs/brand.md)
- [Deploying the site](docs/deploy.md)
