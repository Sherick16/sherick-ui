# The palette

**Decided and implemented.** This is the record of the semantic palette: the values, the roles they
answer to, the compositions that constrained them, and the alternatives that were measured and
rejected. The rules that consume these values are [`DESIGN_LANGUAGE.md`](DESIGN_LANGUAGE.md) §10 and
§14; the values themselves live in `packages/ui/src/styles/tokens.ts`, and they are verified by
`bun run test` against the published `dist/theme.css` (see [`VERIFICATION.md`](VERIFICATION.md)).

## Graphite and iris (current)

**Decided and implemented** in 2.7.0, as the library's visual overhaul. The earlier palette was a
blue-grey family end to end: a navy accent (`0.42 0.14 255`) on blue-tinted neutrals, so every
surface, tint and shadow shared the accent's hue and the page read as one cool wash with weak
figure/ground. A warm "paper and ultramarine" palette was drafted first and rejected on review: the
warm neutrals read as yellowed beside a cool accent. The overhaul separates the two jobs colour does:

- **Neutrals are graphite.** Canvas, sheets, ink, rims and the shadow umbra sit at hue 285 with
  chroma under 0.015 — they read as true greys, but they share the accent's family instead of
  pulling against it. Sheets are white, and the card separates from the canvas by tone alone.
- **One vivid accent.** `primary` is an iris violet (hue 292, chroma 0.205), the most saturated value
  the filled press veil allows at that lightness. In dark it is a luminous lavender fill with
  graphite labels.
- **Containers are quiet.** The soft and selected steps keep their designed, opaque role (below) at
  low chroma, so an alert or a badge is a tint rather than a pastel block.
- **A puck surface.** `--sui-puck` is the brightest surface in both themes, for a choice held in a
  track (see DESIGN_LANGUAGE §5). In dark mode no sheet tone can play that part, because a lifted
  object is lighter there and every sheet sits below the track that holds it. It is a contract
  surface: both text roles, every semantic foreground and the detail role are measured on it.

| Token | Light | Dark |
| --- | --- | --- |
| `--sui-canvas` | `0.970 0.003 290` | `0.160 0.006 285` |
| `--sui-surface` | `0.998 0.001 290` | `0.200 0.008 285` |
| `--sui-surface-high` | `0.934 0.006 290` | `0.252 0.010 285` |
| `--sui-tray-deep` | `0.900 0.008 290` | `0.290 0.011 285` |
| `--sui-surface-float` | `0.999 0.001 290` | `0.226 0.009 285` |
| `--sui-puck` | `1 0 0` | `0.315 0.012 285` |
| `--sui-surface-overlay` | `0.995 0.002 290` | `0.214 0.008 285` |
| `--sui-ink` | `0.200 0.012 285` | `0.950 0.004 285` |
| `--sui-ink-muted` | `0.480 0.014 285` | `0.745 0.010 285` |
| `--sui-detail` | `0.590 0.012 285` | `0.605 0.010 285` |
| `--sui-rim` | `0.625 0.012 285` | `0.535 0.010 285` |
| `--sui-edge` | `0.400 0.012 285` | `0.930 0.006 285` |
| `--sui-light-bottom` | `0.280 0.025 290` | `0.070 0.008 285` |
| `--sui-scrim` | `0.200 0.006 285` | `0.060 0.006 285` |
| `--sui-primary` | `0.490 0.205 292` | `0.780 0.125 292` |
| `--sui-primary-strong` | `0.430 0.200 292` | `0.720 0.160 292` |
| `--sui-focus` | `0.490 0.205 292` | `0.780 0.125 292` |
| `--sui-primary-soft` | `0.952 0.024 292` | `0.300 0.075 292` |
| `--sui-primary-selected` | `0.905 0.052 292` | `0.375 0.105 292` |
| `--sui-danger` | `0.465 0.180 27` | `0.775 0.130 25` |
| `--sui-danger-soft` | `0.952 0.020 30` | `0.260 0.040 25` |
| `--sui-danger-selected` | `0.900 0.042 30` | `0.330 0.062 25` |
| `--sui-warning` | `0.398 0.086 68` | `0.830 0.120 80` |
| `--sui-warning-soft` | `0.955 0.032 82` | `0.260 0.040 75` |
| `--sui-warning-selected` | `0.905 0.058 80` | `0.330 0.060 75` |
| `--sui-success` | `0.390 0.088 158` | `0.780 0.120 158` |
| `--sui-success-soft` | `0.952 0.024 165` | `0.260 0.040 160` |
| `--sui-success-selected` | `0.900 0.046 165` | `0.330 0.060 160` |
| `--sui-on-primary` | `0.990 0.003 290` | `0.160 0.006 285` |

