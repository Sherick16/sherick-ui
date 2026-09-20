# Palette proposal — the pre-release contrast gap

**Status: proposal, awaiting a decision. Nothing in this document is implemented.** The authored
palette in `packages/ui/src/styles/tokens.ts` is the design system's shared colour authority, so
closing the contrast gap is a palette decision rather than a component fix. This document is the
review artifact for that decision: it records the measured failures, the proposed resulting palette
for both themes, the pairings behind every value, and the credible alternative directions.

The alternative directions are stated at the end. The recommendation is
[**A1 + L-a**](#recommended-direction-a1--l-a): deepen the four light-mode accents a step and retire
the below-AA third text step.

---

## 1. What is failing, and what is not

These are measured from the **published** tokens (`dist/theme.css`) by `bun run test`, which now
carries the contrast contract as an executable check over both themes. The check is exact in both
directions: a new failing pairing fails it, and a recorded pairing that starts passing fails it too.
The eight entries below are the entire recorded gap
(`packages/ui/scripts/smoke-package.mjs` → `recordedContrastGaps`).

| # | Theme | Pairing | Requirement | Measured (worst surface) |
| --- | --- | --- | --- | --- |
| 1 | light | `text.low` (`--sui-ink-faint`) on every authored surface | 4.5:1 text | **2.84:1** (engaged field) |
| 2 | light | `tone.text.primary` on `tone.tonal.primary` / `tone.soft.primary` | 4.5:1 text | **3.87:1** (engaged field) |
| 3 | light | `tone.text.danger` on `tone.soft.danger` | 4.5:1 text | **3.96:1** |
| 4 | light | `tone.text.warning` on `tone.soft.warning` | 4.5:1 text | **3.91:1** |
| 5 | light | `tone.text.success` on `tone.soft.success` | 4.5:1 text | **4.04:1** |
| 6 | light | `danger` / `warning` copy on a nested or engaged surface | 4.5:1 text | **4.37:1** (warning) |
| 7 | light | `danger` on the invalid field's own fill (the error placeholder) | 4.5:1 text | **4.13:1** |
| 8 | dark | `text.low` (`--sui-ink-faint`) on every authored surface | 4.5:1 text | **3.62:1** |

Everything else in the contract passes, in both themes: `text.high`, `text.medium`, every
`on-*`/strong-fill pair, the selected mark on its selection tint, and the focus indicator on every
surface.

**Dark mode is otherwise clean.** Its only text failure is the third text step (#8); its accents,
tints, filled controls and focus treatment all meet AA today.

### What the automated gate could not see

`@axe-core/playwright`'s `color-contrast` rule is excluded from the browser scan because of this
gap, and it would not have found all of it anyway: **axe does not evaluate `::placeholder` text**.
The one shipped placeholder failure (#7) was invisible to it, and to any scan that relies on it.
That is the reason the contract is now measured from the tokens rather than inferred from a scan.

### Non-text contrast, for the record

`selectable.rest` (`--sui-surface-high` at 0.72 over the canvas) is the resting fill of the whole
selection family — a checkbox box, a radio circle, a switch track, a toggle track, a slider groove
— and it measures **1.09–1.19:1** against the surface around it, with the recessed inset shadow
carrying the rest of the boundary. WCAG 1.4.11 asks 3:1 of the visual information that identifies a
component. This is a *structural* question rather than a palette-value one — closing it means either
a resting boundary (a new structural role, which §8 of the design language currently forbids) or an
explicit recorded decision that tone plus the recessed light is the identifying cue. **It is
deliberately left out of the palette table below** so that it is not closed by accident with a colour
change; it needs its own decision.

---

## 2. Root causes

The gap has three causes, and only the first two are palette values.

1. **A tinted surface is lighter than the ink that labels it, but not lighter enough.** A tonal
   control's label is its own accent laid over a 9–12% tint of itself. Raising the tint's opacity
   makes the surface *closer* to the label, so the contrast falls; the only workable direction is a
   deeper accent (or a tint so light it stops being a tint). Measured: the maximum tint opacity that
   keeps a 4.5:1 label on the canvas is **0.080** for `primary`, **0.070** for `danger`, **0.060**
   for `warning` and **0.085** for `success` — against the authored 0.12 and 0.09.
2. **The light-mode accents sit just above the AA floor as foregrounds on their own tint.** All four
   are within 0.5 of the 4.5 requirement on the canvas and below it on every `surface-high`-based
   step. The design's own intent (a *soft*, quiet light theme) is in tension with using a mid-lightness
   accent as a text colour, and the tension resolves only by deepening the accent.
3. **A third text step cannot exist at this surface range.** The dimmest text step is measured
   against the lightest surface a component composites over. At the authored surfaces a 4.5:1
   neutral foreground must be at or below **L 0.518** in light mode, while `text.medium` is already
   at **0.50** — so the third step's AA value collapses into the second one. The ladder is a
   two-step text ladder in effect; the third value is a below-AA furniture tone.

---

## 3. Proposed resulting palette — light

The proposed palette is *complete*: every token is listed, changed or not, so the resulting system
can be read as a whole. Roles, pairings and ratios for the changed values are in the tables that
follow.

### 3.1 Changed values

| Token | Role | Current | Proposed | Pairings that matter | Current → proposed | WCAG target | Why |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `--sui-primary` | interaction and priority; the accent a tonal control's label and a link take | `0.52 0.17 255` `#0267c7` | **`0.480 0.158 255` `#005bb3`** | on `primary` 12% over canvas / matte card / table / acrylic | 4.27 → **5.01** (canvas), 4.46 → 5.23 (card), 3.87 → 4.53 (worst) | 1.4.3 AA, 4.5:1 | The tonal-button, tonal-icon-button, badge and card labels are `primary` on a 12% tint of itself: 3.87–4.56:1 today. Chroma is trimmed from 0.17 to 0.158 only because a deeper blue cannot hold 0.17 in sRGB. |
| `--sui-primary-strong` | the one opaque accent fill that marks priority; the selected fill of a switch, checkbox and segmented control; the slider range | `0.49 0.19 257` `#005ac8` | **`0.445 0.158 257` `#0050a9`** | `on-primary` on it | 6.12 → **7.43** | 1.4.3 AA, 4.5:1 | `primary-strong` must stay *deeper* than `primary` or the filled control and the tonal label invert their relationship. It follows `primary` down and gains headroom for its near-white label. |
| `--sui-focus` | the focus indicator, one ring language for the library | `0.52 0.18 255` `#0066cd` | **`0.480 0.158 255` `#005bb3`** | the 2px ring against every surface | 4.53 → **5.39** (worst) | 1.4.11, 3:1 | The ring is authored as the accent at its own lightness, so it follows `primary`. It was already well above 3:1; this keeps the ring and the accent visibly one family. |
| `--sui-danger` | destructive/error state of data or task | `0.54 0.17 25` `#bd3838` | **`0.500 0.17 25` `#b02a2d`** | on `danger` 9%; on a nested/engaged surface; on the invalid field's 0.075/0.13 fill | 4.38 → **5.15** (canvas), 3.96 → 4.64 (worst), 4.13 → **4.82** (invalid fill) | 1.4.3 AA, 4.5:1 | A destructive `Menu` row, a danger `Badge` and a danger tonal `Button` all carry their label in `danger` over a danger tint, and the invalid field's own placeholder is `danger` over the invalid fill. Both directions were short. |
| `--sui-warning` | caution state; never decoration | `0.53 0.13 75` `#965e00` | **`0.490 0.100 75` `#815709`** | on `warning` 9%; on a nested/engaged surface | 4.33 → **5.09** (canvas), 3.91 → 4.59 (worst) | 1.4.3 AA, 4.5:1 | Same pairing as `danger`, and it was the worst of the four. Chroma drops 0.13 → 0.100 because that is all the sRGB gamut holds at this lightness; the hue and the "amber, not orange" character are unchanged. |
| `--sui-success` | confirmation state | `0.50 0.12 160` `#00774b` | **`0.468 0.105 160` `#036c45`** | on `success` 9%; on a nested/engaged surface | 4.47 → **5.18** (canvas), 4.04 → 4.67 (worst) | 1.4.3 AA, 4.5:1 | Same pairing. Chroma drops 0.12 → 0.105 for gamut, as with `warning`. |
| `--sui-ink-faint` | the third emphasis step — furniture: code line numbers, gutters, hints, token names | `0.63 0.016 258` `#838a93` | **`0.510 0.016 258` `#60676f`** | on every authored surface | 3.16 → **5.19** (canvas), 2.84 → 4.66 (worst) | 1.4.3 AA, 4.5:1 | The step is used as text (`CodeBlock`'s line numbers) and measured 2.84–3.4:1. See [§5](#5-the-third-text-step) — the *value* here is only useful together with a decision about the *step*. |

### 3.2 Unchanged values

| Token | Value | Role | Why it stays |
| --- | --- | --- | --- |
| `--sui-canvas` | `0.965 0.008 255` `#f0f4f9` | the page itself | `ink` 13.17:1, `ink-muted` 5.42:1, `primary` 5.06:1. Moving it would re-tune every surface relationship and every elevation composite. |
| `--sui-surface` | `0.985 0.006 255` `#f7fafe` | matte surface separated by tone alone (cards, panels) | 0.42/0.78 composites all clear AA for the two AA text steps. |
| `--sui-surface-high` | `0.925 0.014 255` `#e0e7f0` | the second matte step; the field/control fill | Ditto. This is the step that binds the third text step's threshold; that is addressed by the ladder decision, not by flattening the surfaces. |
| `--sui-surface-float` | `0.992 0.006 255` `#fafdff` | the acrylic sheet's own tone | Ditto. |
| `--sui-surface-overlay` | `0.993 0.005 258` | the viewport-owning acrylic sheet | Ditto. |
| `--sui-ink` | `0.245 0.018 260` `#1b2129` | labels and values | 13.17:1 at worst on every authored surface. |
| `--sui-ink-muted` | `0.50 0.018 260` `#5d646e` | supporting copy | 4.87:1 at worst — passes, and stays the reference for "supporting copy". |
| `--sui-on-primary` / `-danger` / `-warning` / `-success` | `0.985 0.005 255` | the near-white copy on an opaque semantic fill | 5.16:1 at worst today and 6.11:1 at worst after the accent deepening. Unchanged; the fills moved instead. |
| `--sui-primary-soft` | `0.91 0.035 255` `#d2e3f9` | a de-emphasised tinted surface | No shipped component consumes it (the showcase's foundation swatch does). Unchanged. |
| `--sui-accent` | `0.62 0.10 215` `#2695ac` | the secondary hue for supporting emphasis | No shipped component consumes it as a foreground; it appears in the showcase's ambient gradient. Unchanged. |
| `--sui-outline` | `0.50 0.018 260` `#5d646e` | an unreferenced neutral boundary value | Nothing reads it. Unchanged, and flagged as a candidate for removal rather than retuning. |
| `--sui-scrim` | `0.16 0.01 260` `#0b0d12` | the plane behind a viewport-owning surface | Not text; the scrim separates rather than informs. Unchanged. |
| `--sui-edge` | `0.42 0.02 258` `#464e58` | the hairline tone every structural line draws from | Structural joins (row separators, dividers, the rule under a header) are not components or states, so 1.4.11 does not apply; the role is unchanged. |
| `--sui-light-top` / `--sui-light-bottom` | `1 0 0` / `0.32 0.02 256` | the elevation pair every shadow, highlight and pressed inset composites from | Not colour roles; the shadow ladder is contrast-neutral. Unchanged. |
| elevation, glass, overlay-fill, code-* | — | the physical language and the code well's syntax palette | Unchanged. The `code-*` tokens are authored for the code well and were re-checked against it. |

---

## 4. Proposed resulting palette — dark

Dark mode needs **one value changed**.

| Token | Role | Current | Proposed | Pairings | Current → proposed | Target | Why |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `--sui-ink-faint` | the third emphasis step — furniture | `0.60 0.014 256` `#7b8189` | **`0.660 0.014 256` `#8d939b`** | every authored surface | 4.20 → **5.31** (canvas), 3.62 → 4.60 (worst) | 1.4.3 AA, 4.5:1 | Same root cause as light #1. In dark mode the step *can* stay distinct: the AA threshold is 0.655 against the engaged field and `ink-muted` is 0.76, so the ladder keeps three visibly different steps (0.94 / 0.76 / 0.66). |

Everything else in dark mode already passes and is proposed unchanged: `canvas 0.205 0.012 260`
(`#14171d`), `surface 0.245 0.014 260`, `surface-high 0.295 0.016 260`, `surface-float 0.27 0.018 260`,
`surface-overlay 0.236 0.012 260`, `ink 0.94 0.008 255` (`#e8ebf1`), `ink-muted 0.76 0.014 255`
(`#abb2ba`), `primary 0.72 0.15 255` (`#5fa7ff`), `primary-strong 0.66 0.18 257` (`#4091fd`),
`danger 0.72 0.13 25`, `warning 0.82 0.12 80`, `success 0.75 0.10 160`,
`on-* 0.205 0.012 260`, `focus 0.72 0.15 255`, `outline 0.76 0.014 255`, `scrim 0.08 0.01 260`,
`edge 0.92 0.01 256`, `primary-soft 0.42 0.055 257`, `accent 0.80 0.08 215`, and the shared
elevation/glass/code values.

---

## 5. The third text step

This is the one part of the proposal that is a *language* decision rather than a value change, and
it needs to be taken explicitly.

The measured thresholds, in light mode, for a neutral foreground to clear 4.5:1:

| Surface a component composites over | Foreground must be at or below |
| --- | --- |
| canvas | L 0.543 |
| matte card (`surface` 0.78) | L 0.554 |
| quiet well (`surface` 0.42) | L 0.549 |
| code well / table (`surface-high` 0.72) | L 0.523 |
| field (`surface-high` 0.66) | L 0.525 |
| engaged field (`surface-high` 0.90) | **L 0.518** |
| acrylic sheet (`surface-float` 0.86) | L 0.559 |

`--sui-ink-muted` is already `0.50`, which is *below* every one of those thresholds. So the third
step's AA value is at or above `ink-muted`'s — the two steps cannot both be AA **and** visually
distinct. There are three honest options:

- **L-a (recommended) — the ladder becomes a two-step *text* ladder, and the third value is a
  furniture tone.** Raise `--sui-ink-faint` to `0.510 0.016 258` so the token can never produce a
  violation, keep `text.medium` as the reference for supporting copy, and restate the third role in
  §10 of the design language as non-text furniture (hairlines, the spinner ring, a gutter) rather
  than a text step. `CodeBlock`'s line numbers — the only shipped component that renders the step as
  text — move to `text.medium`. Cost: the visible third step disappears from text altogether; the
  line numbers read at supporting-copy emphasis, exactly like the code's own density.
- **L-b — retire the token as a text role and leave its value below AA.** Nothing else changes; the
  one text usage moves to `text.medium`, and the design language states that the low step is not a
  text step. Cost: a published token that a consumer can still use for text fails AA, and the manual
  record of the gap has to stay.
- **L-c — keep three distinct AA steps by darkening the surfaces underneath them.** Bring
  `--sui-surface-high` down until the third step can sit at, say, L 0.56 and still clear 4.5:1. Cost:
  the surface ladder gets heavier and the light theme loses some of its airiness for a step that one
  component uses. **Not recommended.**

---

## 6. Relationships between the proposed colours

- **`primary` → `primary-strong` → `focus` move together.** The three are one family at three
  depths: the accent a label takes on a tint, the opaque fill that marks priority, and the ring. If
  `primary` deepens alone, a filled control and a tonal label invert their lightness relationship
  and the focus ring drifts a step lighter than the accent it belongs to. All three are proposed at
  the same lightness (`0.480`), with `primary-strong` a further step down (`0.445`) so the fill stays
  the deepest of the three.
- **The four accents stay one "depth" of colour.** `primary`, `danger`, `warning` and `success` are
  proposed within 0.03 of each other in lightness (0.468–0.500), which is how they sit today
  (0.50–0.54). They remain distinguishable by hue and chroma, not by one of them being visibly
  heavier than another.
- **`warning` and `success` lose chroma, not position.** Their proposed lightnesses cannot hold 0.13
  and 0.12 inside sRGB, so they drop to 0.100 and 0.105. The result is the same amber and the same
  green, slightly less saturated; without the trim they would clip in the browser and measure worse
  than they read here.
- **The neutral ladder is untouched.** `ink`, `ink-muted`, `edge`, `outline`, `scrim` and the four
  surfaces keep their values, so the visual hierarchy between surfaces and foregrounds — which the
  light theme's character depends on — is preserved exactly. Only the *accent* family moves, and it
  moves as a family.
- **`on-*` colours stay put.** Deepening a fill only ever improves the near-white copy on it
  (5.16 → 6.11 at worst), so the `on-*` values do not need to follow.
- **The elevation ladder is unaffected.** No `--sui-light-*`, `--sui-elevation-*` or `--sui-glass-*`
  value changes, so every shadow, highlight, pressed inset and acrylic sheet renders identically.
- **`--sui-danger` is now also the invalid field's placeholder tone** (see §7), so the error
  placeholder, the error message and the invalid field's tint are one hue at three strengths rather
  than two hues and a faded copy.

---

## 7. Already fixed in this pass, and independent of this decision

Two contrast failures were **not** palette values and have been fixed in the working tree, because
the correct existing semantic token already existed:

1. **The invalid field's placeholder** (`material.controlError`) mixed `--sui-danger` at 72%
   opacity. A placeholder is text, and a partial opacity of an accent is a different colour from the
   accent: it measured **2.81–3.04:1** light and **3.41–3.86:1** dark. It now uses the token whole,
   which measures **4.13–4.68:1** light and **5.16–6.16:1** dark. It closes fully (#7) when the
   proposed `danger` lands, and it is the failure the axe scan structurally cannot see.
2. **`Tabs`** let a tab row that could not fit its container widen the page (WCAG 1.4.10 Reflow:
   320 CSS px produced a 404px document). The tab row now owns its own horizontal overflow, the way
   `Table` owns its grid and `CodeBlock` owns its own scroll, so a consumer needs no wrapper to know
   about. No visual change at any width where the row fits.

---

## 8. Alternative directions

**A1 — deepen the four light accents (recommended).** Table §3.1. The tints keep their authored
opacity, so the tonal/soft family keeps its quiet weight, and the accent moves by one step of
lightness (0.52 → 0.48 for `primary`, 0.54 → 0.50 for `danger`, and so on). Cost: the light theme's
blue, red, amber and green become slightly deeper; links, focus rings, tonal labels, chips and
status marks all shift together. No structural or layout consequence.

**A2 — keep the hues and lighten the tints instead.** The tint opacity is the other variable in the
pairing. Measured maxima that keep a 4.5:1 label by tint alone: `primary` 0.12 → **0.080**,
`danger` 0.09 → **0.070**, `warning` 0.09 → **0.060**, `success` 0.09 → **0.085**. Cost: a 12% accent
tint becomes an 8% one and a 9% becomes a 6% — the "de-emphasised tinted surface" family very nearly
stops being visible, `tone.soft` alerts and badges lose most of their tone, and a primary tonal
button reads as a grey button. It also leaves nothing on the table for any later surface tweak,
because those are *maxima* with no headroom. **A1 and A2 can be combined** (a smaller accent step
plus a small tint reduction), which is the direction to take if A1's deepening reads as too heavy.

**A3 — keep the hues and the tints, and put the copy at `text.high`.** §10 of the design language
already says "the mark lands on the surface and the icon; the copy stays at its normal emphasis".
`Alert` implements exactly that (it overrides the soft tone's label with `ink`), so this is not a new
rule — it is the existing rule applied consistently. On this direction `tone.soft.*` and
`tone.tonal.*` keep their hue for the *fill*, the icon, the border and the strong fill, and the label
becomes `ink` (12.4:1 on a 12% tint). Cost: the tonal-button family, the badges and the primary card
lose their coloured label and read neutral-with-a-tinted-fill; that is a larger change to the
character of the tone hierarchy than a lightness step, which is why it is not the recommendation.

**A4 — do nothing and keep the recorded gap.** The gap is already documented (§14 of the design
language, `RELEASE.md`) and consumers can retune `--sui-primary` / `--sui-ink-faint` at the document
root. Cost: the `color-contrast` exclusion stays, every tonal label in light mode is below AA, and
this is a known blocker for a stable `2.0.0`.

---

## 9. If the proposal is accepted

The change is small in code and broad in review surface:

1. `packages/ui/src/styles/tokens.ts` — the eight values above (seven in light, one in dark).
2. `packages/ui/scripts/smoke-package.mjs` — delete `recordedContrastGaps` entirely; the contrast
   contract then has no allowances.
3. `apps/showcase/tests/browser/accessibility.spec.ts` — remove the `.disableRules(["color-contrast"])`
   exclusion and let axe enforce the rule across every scanned state, including the open overlays.
   One specimen has to be dealt with first: the showcase's *foundation* tile labelled `Disabled` is a
   static `<div>` demonstrating the disabled step (`state.disabled`, 45% opacity) rather than a
   disabled control, so axe reports its copy at 2.61:1. It is a workbench specimen, not shipped UI;
   it needs to be marked as the disabled specimen it demonstrates (or kept out of the scan) before
   the exclusion can go.
4. `docs/DESIGN_LANGUAGE.md` §14 — replace the "Known contrast gap" section with the resulting
   ladder, and §10/§15 with the resolved values; `docs/RELEASE.md` — remove the recorded limitation.
5. Re-record the deterministic style contract (`bun run visual --update`), which pins the token
   blocks; the browser visual baselines of the core and dialog fixtures will need review and
   re-approval, because the accents and the third text step change in both.
6. `packages/ui/scripts/bundle-budget.json` — no change expected (no class or module changes).
7. Re-run `bun run verify`.

## 10. What this proposal does not touch

Layout, spacing, component anatomy, shape, elevation, the acrylic recipes, the motion system, the
focus *recipes* (only the `--sui-focus` value), the semantic role assignments, and the
`--sui-surface-*` ladder. The third text step (L-a) is the only role whose *description* changes.
