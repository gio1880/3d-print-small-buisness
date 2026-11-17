# Models — notes for Claude

This folder holds the Glitch Prints 3D models. The repo is **public**: keep only design files and design notes here. Costs, margins, orders, customer names and stock stay in the private notes on Giovanny's PC (`WDS-STEM\3D Printing Small Business\`: `BUSINESS.md`, `COSTS.md`, `ORDERS.md`, `STOCK.md`).

## Rules

- No supports, ever. Every design prints with supports off. Run the folder's support check (`big-eye-animals/_generator`: `node supports.mjs`) after any change to a design.
- Big-eye animals keep the same eye (white oval, black pupil low and forward, one white shine dot) and 3 colours max: body, white, black.
- Every new design gets a `.3mf` (Bambu A1/P1S) and its colour STLs (Anycubic Kobra S1), a row in `PRODUCTS.md` and in `FILAMENT.md`, and a line in its folder's README.
- No characters or brands someone else owns (no Pokémon, Godzilla, etc.). Original designs only.
- Don't commit zips, `node_modules/` or `_slice-tmp/` (they're in `.gitignore`).
- When a design is ready to sell, add it to `../catalog.js` (price in cents) with a real photo in `../assets/`. Prices are Giovanny's call.
