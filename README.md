# WoWPlaystyle

Design a World of Warcraft class set and get images that look like they came out of the game: a Wowhead-style tooltip for every item, and a sheet showing where each piece drops and which crafters restore it.

Made by krellian36. Fan-made and not affiliated with Blizzard Entertainment. Item icons load from Wowhead.

## Using it

- The sheet is your playstyle. Click any part of it to edit that part: the title, the set bar, an item's tooltip, its crafting step, or where it drops.
- **Examples** loads one of the nine playstyles from the [design document](DESIGN_DOCUMENT.md).
- **Save** downloads the playstyle as a `.json` file. **Open**, or dropping a file on the page, loads one back. Files saved by the first version of WoWPlaystyle open too.
- **Export** saves the sheet as a PNG, the selected item's tooltip as a PNG with a transparent background, or every tooltip in a ZIP.
- Your work stays in this browser between visits. Nothing is sent anywhere.

### Icons

Icon fields take a Wowhead icon name such as `inv_staff_13`. **Browse Wowhead icons** under the field opens Wowhead's icon list; pick one and copy its name. If no icon has that name, the field says so and the item shows a question mark.

### Sets

The set is defined once, in the set bar: its name and its bonuses. Each item is either in the set or not, and equipped or not. The `(2/3)` count on tooltips, which piece names light up and which bonuses turn green all follow from that.

## Files

| File | What it holds |
|---|---|
| `index.html`, `app.css` | Page and styles |
| `app.js` | The editor: state, the live sheet, the edit panel, toolbar, autosave |
| `model.js` | The save format, opening old saves, set rules, stat colours |
| `render.js` | Tooltip and sheet markup, shared by the editor and the exports |
| `panel.js` | Edit panel markup |
| `export.js` | PNG and ZIP export |
| `examples/` | The nine example playstyles |
| `vendor/` | html-to-image 1.11.13 and fflate 0.8.2, unmodified |
| `tests/` | Tests, with the original example files in `tests/fixtures/v1/` |

## Running it locally

There's no build step. Serve the folder and open it:

```
npx serve .
```

Tests use Node's built-in runner (Node 20 or newer):

```
npm test
```

`node scripts/check-icons.mjs` checks every icon name in the examples against Wowhead and refreshes `tests/fixtures/known-icons.txt`.

## Credits

Marcellus by Astigmatic (SIL Open Font License, see `fonts/OFL.txt`). html-to-image and fflate are MIT licensed.