The contract is unchanged in method and in requirement, and every composition clears it in both
themes. The binding compositions are still the filled press veil (light success 4.56, warning
4.59, danger 4.64, primary 4.67; dark primary 4.51) and the rim (3.04 light on a choice row on the
page, 3.22 dark on a choice row in a card), which is why the strong fills and the rim sit where they
do, and why a choice row rests on `matteHigh` rather than the full field tray. `bun run test` prints the full matrix.

The sections below are the decision record for the values this palette replaced. Their method — and
every alternative they rejected — still governs how a value here may change.

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
| the wall the light makes legible on an empty mark's well (superseded by the rim, below) | — → **3.60** | — → **4.08** |
| the focus indicator (outer and inset, over every fill) | 4.53 → **6.90** | ok |

The palette clears every composition the contract measures, in both themes. The matrix has grown
since the original proposal — the `CodeBlock` syntax palette and the namespace token were added to
it — so this record deliberately states no total: `bun run test` prints the exact set it measured.

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
- **Neutral labels on tinted surfaces (A3).** `Alert` already keeps its copy neutral while the
  mark takes the semantic tone. Applied everywhere it
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
rung that was added — the well of an empty selection mark, now its pressed depth (see the rim,
below) — and `--sui-code-comment` was retuned in
both themes so the published syntax palette clears 4.5:1 on the code well. `focus` and `primary`
are the same value in each theme, as they were, and `primary-strong` stays one step deeper than
both.

## The soft and selected surfaces (container role)

**Decided and implemented** after the [visual audit](visual-design-system-audit.md) (finding A2).
The foregrounds above stayed exactly as they are. What changed is where a *tinted surface* gets
its colour.

Before, every soft and selected surface was an alpha of its role's foreground:
`bg-<role>/[0.09–0.12]` for soft, `bg-<role>/[0.22]` for selected. Once the foregrounds were
deepened for text contrast, those fractions lost their hue. The light warning soft surface
rendered as a warm grey that read as neutral, success as grey-green, and selection as a dusty
steel blue. In dark mode the warning and danger badges resolved to nearly the same grey-brown.

The fix is a designed container per role, authored in both themes and consumed by `tone.soft`,
`tone.tonal` and `tone.selected`:

| Token | Light | Dark |
| --- | --- | --- |
| `--sui-primary-soft` | `0.91 0.035 255` → **`0.920 0.035 255`** | `0.42 0.055 257` → **`0.325 0.050 257`** |
| `--sui-primary-selected` | **`0.860 0.055 255`** | **`0.400 0.075 257`** |
| `--sui-danger-soft` | **`0.930 0.030 18`** | **`0.315 0.050 22`** |
| `--sui-danger-selected` | **`0.870 0.050 18`** | **`0.395 0.070 22`** |
| `--sui-warning-soft` | **`0.940 0.045 85`** | **`0.320 0.045 78`** |
| `--sui-warning-selected` | **`0.885 0.070 82`** | **`0.400 0.065 78`** |
| `--sui-success-soft` | **`0.935 0.037 155`** | **`0.315 0.045 160`** |
| `--sui-success-selected` | **`0.875 0.055 155`** | **`0.395 0.065 160`** |

`--sui-primary-soft` was already published and had no consumer; it now has one. The containers
are opaque, so a tone reads the same on the canvas, in a card and on an acrylic sheet, and the
contract no longer needs to measure a tint over each surface: it measures the label, `ink`, the
selection mark and the focus ring against the container itself, through the tonal states.

This is not the role split rejected above. That proposal separated a role's *foreground* from its
*strong fill* for a 0.04 lightness difference. The container is a third, different surface — the
thing a tint used to approximate — and the difference it makes is hue, not lightness.

