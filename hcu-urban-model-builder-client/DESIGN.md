# UMB × UFC design system

The client follows the **UMB design system** (structure, layout, node grammar) dressed in the
**Urban Futures Collective (UFC)** brand (colours, fonts, logo endorsement). This file records which
parts come from where and why. Tokens live in `app/styles/_tokens.scss` (SCSS + CSS custom
properties); component styles in `app/styles/_ufc.scss`.

## Kept from UMB

- **Structure.** Library screens use a 64px left rail instead of a top navbar. The editor has no
  bar at all: a floating title block (top left), a run/share cluster (top right), the existing
  sidebar views (left), the node inspector (right) and a persistent node dock (bottom).
- **The interface is neutral, colour belongs to the model.** Node colours are the only saturated
  colour on the canvas. Every node type also has its own shape (radius, filled header, frame or
  arrow), so types stay readable without colour and where two types share a hue.
- **Library as a grid of model cards** with a state chip, version, node count and a node-mix bar,
  instead of a list group. A compact table view is kept for dense scanning.
- **Selection = outline, not glow.** A 2px ink outline with 2px offset, the same as keyboard focus.
- **Mark.** The reduced 2 × 2 UMB mark (variant R2, radius sequence), now drawn in UFC dark blue
  (`public/assets/images/umb-mark.svg`, white version `umb-mark-white.svg`, favicon `favicon.svg`).

## Taken from UFC

- **Ink = UFC dark blue `#141c32`.** It replaces black for text, lines, primary buttons, active
  states and selection. White (`#fff`) stays the ground; UFC grey `#f6f5f4` is the sunken surface.
- **Fonts.** Poppins Variable (600, letter-spacing -0.02ch) for headings, buttons, labels and
  navigation; Satoshi Variable for body and interface text. Both are self-hosted from
  `public/assets/fonts/ufc/` (copied from the UFC website repository). Buttons are upper case via
  CSS, as on the UFC site; the copy itself stays in sentence case.
- **Yellow `#e5ac23` as the one accent**, used sparingly in chrome only: the underline under page
  titles, the active tab and rail marker, the hover wash on outline buttons, search highlights.
- **Square corners** on buttons, inputs, cards and panels (both systems agree); **pill badges** for
  metadata chips (UFC).
- **Quiet shadow** (UFC `shadow-xs`, 1–2px soft) instead of UMB's hard offset shadow.
- **Links** are underlined ink, as on the UFC site (`text-primary underline`).
- **Endorsement.** The UFC pinwheel logo appears on the landing page, the login page and in the
  footer ("Urban Model Builder · Urban Futures Collective"). The product mark stays the UMB mark.

## Node ("primitive") colours

Since the rebrand the node colours come from the UFC palette, grouped by modelling paradigm
(`$node-color-map` in `app/styles/lib/colors.scss`). Nine UFC hues serve eleven node types.

| Node | Colour | UFC name | Form | Contrast |
| --- | --- | --- | --- | --- |
| Stock | `#536690` | dull blue | square, filled header | white text 5.7:1 |
| Flow | `#0873b2` | light blue | arrow | line 5.1:1 on white |
| Variable | `#5da899` | light green | pill outline | border 2.8:1 (label carries the meaning) |
| Converter | `#3b7981` | dark teal | rounded outline | border 5.0:1 |
| OGC API Features | `#00649d` | backdrop dark blue | rounded outline | border 6.3:1 |
| Folder | `#242b42` | navy | frame | frame 14:1 |
| State | `#e5ac23` | yellow | soft rounded, filled | ink text 8.3:1 |
| Transition | `#c1952d` | gold | arrow | line 2.8:1, below 3:1 |
| Action | `#7b4b66` | mauve | rounded, filled | white text 6.9:1 |
| Population | `#c36878` | rose | square, filled | ink text 4.49:1, just below 4.5:1 |
| Agent | `#c1952d` | gold | frame | shared with transition, as in the original UMB |

Known weak spots: the transition line and the variable outline are below 3:1 against white, and
text on population headers is 0.01 below AA. If that matters for your audience, darken those
three by one step; the other eight pass.

## Deliberately not combined

- **UFC wedge colours in UI chrome.** Teal, rose, mauve, gold and the blues are reserved for
  nodes, so they never appear on buttons, links, panels or navigation. That keeps "colour = model"
  intact. The one exception is the yellow accent, which is close to the state node colour; it is
  used only as underline, marker and hover wash, never as a filled shape on the canvas.
- **Yellow borders and yellow focus rings** (UFC default `--border`) are not used: yellow is also
  the colour of state and agent nodes. Borders are neutral hairlines (`#e4e2df`), focus is ink.
- **UMB's mono plan labels** (IBM Plex Mono) are dropped in favour of Poppins upper-case labels.
  Values, units and version strings use the system monospace stack with tabular figures, because
  numbers in a modelling tool need to line up. No extra webfont is loaded for this.
- **UFC's fluid `clamp()` type scale** is used for the landing page only; the application uses a
  fixed scale so panels and nodes keep stable sizes.
- **Shimmer border, translucent nav pill** (UFC marketing effects) are not used in the app.

## Credits

The Urban Model Builder was developed by the City Science Lab (HCU Hamburg) as part of Connected
Urban Twins. This rebrand keeps those credits on the landing page and in the legal pages.
