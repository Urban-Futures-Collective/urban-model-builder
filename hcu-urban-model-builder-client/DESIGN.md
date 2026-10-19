# UMB × UFC design system

The client follows the **UMB design system** (structure, layout, node grammar) dressed in the
**Urban Futures Collective (UFC)** brand (colours, fonts, logo endorsement). This file records which
parts come from where and why. Tokens live in `app/styles/_tokens.scss` (SCSS + CSS custom
properties); component styles in `app/styles/_ufc.scss`.

## Kept from UMB

- **Structure.** Library screens use a 64px left rail instead of a top navbar. The editor has no
  bar at all: a floating title block (top left), a run/share cluster (top right), the existing
  sidebar views (left), the node inspector (right) and a persistent node dock (bottom).
- **The interface is neutral, colour belongs to the model.** Node colours are unchanged
  (`$node-color-map` in `app/styles/lib/colors.scss`) and are the only saturated colour on the
  canvas. Every node type also has its own shape (radius), so types stay readable without colour.
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
- **Links** in UFC light blue `#0873b2`; secondary buttons in UFC dull blue `#536690`.
- **Endorsement.** The UFC pinwheel logo appears on the landing page, the login page and in the
  footer ("Urban Model Builder · Urban Futures Collective"). The product mark stays the UMB mark.

## Deliberately not combined

- **UFC wedge colours** (teal, rose, mauve, mid-blue…) are not used in UI chrome. Several sit close
  to node colours (converter `#225f50`, action `#584560`, OGC `#c1a7cd`) and would make the
  canvas ambiguous. They appear only as the landing hero backdrop (dark navy) and in the UFC logo.
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
