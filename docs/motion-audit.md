# Motion audit

**Status:** analysis and recommendations only. No motion recipe, token or component was changed
in this pass. [`DESIGN_LANGUAGE.md`](DESIGN_LANGUAGE.md) §12 and `ui.motion.ts` remain the
authority; any rule adopted from this audit is written there first. It is the companion to the
[visual design-system audit](visual-design-system-audit.md).

## Scope and method

- **Baseline:** branch `docs/visual-design-system-audit` at `4f3f6c4` (package 2.3.0), which includes
  the visual-audit batches.
- **Source:** `ui.motion.ts`, the timing tokens in `tokens.ts`, the Tailwind keyframes in
  `scripts/tailwind.internal.cjs`, and every component's use of the motion recipes.
- **Measured, not inferred.** A production build of the showcase was driven with Playwright
  (Chromium, 1440px) while a `requestAnimationFrame` sampler recorded, every frame, each target's
  computed opacity, transform, box, background and shadow (and `::before` for state layers). The
  numbers below are from those traces:
  - **Settle** is the time from the first change to the last change.
  - **Progress at 25/50/75%** is how far the value had travelled at those fractions of the settle
    time. It shows a curve's shape: 0.25/0.50/0.75 is linear; 0.82/0.94/0.99 is strongly front-loaded.
- **What was sampled:**
  - every overlay's entrance and exit: Select, Menu, Popover, Tooltip, Dialog with its scrim,
    Drawer, CommandPalette, Toast and the toast stack;
  - Button hover, press and release, and taps of 60, 100, 150 and 250ms;
  - press displacement on five controls of different widths;
  - Switch, Checkbox, Radio, Tabs, SegmentedControl, Chip, Pagination, Slider keyboard steps and
    field focus;
  - Accordion open and close, TreeView expansion and Menu keyboard highlight;
  - a theme switch, the activity loops, and reduced motion.
- **Limits:**
  - Headless frame timing is coarse (about 16ms), so values are ±1 frame.
  - Reduced-motion measurements on the showcase reflect the showcase's own host reset
    (`transition-duration: 0.01ms`), so the library's reduced-motion rules were checked from source
    and `motion.spec.ts`, not from those traces.
  - Performance (frame drops on low-end hardware) was not measured.

---

## 1. Current motion language

### What is already strong

The motion system is the most rigorously specified part of Sherick UI, and the traces confirm most
of it behaves as written:

- **Intent, not duration.** Components choose `feedback`, `tactile`, `arrive`, `orient`,
  `relocate`, `direct`, `disclose`, `presence` or `activity`. No component writes a duration or a
  curve, and `bun run test:motion` enforces it. This is the right architecture, and it makes every
  recommendation below a change in one place.
- **Entrance and exit are asymmetric, as they should be.** Every overlay enters in 230–260ms on the
  glide curve and leaves in about 150–170ms on an accelerating exit curve. No exit was truncated or
  replayed. Re-opening a kept-mounted Select replays its entrance correctly.
- **Side-aware presence.** Anchored surfaces grow 0.94 → 1 and travel 4px toward their anchor
  (−4px below, +4px above, sideways for inline sides) from Base's resolved side and origin.
- **The spring is reserved.** Only checkbox and radio marks overshoot: 0.5 → 1 in 200ms with about
  a 5% overshoot. Everything else lands without overshoot: switch thumbs, tab indicators, sheets
  and toasts.
- **One spatial owner per node, and direct manipulation is never interpolated.** A dragged slider
  handle drops its positional transition; a keyboard step (58px) settles in about 170ms.
- **Presence belongs to Base.** There are no local exit timers.
- **Reduced motion keeps state and drops travel** (checked in source and `motion.spec.ts`).
- **Tooling is unusually good:** a motion lab at `/verification/motion` with slow and reduced
  speeds, and 25 motion browser tests.

### Where the language breaks down

The *vocabulary* is complete. What is missing is **calibration** — how long, how far and how
strongly each intent should act as the size of the thing changes — plus a few places where the
vocabulary was not applied at all:

- **Durations ignore distance.** Four interaction durations serve every size of movement, so 4px
  and 448px of travel get the same time.
- **Press amplitude is a percentage.** A fixed 4% squash moves a wide control's edges up to 12px.
- **The press leg is slower than a tap**, so the most common interaction often gets no tactile
  feedback at all.
- **Three presences skip the system entirely:** the scrim, TreeView expansion, and a determinate
  Progress value.
