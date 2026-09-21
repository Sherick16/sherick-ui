# The palette

**Decided and implemented.** This is the record of the semantic palette: the values, the roles they
answer to, the compositions that constrained them, and the alternatives that were measured and
rejected. The rules that consume these values are [`DESIGN_LANGUAGE.md`](DESIGN_LANGUAGE.md) §10 and
§14; the values themselves live in `packages/ui/src/styles/tokens.ts`, and they are verified by
`bun run test` against the published `dist/theme.css` (see [`VERIFICATION.md`](VERIFICATION.md)).

## What the palette answers to

A colour in this system is not a token pair, it is a *composition*: text on a surface, an accent on
a tint of itself, the same accent composited over that tint again while the control is hovered or
pressed, an on-colour over an opaque fill, a mark over its selection. The state layer is a `::before`
painted in `currentColor`, so a state moves the *background* toward the label and leaves the label
where it is:

```
foreground  vs  composite(currentColor, state, composite(tint, tintAlpha, surface))
```

Measured that way, the resting pairing is never the binding one. A tonal control's label at rest can
sit comfortably above 4.5:1 and fall to 3.3:1 while it is pressed, which is what the previous palette
did: it was checked as token-on-token, and it failed in the states a user actually interacts with.

## The values

Both themes. Only these moved; every surface, glass, elevation, scrim, edge and `on-*` value, and
the whole dark neutral ladder, is unchanged.

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `--sui-primary` | the accent a label, link or mark takes | `0.52 0.17 255` → **`0.422 0.139 255`** | `0.72 0.15 255` → **`0.809 0.098 255`** |
| `--sui-primary-strong` | the opaque accent fill that marks priority | `0.49 0.19 257` → **`0.402 0.143 257`** | `0.66 0.18 257` → **`0.734 0.139 257`** |
| `--sui-focus` | the focus indicator | `0.52 0.18 255` → **`0.422 0.139 255`** | `0.72 0.15 255` → **`0.809 0.098 255`** |
| `--sui-danger` | destructive and error state | `0.54 0.17 25` → **`0.439 0.170 25`** | `0.72 0.13 25` → **`0.799 0.115 25`** |
| `--sui-warning` | caution | `0.53 0.13 75` → **`0.388 0.082 75`** | `0.82 0.12 80` (unchanged) |
| `--sui-success` | confirmation | `0.50 0.12 160` → **`0.381 0.086 160`** | `0.75 0.10 160` → **`0.769 0.100 160`** |
| `--sui-ink-muted` | supporting copy, descriptions, placeholders | `0.50 0.018 260` → **`0.480 0.018 260`** | `0.76 0.014 255` (unchanged) |
| `--sui-detail` | **non-text** furniture (was `--sui-ink-faint`, the third text step) | `0.63 0.016 258` → **`0.600 0.016 258`** | `0.60 0.014 256` (unchanged) |

Chroma moves only where sRGB cannot hold the authored value at the new lightness — a deeper blue in
light mode and a lighter one in dark mode cannot carry 0.17 and 0.15. The authored *chroma* is
therefore trimmed to what renders: `primary` 0.17→0.139 (light) and 0.15→0.098 (dark), `warning`
0.13→0.082, `success` 0.12→0.086. `danger` keeps 0.17 in light and gains nothing in dark. This is a
real cost and it is the reason the first alternative below was measured rather than assumed.

## Before and after

Every composition the language permits is measured in both themes; this is the subset that changed.
"Worst on" is the surface or state that binds it.

| Composition | Light | Dark |
| --- | --- | --- |
| `tone.text.primary` on its own tint, through hover and press | 3.27 → **4.66** | 3.55 → **4.66** |
| `tone.text.primary` on a surface, through the quiet states | 4.03 → **5.99** | ok → ok |
| `tone.text.primary` on the floating sheets | 4.35 → **6.39** | ok → ok |
| `tone.text.primary` on every authored surface | 4.54 → 6.90 | ok |
| `tone.text.danger` on its own tint, through hover and press | 3.31 → **4.66** | 3.64 → **4.75** |
| `tone.text.danger` on a surface, through the quiet states | 3.96 → **5.90** | ok |
| `tone.text.warning` on every authored surface | 4.37 → **7.98** | ok |
| `tone.text.warning` on its own tint, through hover and press | 3.33 → **5.59** | ok |
| `tone.text.success` on its own tint, through hover and press | 3.41 → **5.42** | 4.14 → **4.81** |
| `danger` in the error fills (the invalid-field placeholder) | 4.13 → **6.08** | ok |
| on-colour on its strong fill, through the filled states | 3.16–3.68 → **4.65–4.95** | 3.67 → **4.51** |
| the detail role on the surfaces it is permitted on | 2.84 → **3.16** | ok |
| the wall the light makes legible on an empty mark's well | — → **3.60** | — → **4.08** |
| the focus indicator (outer and inset, over every fill) | 4.53 → **6.90** | ok |

