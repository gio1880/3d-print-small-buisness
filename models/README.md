# Glitch Prints models

The 3D models behind the shop: Bambu Studio projects, STLs for other slicers, preview pictures, and the code that generates them. The shop itself (`index.html`, `catalog.js`, `server.js`) doesn't read this folder.

| Folder / file | What |
|---|---|
| `big-eye-animals/` | 12 articulated big-eye animals + a joint test, an octopus, 1.3 in minis of every animal and 2.5 in short wigglers, 3 colours (body, white, black) |
| `two-colour-dragons-clickers/` | 2 articulated dragons (plus mini and short versions) + 30 two-piece keyboard-switch fidget clickers, 2 colours |
| `slice-3mf.ps1` | Slices a list of .3mf files with Bambu Studio and writes time + grams to a CSV |
| `PRODUCTS.md` | Catalog of designs: size, what moves, print time, grams, status |
| `FILAMENT.md` | Which colour goes in which AMS slot for every model, with grams |
| `PRINTERS.md` | The printers and which file each one uses |
| `CLAUDE.md` | Rules for Claude sessions working on the models |

## Printing

Open a `.3mf` in Bambu Studio (A1 / P1S). For the Anycubic Kobra S1, load that model's colour STLs from `stl/` together as one object. Each folder's README has sizes, slice times, settings and which test piece to print first.

## Rebuilding

Each folder has a `_generator/` (Node.js + manifold-3d). `npm install` in `big-eye-animals/_generator` first (the two-colour generator reuses it), then `node build.mjs <name>`.

## When a design is ready to sell

Add it to `catalog.js` in the repo root (id, name, category, price in cents, stock, image) and a photo of the real print in `assets/`.
