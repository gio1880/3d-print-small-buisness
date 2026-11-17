# Deploying the site

Host: **GitHub Pages**, serving the `website` branch from the root. Free for a public
repo, no card needed. Domain: **glitchprints.com**, registered at Namecheap.

## First-time setup (repo owner)

1. GitHub: repo **Settings > Pages**. Source: **Deploy from a branch**, branch `website`,
   folder `/ (root)`. Save.
2. Same page: **Custom domain** `glitchprints.com`. Save. (Add it here before changing DNS.)
3. Namecheap: **Domain List > glitchprints.com > Manage > Advanced DNS**. Delete the
   parking or redirect records for `@` and `www`, then add:
   - A record, host `@`, value `185.199.108.153`
   - A record, host `@`, value `185.199.109.153`
   - A record, host `@`, value `185.199.110.153`
   - A record, host `@`, value `185.199.111.153`
   - CNAME record, host `www`, value `gio1880.github.io.`
4. Wait for DNS (minutes, up to 24 hours), then tick **Enforce HTTPS** in Pages.
5. Send one test quote on the live site. FormSubmit emails printsglitch@gmail.com a
   one-time confirmation; click it. Real requests arrive after that.
6. Optional: add the site to Google Search Console and submit
   `https://glitchprints.com/sitemap.xml`.

## After setup

Every push to `website` redeploys the site in about a minute. Merge pull requests into
`website` to publish changes.

## Don't

- Don't delete or edit `CNAME` (it holds the custom domain).
- Don't delete `.nojekyll`.
- Don't deploy from `main`; it holds the older Render site.