- **Some behaviour is governed by Base defaults rather than the language:** tooltip delay, and the
  pace of the spinner and skeleton loops.

---

## 2. Findings

Each finding records what was measured, why it matters, the cause, the recommended change and what
it affects. Confidence is about the diagnosis.

### A. Foundations (`ui.motion.ts`, timing tokens)

#### A1. The modal scrim snaps on and off — high confidence

- **Measured.** Across Dialog, Drawer and CommandPalette, open and close, the backdrop's opacity
  was 1 on every sampled frame. The surface above it fades and rises over 250ms while a 38% dark
  wash and a 6px blur appear across the whole page in one frame, and vanish in one frame on close.
- **Why it matters.** The scrim is the largest area of change in the whole library. A full-page
  jump in tone and focus is the most visible motion defect found, and it contradicts §7 ("the
  scrim separates it from the page") and the `presence` intent, which lists the scrim explicitly.
- **Cause.** `motionPresenceScrim` declares `transition-opacity` and the timing, but no
  `data-[starting-style]:opacity-0` or `data-[ending-style]:opacity-0`. There is nothing to
  transition from or to. `motion.spec.ts` asserts the scrim's transition property and duration, not its painted opacity.
- **Recommendation.** Give the scrim the same start and end states as every other presence
  (opacity 0 at both ends), and keep the opacity fade under reduced motion. Add a browser
  assertion that samples the scrim's painted opacity mid-entrance.
- **Affects:** `motionPresenceScrim`, Dialog, AlertDialog, Drawer, CommandPalette,
  `motion.spec.ts`. **Small.**

#### A2. A quick tap gets no tactile feedback — high confidence

- **Measured** (filled Button, pointer already resting on it):

  | Hold | Deepest scale (target 0.96) | Peak press layer (target 0.26) |
  | --- | --- | --- |
  | 60ms | 1.000 (none) | 0.18 (hover level only) |
  | 100ms | 0.967 | 0.25 |
  | 150ms | 0.960 | 0.26 |
  | 250ms | 0.960 | 0.26 |

  Trackpad taps and brisk clicks routinely last under 100ms.
- **Why it matters.** `tactile` exists to confirm "you pressed this". It is fully visible only on
  deliberate presses and invisible on the fastest ones. Combined with the neutral press step
  (A7), a quick tap on a neutral button produces essentially no response.
- **Cause.** The press leg runs only while `:active` matches and interpolates over
  `--sui-duration-press` (150ms). On release, the release leg starts from wherever the press got
  to. The same 150ms token also paces all non-spatial `feedback` (hover and focus tone).
- **Recommendation.** Split the token: a dedicated `--sui-duration-tactile` of about 70–90ms for
  the press leg (the transform and the press step of the state layer). Leave `duration-press` for
  `feedback` and keep the 200ms release. A shorter press leg reaches visible compression within a
  normal tap and still settles on the existing release curve. Add a browser test that a 60ms tap
  reaches at least half of the target compression.
- **Affects:** `tokens.ts` (one shared token), `motionTactile`, `motionInkPress`,
  `motionStateLayer`, §12, `motion.spec.ts`, every tactile control. **Small–medium.**

#### A3. Press amplitude grows with width — high confidence

- **Measured.** Edge displacement at full press (`scale(0.96)`):

  | Control | Rest size | Each edge moves horizontally | Vertically |
  | --- | --- | --- | --- |
  | Chip "Code" | 69 × 40 | 1.4px | 0.8px |
  | Button md | 87 × 48 | 1.7px | 1.0px |
  | Tab | 191 × 48 | 3.8px | 1.0px |
  | NavItem | 320 × 40 | 6.4px | 0.8px |
  | Select trigger | 580 × 48 | **11.6px** | 1.0px |

- **Why it matters.**
  - `motionTactile` documents its amplitude as "about two pixels at the size of the ink it moves".
    For wide controls it is five to ten times that.
  - The squash is also strongly anisotropic: a full-width Select visibly narrows by 23px while
    barely changing height, which reads as a lurch rather than a press.
  - NavItem is the only collection row that compresses at all. Menu commands, options, tree rows
    and disclosure rows answer with tone only.
- **Cause.** Amplitude is a fixed percentage, and CSS cannot read an element's size to turn a
  distance into a scale.
- **Recommendation.**
  - Replace the single amplitude with **tiers** in `ui.motion.ts`: `tactile` (0.96) for compact and
    content-width controls, and `tactileWide` (about 0.99; roughly 3px per edge at 580px) for
    full-width fields and wide tabs. Choose the tier by the control's role, not by measuring.
  - Remove compression from NavItem, so every row-shaped control answers with tone, as Menu
    commands, options and tree rows already do.
- **Affects:** `motionTactile` (plus a new tier), Select, Combobox, Tabs, NavItem, §11–12,
  `motion.spec.ts` ("a press moves a control by the amplitude its role owns" becomes per tier).
  **Small–medium.**

#### A4. Durations ignore distance — medium confidence

- **Measured.**
  - The Tabs indicator travels **381px in 200ms**; the Switch thumb travels **20px in 200ms**.
  - The Drawer enters **448px in 257ms** and leaves in about 160ms; a Popover enters **4px in 227ms**.
- **Why it matters.** Equal durations over very different distances make large movements feel
  like snaps and small ones feel slow. The long tab travel crosses the track in about four frames
  of visible motion, which is the "teleport" the `ease-glide` comment says it avoids. A full-height
  sheet arriving in a quarter of a second is abrupt next to a dialog of similar size.
- **Cause.** `relocate` and `presence` each have one duration, whatever the travel.
- **Recommendation.**
  - Add two calibrated timings to `ui.motion.ts` rather than per-component overrides: a **long
    relocate** (about 280–320ms) for indicators travelling across a track, and a **sheet presence**
    (about 320ms in, 200ms out) for viewport-edge travel.
  - Keep the current timings for short travel. Document in §12 that duration grows with travel,
    in two steps, not continuously.
- **Affects:** `tokens.ts`, `motionRelocate` (a long variant for Tabs), `motionPresenceSheet`,
  Drawer, Tabs, §12. **Small.**

#### A5. Disclosure closes on an arrival curve — medium confidence

- **Measured.** Accordion open: 0 → 48px, settling in about 180ms, heavily front-loaded (43% of
  the height in the first frame). Close: 48 → 0 in 166ms with **83% of the collapse in the first
  quarter**.
- **Why it matters.** Every other exit in the language accelerates away (`ease-exit`). The panel
  instead snaps most of the way shut immediately and then creeps, so collapsing content reads as a
  cut rather than a close. Open and close also share one duration, while presence exits are
  deliberately shorter.
- **Recommendation.** Give `motionDisclose`'s ending state the exit curve and exit duration, as the
  presence recipes do. Keep the release curve for opening.
- **Affects:** `motionDisclose`, Accordion, Collapsible, §12. **Small.**

#### A6. Activity loops run on three unrelated paces, two outside the tokens — high confidence

- **Measured.**
  - Spinner: `sherick-spin 1s linear` (Tailwind's default).
  - Skeleton: `sherick-pulse 2s cubic-bezier(0.4, 0, 0.6, 1)` (Tailwind's default, with a literal
    curve).
  - Indeterminate Progress: `--sui-duration-activity` (1.4s).
- **Why it matters.** §12 says one module chooses timing and curve. Two of the three loops are
  Tailwind defaults that no token or recipe owns, so a consumer retuning `--sui-duration-activity`
  changes one loop out of three.
- **Recommendation.** Author the spin and pulse keyframes in the same private build configuration
  as the indeterminate sweep, with their pace and curve as tokens. Either give the three loops a
  shared rhythm (for example, pulse = 2 × spin) or document why each differs.
- **Affects:** `tokens.ts`, `tailwind.internal.cjs`, `motionActivitySpin`, `motionActivityPulse`,
  budgets (tiny). **Small.**

#### A7. The neutral press step is now nearly identical to hover — high confidence

- **Measured.** A neutral tonal Button's state layer is 0.09 on hover and 0.10 while pressed.
- **Why it matters.** This came from the visual audit's batch 3, which lightened the neutral press
  so it would not go grey. With the tactile scale often not appearing (A2), the tone step is the
  only feedback left on a quick tap, and a 0.01 step is imperceptible.
- **Recommendation.** Set the neutral press to about 0.12. That is still lighter than the coloured
  0.15, and still clears the contrast contract with ink on the neutral fill. Land it together with
  A2.
- **Affects:** `stateLayer.tonalNeutral`, `recipeAlphas`, contrast contract. **Small.**

#### A8. The glide curve's documented behaviour is not what it does — high confidence (docs)

- **Measured.** Every glide entrance was at **76–89% of its travel at half time** (for example,
  anchored popups 0.37/0.76–0.83/0.96; the Tabs indicator 0.50/0.86/0.98).
- **Why it matters.** The token comment says glide "crosses the middle of the travel in the middle
  of the time". Mathematically, `cubic-bezier(0.32, 0, 0.24, 1)` reaches 50% at about a third of
  the time. The curve is fine — noticeably less front-loaded than `ease-release`, which is
  0.82/0.94/0.99 — but future tuning will be done against a false description.
- **Recommendation.** Correct the comment in `tokens.ts` and the matching sentence in
  `ui.motion.ts`. Do not retune the curve unless a rendered comparison asks for it.
- **Affects:** `tokens.ts` and `ui.motion.ts` comments only. **Small.**

### B. Component-family findings

| # | Measured | Why it matters | Recommendation | Affects |
| --- | --- | --- | --- | --- |
| B1 | **TreeView expansion snaps.** A branch's height jumps 40 → 82px in one frame while its chevron rotates over 150ms. The Accordion eases the same kind of reveal over about 180ms. | Two disclosure families move differently. The chevron animating over content that has already appeared reads as lag. | Render a branch's child group through Base `Collapsible.Panel` (the primitive Accordion and Collapsible already use) with `motionDisclose`, so the height is measured by Base and interpolated by the recipe. There are no local timers. | TreeView, `motion.spec.ts` |
| B2 | **SegmentedControl crossfades; Tabs slide.** On Week → Month, the old fill fades out and the new one fades in (90% done at the first quarter), with no travel. Tabs move an indicator 381px. | §9 and §11 treat both as a held choice in a recessed track; one travels and one swaps. | A decision, not a patch. Base `ToggleGroup` has no indicator primitive, and measuring positions locally would be new infrastructure (AGENTS.md: document the Base gap first). Either (a) document in §11 that segments change in place (feedback) while tabs relocate, with the reason, or (b) record the Base gap and plan an indicator. (a) is recommended for now. | SegmentedControl, ToggleGroup, §11 |
| B3 | **Keyboard highlight trails.** In a Menu, ArrowDown fades the previous row's highlight out over about 130ms while the next row takes it, so fast arrowing leaves a smear across several rows. | A highlight is a location, not a state change. Platform menus move it instantly; the fade suits a pointer leaving, not a key press. | Make `activeRow` highlight changes instantaneous (no interpolation on `data-highlighted`). Keep the press and hover response on the state layer. | `stateLayer.activeRow`, `list.option`, `list.command`, Menu, Select, Combobox, Command |
| B4 | **Determinate Progress jumps.** The indicator's width has no transition, so each value update is a jump. Stepper fills only fade. | "How far the work has come" is a quantity changing, which is the `relocate` intent (a persistent part moving between stable states). A jumpy bar reads as unreliable. | Give the determinate indicator `motionRelocate`, instant under reduced motion. Its width is Base's measure, and only the interpolation is added. | Progress, §12 |
| B5 | **Tooltips have no delay, and each has its own provider.** `Tooltip` wraps every instance in `Tooltip.Provider delay={0} closeDelay={0}`. A tooltip mounts about 60ms after the pointer arrives and flashes on any pass-over, and Base's warm-group behaviour (instant between neighbours after the first) cannot work across instances. | This is timing, the same as motion: a hint that appears on every pointer pass is noise, particularly across icon toolbars. | Default to a short open delay (about 400–600ms) and `closeDelay` 0. Consider an additive `TooltipProvider` export, so a toolbar can share one warm group; that is a public-API addition, and belongs in a minor release. | Tooltip, possibly the package exports, §12 |

### C. Integration findings

- **C1. Theme switching flashes controls (high confidence).**
  - **Measured:** switching light → dark, the page and card backgrounds change in one frame, but
    buttons and fields start fading about 100ms later and take 160–180ms. For roughly a quarter
    second, light-mode controls sit on a dark page.
  - **Cause:** every control carries `motionFeedback` (background, colour, shadow), while page
    surfaces do not, so a token change animates only some surfaces.
  - **Recommendation:** document the standard remedy for consumers in the README theming section:
    suppress transitions for one frame while the theme attribute changes (the pattern next-themes
    calls `disableTransitionOnChange`). Apply it in the showcase's theme picker. This is guidance,
    not a new library API.
- **C2. Inline removals have no exit (low).** Dismissing an Alert, removing a tag Chip or a
  FileUpload row removes the node in one frame, and the content below jumps up.
  - **Why it stays:** Base provides no presence primitive for in-flow lists, and §12 forbids local
    exit timers, so this is a deliberate limitation, not a defect.
  - **Recommendation:** record it in §12 as a known gap, so it is not "fixed" locally in one
    component.

### D. Retained deliberately (checked, no change recommended)

- Calendar month changes swap the grid instantly. Motion there would delay reading dates, and no
  intent covers it.
- Tab panels swap instantly while the indicator travels; only the indicator is the persistent part.
- The focus ring appears instantly (outline is not transitioned) while the field tone fades over
  150ms. An instant ring is the right accessibility choice.
- The toast stack: a new toast rises 120px in 250ms, and the previous one steps back to scale 0.9
  and 22px up on the same timing. Toasts last about 5s (Base's default). This is coherent and
  needs no change.
- Checkbox and radio marks spring in (5% overshoot) and leave on the exit curve without one.
  The switch thumb glides and grows from 20 to 24px without overshoot. These match §12 exactly.

---

## 3. Motion-language opportunities

1. **Calibrate by size, not only by intent.**
   - Each intent keeps its character, but duration and amplitude take a small, documented step
     when the object is large: long relocate, sheet presence and the wide tactile tier.
   - Intended effect: a wide Select presses like a button, not like a lurch, and a tab indicator's
     travel is actually seen.
2. **Make press feedback land inside a tap.**
   - Tactile response is the most frequent motion in any product. A short press leg means every
     click, however brisk, is acknowledged.
   - Intended effect: the library feels responsive in the hand, not only in slow motion.
3. **Close every presence gap.**
   - The scrim, TreeView branches and determinate progress are the three places where the
     vocabulary exists but was not applied.
   - Intended effect: nothing in the library appears or changes size without the system's timing.
4. **Separate location from state.**
   - A keyboard highlight and a tooltip's appearance are about *where attention is*. They should be
     immediate (the highlight) or deliberately delayed (the tooltip), never a soft fade on every
     step.
5. **Keep the motion system's own claims true.**
   - Correct the glide comment, and move the spin and pulse loops onto tokens, so the module
     remains the single honest owner.

---

## 4. Improvement plan

**Scope** is S (one recipe or token plus tests) or M (a recipe family plus several components).
Every pass that changes the published package bumps `packages/ui/package.json`:

- patch for pure motion corrections;
- minor if a `TooltipProvider` export or new theme variables are added.

Each pass adds its rule to §12 first, and adds a frame-sampled assertion to `motion.spec.ts` for
what it fixes (the audit's sampler can be adapted directly).

### Pass 1: Defects (highest impact, all small)

| ID | Problem | Change | Affects | Scope |
| --- | --- | --- | --- | --- |
| 1.1 | Scrim snaps (A1) | Opacity 0 at both ends in `motionPresenceScrim`; a painted-opacity test | DialogSurface family | S |
| 1.2 | Tooltip has no delay (B5) | Default open delay of about 500ms and `closeDelay` 0; decide on an additive `TooltipProvider` | Tooltip, exports? | S |
| 1.3 | TreeView snaps (B1) | Child group through Base `Collapsible.Panel` with `motionDisclose` | TreeView | S–M |
| 1.4 | Glide comment false (A8) | Correct the comments | tokens, `ui.motion.ts` | S |
| 1.5 | Loops off tokens (A6) | Tokenized spin and pulse keyframes | tokens, build config | S |

### Pass 2: Tactile model

| ID | Problem | Change | Affects | Scope | Depends on |
| --- | --- | --- | --- | --- | --- |
| 2.1 | Quick taps show no press (A2) | `--sui-duration-tactile` of about 80ms for the press leg | tactile, ink press, state layer | S | — |
| 2.2 | Amplitude grows with width (A3) | `tactile` / `tactileWide` tiers; NavItem stops compressing | Select, Combobox, Tabs, NavItem | S–M | — |
| 2.3 | Neutral press imperceptible (A7) | Neutral press step to about 0.12 | `stateLayer.tonalNeutral`, contract | S | 2.1 |

### Pass 3: Timing by distance and role

| ID | Problem | Change | Affects | Scope |
| --- | --- | --- | --- | --- |
| 3.1 | Long travel too fast (A4) | Long-relocate timing for Tabs; sheet presence timing for Drawer | tokens, Tabs, Drawer | S |
| 3.2 | Disclose closes on the arrival curve (A5) | Exit curve and duration on the ending state | Accordion, Collapsible (and TreeView after 1.3) | S |
| 3.3 | Keyboard highlight trails (B3) | Instant highlight changes | list rows, Menu, Select, Combobox, Command | S |
| 3.4 | Progress jumps (B4) | `motionRelocate` on the determinate indicator | Progress | S |

### Pass 4: Decisions and documentation

| ID | Problem | Change | Scope |
| --- | --- | --- | --- |
| 4.1 | Segments crossfade, tabs slide (B2) | Document the difference in §11 (recommended), or record the Base indicator gap | S |
| 4.2 | Theme switch flashes controls (C1) | README theming guidance; apply it in the showcase theme picker | S |
| 4.3 | Inline removals have no exit (C2) | Record the known gap in §12 | S |

### Suggested sequencing

- Pass 1 can start immediately, in any order.
- Pass 2 is one change set: tune it in the motion lab at slow speed, then verify at normal speed
  with the tap test.
- Pass 3 depends on nothing, but 3.2 should follow 1.3 so TreeView inherits the corrected
  disclosure exit.
- Pass 4 is documentation and can land alongside any pass.

### Verification for every pass

- Run `bun run verify`, with `WEBKIT_EXECUTABLE_PATH` set on machines where the bundled WebKit
  cannot launch.
- `bun run test:motion` must stay green with no allowlist.
- Each fix adds a frame-sampled browser assertion rather than a class-name check. The scrim defect
  survived precisely because its test asserted the recipe instead of the painted opacity.
- Review each change at slow speed in `/verification/motion` and at normal speed in the showcase,
  in both themes, with reduced motion on and off.

---

## 5. Implementation status

The four passes were implemented on the stacked branch, one commit per pass, in the same
unpublished 2.3.0 release as the visual refinements. Every pass ran the package gates (contrast
contract, style contract, motion policy, bundle budgets), both browser suites (showcase, and
no-Tailwind on Chromium, Firefox and WebKit), and added frame-sampled browser assertions for what
it fixed.

| Item | Outcome |
| --- | --- |
| A1 Scrim | Done. Starting and ending opacity on `motionPresenceScrim`; a test samples the painted opacity on open and close. |
| A2 Quick taps | Done. `--sui-duration-tactile` (80ms) drives the press leg of `motionTactile`, `motionInkPress` and the state layer; a test proves a 60ms tap compresses at least half-way. |
| A3 Amplitude | Done. Tiers by role: `motionTactile` 0.96, `motionTactileWide` 0.985 (Tabs), `motionTactileField` 0.993 (Select and Combobox). Measured edge travel: Select 11.6 → **2.0px**, Tab 3.8 → 1.4px, buttons and chips unchanged (1.4–1.7px); NavItem no longer compresses. The Select/Combobox test now bounds edge travel below 3px, so the field press cannot become aggressive again unnoticed. |
| A4 Distance | Done. `motionRelocateLong` (`--sui-duration-travel`, 300ms) for the Tabs indicator; `--sui-duration-sheet` / `-sheet-exit` (320 / 200ms) for sheets. |
| A5 Disclose exit | Done. The ending state takes `ease-exit` and the exit duration. |
| A6 Loops | Done. `--sui-duration-spin` (1s), `--sui-duration-pulse` (2s) and `--sui-ease-pulse` drive the spin and pulse keyframes. |
| A7 Neutral press | Done. 0.12. |
| A8 Glide comment | Done. The token comment now describes the measured curve. |
| B1 TreeView | Done. A branch item is a Base `Collapsible.Root` and its group the `Collapsible.Panel`, with `motionDisclose`; closing branches keep their children until Base unmounts the panel. |
| B2 Segments | Documented in §11 as a deliberate in-place change, pending a Base indicator primitive. |
| B3 Keyboard highlight | Done. `motionRowLayer` makes list-row highlights move in one step. |
| B4 Progress | Done. The determinate indicator relocates. |
| B5 Tooltip delay | Done: 500ms open delay, 0 close delay. The additive `TooltipProvider` export for shared warm groups was deferred: it is new public API and nothing in this audit required it. |
| C1 Theme switch | Done as guidance: the README documents a one-frame transition guard, the showcase applies it, and a test asserts a control's fill has no in-between value during a switch. |
| C2 Inline removals | Documented in §12 as a known gap. |

The component stylesheet budget was re-recorded with its reason in [RELEASE.md](RELEASE.md#size-budgets).
