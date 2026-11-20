@AGENTS.md

# CLAUDE.md

Context for AI assistants (Claude, Claude Code) working on the GlitchPrints website.

## The business in one paragraph

GlitchPrints is a small custom-order shop: 3D printed and laser cut pieces made in batches
for families, schools, teams, restaurants and events. Customers get a free digital proof,
free local pickup in Flushing (Queens) or Hartsdale (Westchester), and pieces in days.
GlitchPrints is its own business. Don't mix it with any other program or brand.

## Read these before changing content

1. [docs/business.md](docs/business.md): who we sell to and how ordering works
2. [docs/pricing.md](docs/pricing.md): prices, bundles, holiday deals, what's still unpriced
3. [docs/search.md](docs/search.md): which searches each page targets
4. [docs/service-areas.md](docs/service-areas.md): where we pick up, deliver and ship
5. [docs/brand.md](docs/brand.md): colors, fonts, voice
6. [CONTRIBUTING.md](CONTRIBUTING.md): how to edit pages safely

## Rules

- **Static site, no build.** Pages are hand-maintained HTML at `<slug>/index.html`.
  Shared CSS, header and footer are copied into every page. A site-wide change means
  editing all 24 pages (and `404.html`) the same way.
- **Keep prices in sync.** A price appears on `/pricing/`, on its product page, often in
  that page's JSON-LD (`AggregateOffer`) and FAQ, and sometimes on the home page.
  Change all of them together. `docs/pricing.md` is the reference.
- **Never invent facts.** No made-up reviews, customer names, certifications, safety
  claims, awards or business registrations. Unknowns stay as "ask for a quote" or a
  marked placeholder. Photo and review spots are marked in the HTML.
- **Every page keeps its SEO basics:** unique `<title>` and meta description, canonical
  URL with trailing slash, Open Graph tags, `BreadcrumbList` and `FAQPage` JSON-LD, one
  `<h1>`. New pages also go in `sitemap.xml` and in the header or footer links.
- **Quote form:** `/contact/` posts to FormSubmit (`https://formsubmit.co/printsglitch@gmail.com`)
  with `_next` set to `https://glitchprints.com/thanks/`. Don't change the address or add
  required fields without asking.
- **This repo is public.** Don't commit customer names or contact details, prospect lists,
  costs or margins, passwords or API keys, or personal details about the owner.
- **Deploys:** GitHub Pages serves this branch from the root. Don't touch the `main`
  branch (an older Render site), `CNAME`, DNS or Pages settings unless asked.

## Still unconfirmed

- Prices for ornaments, acrylic signs and NFC review stands (quoted per job for now).
- Laser cutter model and bed size, and the Anycubic printer model.
- Shop photos, owner bio and real customer reviews (placeholders on the pages).