**Dark semantic containers are tints.** In dark mode the danger, warning and success soft
steps sat at lightness 0.29–0.30 and read as slabs beside the neutral Alert. They are now lightness 0.26
with chroma 0.040 (hues 25, 75 and 160), and their selected steps lightness 0.33 with chroma 0.060–0.062.
Against the dark surface a soft container measures 1.15–1.18:1, so it reads as a tint; its selected step
sits 1.25–1.29:1 above the soft step; `ink` on a soft step measures 13.2–13.6:1, and the role's own text
measures 7.3–9.2:1 on it. The light values are unchanged. The contrast contract passes with no allowlist.

The field error ladder no longer composites `danger` over the field: an invalid field keeps its
well and turns its rim to the danger tone (see below).

## Fields without a line (2.8.0)

**Decided and implemented** in 2.8.0. The baseline gave every text field a 3:1 underline, and a form
read as a stack of ruled inputs. WCAG 1.4.11 asks for 3:1 only from the visual information that is
*required* to identify a control; a text field is identified by its label and by its value or
placeholder and its parts, so it needs no 3:1 edge. Fields now draw no line: the tray is opaque
`surface-high` (1.21:1 light and 1.17:1 dark against the card, up from the 60% tray's 1.12 and
1.08), and the pointer and engagement sink it to the new `tray-deep` step, with the focus ring as
the engagement signal. An invalid field is the danger soft surface at full strength. The rim stays
on the hollow controls that hold no content — the drop target and empty checkboxes and radios — and
the `rim` composition now also covers an empty mark on a resting choice row.

| Composition | Light | Dark |
| --- | --- | --- |
| `text.medium` on an engaged field (`tray-deep`) | **4.86** | **6.23** |
| `tone.text.danger` on the danger tray | **6.62** | **6.73** |
| an empty mark's rim on a choice row | **3.04** | **3.22** |

## The rim (hollow controls)

**Decided and implemented** with the Checkbox and RadioGroup redesign. A text field, the file drop
target and an empty checkbox or radio have no content that identifies them, and the 3:1 their
boundary needs was out of reach of every borderless treatment measured:

- **the neutral fill ladder** — the tightest step measures about 1.3:1 against the surface around
  it, and a fill dark enough to reach 3:1 is a mid-grey box (the `detail` tone measured 3.57–4.54),
  which read as a filled control rather than an empty one;
- **depth** — the identifying wall of the old `elevation-well` cleared 3.60 / 4.08, but on a 20px
  mark the shading it took made the mark read as a lit orb rather than a socket, and in dark mode no
  colour darker than the card can reach 3:1 against it at all (black measures about 1.3:1).

So each hollow control carries one rim in a dedicated `rim` token, tuned to clear 3:1 against every
surface a control sits on by a small margin and no more. At `detail` strength (3.57 / 3.83) the rim
outshone the labels beside it.

| Token | Light | Dark |
| --- | --- | --- |
| `--sui-rim` | **`0.630 0.016 258`** | **`0.555 0.014 256`** |

| Composition | Light | Dark |
| --- | --- | --- |
| a hollow control's rim, worst surface | **3.16** (canvas) | **3.18** (dense acrylic) |
| an invalid field's danger rim | ok | ok |
| a selected mark's accent fill against the card | **8.80** | **7.02** |

Fields themselves are canvas-toned wells (`material.control`), below the card in both themes, so
the rim rather than the fill separates them; the placeholder and danger texts are measured on that
well, at rest and engaged.

## The code well

**Decided.** A code well was the canvas at 28% over its card. That composite measured
1.02:1 against the card in both themes, so a code block read as part of its card, and only its Prism
colours marked it as code. The well is now the `matteHigh` step over the card (`surface-high` at 72%), so
it reads as a recess, with the `recessedTop` wall as the second cue.

| Composition | Light | Dark |
| --- | --- | --- |
| the card against the well (was 1.02 in both themes) | **1.13** | **1.11** |
| the code text on the well | 13.05 | 12.49 |
| the comment role on the well | 4.77 | 5.28 |
| the namespace token (text at 0.7) on the well | 5.25 | 6.77 |

The tonal separation is modest by design: a solid `surface-high` fill separates a little more (1.19 light,
1.16 dark), but its comment role falls to 4.54:1 in light, so the translucent step keeps the margin.
`scripts/contrast-contract.mjs` still measures the old `canvas` at 28%. `recipeAlphas.code.well` now
carries the published alpha, so that composition should be read from it.