Compositions passing, out of the contract's full matrix: **light 52/57 → 57/57**, **dark 52/57 →
57/57**.

## What was rejected, and what it cost

Each alternative was measured with the same contract, so the numbers below are the same numbers the
gate uses.

- **Washing the tints out instead (A2).** The other variable in a tinted label's contrast is the
  tint's own opacity: a *lighter* tint leaves more room. The maximum tint opacity that keeps a 4.5:1
  label on every surface a tonal control can sit on is **0.080** for primary, **0.070** for danger,
  **0.060** for warning and **0.085** for success — against the authored 0.12 and 0.09. Adopting
  that would have made a primary tonal button's fill 8% of the accent and a danger badge's 6%: the
  tonal family would have stopped reading as a tinted surface at all, and it is a *maximum* with no
  headroom. Rejected: it solves the metric by removing the thing being measured.
- **Neutral labels on tinted surfaces (A3).** §10 already says "the mark lands on the surface and the
  icon; the copy stays at its normal emphasis", and `Alert` does exactly that. Applied everywhere it
  would give every tonal button, badge and primary card an `ink` label — 11:1 and up, and no palette
  change at all. Rejected for *character*, not for correctness: the coloured label is what makes a
  tonal control read as "this action is the destructive one" at a glance, and flattening it is a
  bigger change to the visual language than one step of accent lightness.
- **Calming the state steps instead of deepening the accents.** The press step on an opaque fill is
  the single thing that forces the accents furthest: a 26% veil of the on-colour costs about 40% of
  the label's contrast, so the fill has to be deep enough to survive it. Softening the steps
  (`filled` 0.18/0.26 → 0.10/0.14, `tonal` 0.09/0.15 → 0.07/0.10, `quiet` 0.05/0.09 → 0.05/0.07)
  measured out to **light primary 0.449, primary-strong 0.490, warning 0.466, success 0.441; dark
  primary-strong 0.660** — i.e. it keeps the *fills* and the chroma much closer to what was authored,
  at the cost of the interaction feedback. Rejected: the state steps are §11's deliberate language
  for how a control answers, and a press that reads more weakly is a cost paid by every user to
  protect a saturation value. The palette is the axis that changes alone.
- **A role split (semantic *foreground* vs semantic *fill*).** Considered because the brief asked for
  it if a single value could not serve both. It can: the fill needs a slightly deeper value than the
  foreground does (light: fill ≈ 0.40 against foreground ≈ 0.44 for the same role), so the single
  authored value takes the fill's requirement and the foreground simply gains headroom. Three extra
  tokens for a 0.04 difference would be vocabulary that buys nothing. Not introduced.
- **A third text step.** See §10 of the design language: measured against the lightest surface a
  component composites over, a 4.5:1 neutral has to sit at or below L 0.518, and `--sui-ink-muted` is
  already 0.480. There is no room for a third *readable* step, so the dimmest tone became the
  non-text `detail` role instead of a step that measures the same as the one above it.
- **Changing the neutral surface ladder or the elevation lighting** — never on the table: the
  surfaces clear 4.5:1 for both text steps against every fill the library composites, and moving them
  would have re-lit every shadow, highlight and pressed inset for no contrast gain.

## What kept its value

The surfaces (`canvas`, `surface`, `surface-high`, `surface-float`, `surface-overlay`), every
`on-*` colour, `outline`, `scrim`, `edge`, the `--sui-light-*` pair, the rest of the elevation
ladder, the glass family and the code well are exactly as they were. `elevation-well` is the one
rung that was added — the well of an empty selection mark — and `--sui-code-comment` was retuned in
both themes so the published syntax palette clears 4.5:1 on the code well. `focus` and `primary`
are the same value in each theme, as they were, and `primary-strong` stays one step deeper than
both.
