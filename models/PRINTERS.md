# Printers

| Printer | Where | Colour unit | Bed | Use this file |
|---|---|---|---|---|
| Bambu Lab A1 | home | AMS Lite? (confirm) | 256 × 256 mm | `<animal>.3mf` as is |
| Bambu Lab P1S | home | AMS | 256 × 256 mm | `<animal>.3mf`, then switch the printer to P1S (see below) |
| Anycubic Kobra S1 | home | Anycubic multi-colour box (ACE Pro? confirm) | about 250 × 250 mm | the three STLs, in Anycubic Slicer Next |
| Bambu Lab A1 × 4 | WDS lab | AMS Lite | 256 × 256 mm | `<animal>.3mf` as is |

**School A1s:** approved for business prints. Giovanny pays for the filament. Note school prints in `STOCK.md`.

## Using the files

- **A1 (home or school):** open the `.3mf` in Bambu Studio. Slots 1 = body, 2 = white, 3 = black. Brim off, no supports.
- **P1S:** open the `.3mf`, pick "Bambu Lab P1S 0.4 nozzle" in the printer box, say yes to keeping the project's settings, and check the three filaments map to your AMS slots. Re-slice: the time will be shorter than the A1 numbers in `PRODUCTS.md`.
- **Kobra S1:** Bambu `.3mf` projects don't carry over. In Anycubic Slicer Next, load `stl/<animal>-body.stl`, `-white.stl` and `-black.stl` **together as one object with multiple parts**, then set each part's filament. Brim off, no supports. The joints were tuned for Bambu tolerances (0.45 mm gaps): print `joint-test` on the Kobra first.

## Notes

- Every slice time in `PRODUCTS.md` is Bambu Studio's estimate on the A1, one animal alone on the plate.
- Most of the time and filament is purge from colour changes. Fill a plate with copies of one animal to share that purge.
- The long flexi dragon is 210 mm: fits all of these beds.
