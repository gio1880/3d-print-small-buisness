# GlitchPrints site: launch steps

This branch is the finished site, served as is by GitHub Pages from the branch root.

## What's already done
- 24 pages with titles, descriptions, business and FAQ schema, sitemap.xml, robots.txt, 404 page.
- Quote form posts to FormSubmit for printsglitch@gmail.com (free, no account). Sends to /thanks/ after.
- CNAME file set to glitchprints.com. Headings in Orbitron, body in Inter.
- Domain: glitchprints.com, registered at Namecheap on Jul 16, 2026 (1 year).

## Host: GitHub Pages (free for a public repo, no card)
1. Done: this branch, `website`, in
   gio1880/3d-print-small-buisness.
2. On GitHub: repo Settings > Pages > Source "Deploy from a branch" > branch `website`, folder `/ (root)` > Save.
3. Same page: Custom domain `glitchprints.com` > Save. (Add it here before changing DNS.)
4. Namecheap: Domain List > glitchprints.com > Manage > Advanced DNS. Delete the parking/redirect
   records for `@` and `www`, then add:
   - A record, host `@`, value 185.199.108.153
   - A record, host `@`, value 185.199.109.153
   - A record, host `@`, value 185.199.110.153
   - A record, host `@`, value 185.199.111.153
   - CNAME record, host `www`, value gio1880.github.io.
5. Wait for DNS (minutes, up to 24 hours), then tick "Enforce HTTPS" in Settings > Pages.
6. Submit one test quote on the live site. FormSubmit emails printsglitch@gmail.com a one-time
   confirmation; click it. Real requests flow after that.
7. Optional, free: add the site in Google Search Console and submit https://glitchprints.com/sitemap.xml.

Leave the Render service alone; once the domain points at GitHub Pages, Render isn't used.

## Still needed from Gio before or soon after launch
- Prices for ornaments, acrylic signs and NFC review stands (pages say "ask for a quote" until then).
- 3 to 6 photos of real finished pieces, a 2 to 3 sentence bio, and real reviews when you have them.
  The site can launch without these; marked spots show where they go.
