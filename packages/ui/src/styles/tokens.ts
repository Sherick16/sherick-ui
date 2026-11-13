export type ThemeName = "light" | "dark";

/* The palette is "graphite and iris": a graphite ink on a pale canvas, white sheets, and one
   vivid iris violet that is spent only on what the reader acts on. The neutral surfaces carry a
   visible trace of the accent's hue (285 to 290, chroma 0.011 to 0.024): the page is a
   lavender-grey in light and an indigo graphite in dark, which is the palette's character where no
   accent is spent. Ink and the white sheet stay neutral, so text and cards do not take a colour
   cast; shadows are a violet-graphite umbra for the same reason. Every value is measured by the contrast contract (docs/PALETTE.md). */
/* The light a sheet of glass carries in the light theme, shared by the card and the floating sheets
   so the two cannot drift: the diffuse pool at the top, and the contour glow that fades inward from
   the top edge and, more quietly, the bottom (docs/DESIGN_LANGUAGE.md §4 to §6). */
const lightSheetSheen = "radial-gradient(120% 85% at 50% 0%, rgb(255 255 255 / 0.90) 0%, rgb(255 255 255 / 0.40) 35%, rgb(255 255 255 / 0) 78%)";
const lightContourGlow = "inset 0 10px 18px -10px oklch(var(--sui-light-top) / 0.95), inset 0 -10px 18px -12px oklch(var(--sui-light-top) / 0.50)";

export const lightTokens = {
  /* The page. It sits far enough under the white card that a card reads as a sheet on it by tone
     alone; at 0.970 a card faded into the page. A field's `tray` stays below it, so a field placed
     straight on the page is still a well. */
  "canvas": "0.960 0.011 290",
  "surface": "0.998 0.001 290",
  /* A card's glaze: the sheet's own tone, a faint step off pure white so the lit top of the sheen
     reads against it. `glaze-fill` lets a little of the page through and stays high enough that
     copy measures as it does on an opaque card. */
  "glaze": "0.992 0.004 290",
  "glaze-fill": "0.84",
  "glaze-sheen": lightSheetSheen,
  /* The page's wash: two soft pools of the accent's neighbours at the top of the canvas. It is what
     a glazed card lets through, so the page is never one flat tone behind the glass. */
  "canvas-wash": "radial-gradient(52rem 36rem at 0% 0%, oklch(0.930 0.035 310 / 0.70), transparent 70%), radial-gradient(44rem 32rem at 100% 0%, oklch(0.940 0.035 250 / 0.80), transparent 70%)",
  "surface-high": "0.932 0.014 290",
  /* The tray: a text field's resting tone. A field is a well, sunk by `elevation-recessed`, so its
     tone is a light step under the card and the recess carries its boundary; at `surface-high`
     strength a form read as a stack of grey bars. A choice row rests on the same tone. */
  "tray": "0.949 0.011 290",
  /* The deep tray: the step a text field sinks to under the pointer and while it is engaged. A
     field is identified by its label, its value or placeholder and its parts rather than by a drawn
     edge, so its states are carried by its tray and the focus ring; these two steps are a field's
     alone. */
  "tray-deep": "0.920 0.015 290",
  /* The floor of an empty checkbox or radio. A mark is a soft well with no rim, so its floor is the
     neutral step furthest from the sheet: the tone and the `elevation-mark` recess are all that
     mark it. */
  "mark-well": "0.902 0.016 290",
  /* A floating sheet is the card's own glass at a higher fill. Its tone is a clear step off white:
     the fill stays near whole so nothing behind shows through, and the tone is what gives the white
     sheen and the contour glow something to light. */
  "surface-float": "0.980 0.006 290",
  /* The puck: a held choice that rides in a track — a selected segment, the tab indicator. It is
     the one surface lit *above* every sheet in both themes, because a puck is a part lifted out of
     the groove it sits in; in dark mode no sheet tone can play that role, since a lifted object is
     lighter there and every sheet sits below the track that holds it. */
  "puck": "1 0 0",
  "media": "0.200 0.008 285",
  "ink": "0.200 0.012 285",
  "ink-muted": "0.480 0.014 285",
  /* The detail role is non-text furniture: it carries a mark, a rail or a gutter, and it is not a
     third step of the text ladder. It answers to the 3:1 non-text requirement wherever it carries
     meaning; anything a reader must read uses `ink` or `ink-muted`. */
  "detail": "0.590 0.012 285",
  /* The rim of a hollow control — a drop target. It is the
     only border a control carries, so it is tuned to clear the 3:1 non-text requirement against
     every surface a control sits on with a small margin and no more: at `detail` strength the rim
     outshone the labels beside it. Hover steps it to `ink-muted`. */
  "rim": "0.625 0.012 285",
  "primary": "0.490 0.205 292",
  "primary-strong": "0.430 0.200 292",
  /* The designed surfaces of each semantic role. A soft container is what a tinted surface is
     made of — a tonal control, an Alert, a Badge, a quiet Card — and the selected step is the held
     choice one rung stronger. They are authored rather than derived as a fraction of the role's
     foreground, because that foreground is tuned for text contrast: a fraction of a deep
     iris is a dusty mauve and a fraction of a deep ochre is a grey, so every contrast retune
     used to recolour every tinted surface. Each value clears the contrast contract with its own
     foreground, `ink` and the focus ring through the tonal states. */
  "primary-soft": "0.944 0.040 292",
  "primary-selected": "0.895 0.070 292",
  "danger-soft": "0.952 0.020 30",
  "danger-selected": "0.900 0.042 30",
  "warning-soft": "0.955 0.032 82",
  "warning-selected": "0.905 0.058 80",
  "success-soft": "0.952 0.024 165",
  "success-selected": "0.900 0.046 165",
  "accent": "0.62 0.12 230",
  "danger": "0.465 0.180 27",
  "warning": "0.398 0.086 68",
  "success": "0.390 0.088 158",
  "on-primary": "0.990 0.003 290",
  "on-danger": "0.990 0.003 290",
  "on-warning": "0.990 0.003 290",
  "on-success": "0.990 0.003 290",
  "focus": "0.490 0.205 292",
  "outline": "0.500 0.012 285",
  "scrim": "0.200 0.006 285",
  "edge": "0.400 0.012 285",
  "light-top": "1 0 0",
  "light-bottom": "0.280 0.025 290",
  "elevation-flat": "none",
  /* A card at rest on the page: a hairline contact edge, a close contact shadow and a wide, soft
     ambient fall under its lower edge, so the sheet is seated rather than lifted. The inset layers
     are the glaze's contour glow, which belongs to the elevation as every surface's edge light does. */
  "elevation-resting": `0 0 0 0.5px oklch(var(--sui-light-bottom) / 0.04), 0 2px 6px -1px oklch(var(--sui-light-bottom) / 0.05), 0 20px 44px -18px oklch(var(--sui-light-bottom) / 0.20), inset 0 0 0 1px oklch(var(--sui-light-top) / 0.45), ${lightContourGlow}`,
  /* A contact shadow, not a float: the ambient layer stays close to the control, so a row of raised
     actions sits on the page rather than hovering over it. The inset line is the lit upper lip of a
     key — the light model's upper edge, drawn once — so a filled action reads as a pressable object
     rather than a flat swatch. Floating depth is `elevation-floating`'s. */
  "elevation-raised": "0 1px 1px oklch(var(--sui-light-bottom) / 0.10), 0 2px 5px -1px oklch(var(--sui-light-bottom) / 0.12), inset 0 1px 0 oklch(var(--sui-light-top) / 0.24)",
  /* A floating surface holds a hairline contact edge in the umbra, so it keeps its boundary over any
     content it covers — a white sheet over a white card has nothing else to separate it — and then
     two layers of depth: a close penumbra and a long, soft ambient fall. */
  "elevation-floating": "0 0 0 1px oklch(var(--sui-light-bottom) / 0.07), 0 4px 10px -2px oklch(var(--sui-light-bottom) / 0.08), 0 22px 48px -10px oklch(var(--sui-light-bottom) / 0.24), inset 0 1px 0 oklch(var(--sui-light-top) / 0.80)",
  /* A floating *sheet* — a popup, a menu, a toast, a dialog, a drawer: the floating rung's contact
     hairline and depth with the card's contour glow. A small floating part (a tooltip, a floating
     icon button) keeps `floating` and its crisp lip, because a wide glow on a 40px part is a smear. */
  "elevation-floating-sheet": `0 0 0 1px oklch(var(--sui-light-bottom) / 0.06), 0 4px 10px -2px oklch(var(--sui-light-bottom) / 0.08), 0 24px 52px -12px oklch(var(--sui-light-bottom) / 0.24), inset 0 0 0 1px oklch(var(--sui-light-top) / 0.50), ${lightContourGlow}`,
  /* A held selection — a puck in a track, a chosen option or date. It carries a half-pixel contact
     edge so a white puck holds its outline on the pale track around it. */
  "elevation-control": "0 0 0 0.5px oklch(var(--sui-light-bottom) / 0.10), 0 1px 3px oklch(var(--sui-light-bottom) / 0.16), inset 0 1px 0 oklch(var(--sui-light-top) / 0.70)",
  /* The recessed rung, and the deeper `well` a small selection mark sinks to while it is held. The
     well is a press response: it deepens the shaded floor and keeps the lit lower wall, so a held
     mark sinks without its boundary moving. */
  "elevation-recessed": "inset 0 1px 2px oklch(var(--sui-light-bottom) / 0.18), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.55)",
  "elevation-recessed-top": "inset 0 5px 8px -5px oklch(var(--sui-light-bottom) / 0.18)",
  "elevation-well": "inset 0 2px 4px oklch(var(--sui-light-bottom) / 0.34), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.80)",
  /* An empty mark at rest. Stronger than `recessed` and with a brighter lower lip: a 20px well has
     no rim, so the shaded upper wall and the lit lip are its whole boundary. */
  "elevation-mark": "inset 0 1px 3px oklch(var(--sui-light-bottom) / 0.30), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.80)",
  /* Fill isolates content even without backdrop filtering; blur only enriches the remaining light. */
  "glass-fill": "0.98",
  "glass-blur": "28px",
  "glass-saturation": "1.10",
  "glass-brightness": "1.015",
  "glass-dense-fill": "0.99",
  "glass-dense-blur": "22px",
  "glass-dense-saturation": "1.08",
  "glass-dense-brightness": "1.01",
  "glass-gradient": lightSheetSheen,
  "glass-gradient-dense": "linear-gradient(180deg, rgb(255 255 255 / 0.70) 0%, rgb(255 255 255 / 0.22) 34%, rgb(255 255 255 / 0) 72%, rgb(40 36 60 / 0.04) 100%)",
  "glass-hero-blur": "14px",
  "glass-hero-saturation": "1.06",
  "glass-hero-brightness": "1.0",
  "glass-hero-gradient": "radial-gradient(120% 60% at 50% 0%, rgb(255 255 255 / 0.80) 0%, rgb(255 255 255 / 0.30) 35%, rgb(255 255 255 / 0) 78%)",
  "surface-overlay": "0.980 0.006 290",
  "overlay-fill": "0.99",
  "scrim-blur": "8px",
  "code-text": "oklch(0.27 0.012 285)",
  "code-comment": "oklch(0.52 0.012 285)",
  "code-string": "oklch(0.47 0.10 158)",
  "code-number": "oklch(0.51 0.13 55)",
  "code-keyword": "oklch(0.47 0.19 300)",
  "code-function": "oklch(0.49 0.16 27)",
  "code-tag": "oklch(0.46 0.15 260)",
} as const satisfies Record<string, string>;

/* Dark is not light inverted: it is a graphite room in which the sheets are lit a step above the
   floor, the accent is a luminous lavender iris that glows rather than shouts, and the floating
   edge is a line of light rather than a shadow. */
export const darkTokens = {
  /* The dark ladder is wider than a mirror of the light one, because steps at the dark end are
     harder to see: the floor is well under the sheet, a field is a lit tray a step over the sheet
     (a darker pit disappears on the floor), an empty mark is lit a step over the field for the same
     reason, and the neutral parts built on `surface-high` — a tonal button, a track, a badge — are
     never darker than the field. */
  "canvas": "0.145 0.016 285",
  "surface": "0.212 0.018 285",
  /* Smoked glass: a sheet a step lighter than `surface`, so that at this fill over the floor a card
     lands on the tone an opaque card had. The sheen and the contour glow are a trace of light and
     no more; at 80% fill and below, or with a brighter edge, the glass outshone its content. */
  "glaze": "0.226 0.021 288",
  "glaze-fill": "0.85",
  "glaze-sheen": "radial-gradient(120% 85% at 50% 0%, rgb(255 255 255 / 0.05) 0%, rgb(255 255 255 / 0.015) 40%, rgb(255 255 255 / 0) 78%)",
  /* The dark wash is a faint violet and blue glow: without it the floor is one flat tone and smoked
     glass has nothing to show. */
  "canvas-wash": "radial-gradient(48rem 34rem at 4% 0%, oklch(0.360 0.140 300 / 0.14), transparent 70%), radial-gradient(42rem 30rem at 100% 6%, oklch(0.340 0.110 255 / 0.126), transparent 70%), radial-gradient(48rem 28rem at 58% 100%, oklch(0.300 0.120 292 / 0.112), transparent 70%)",
  "surface-high": "0.310 0.022 285",
  "tray": "0.262 0.020 285",
  "tray-deep": "0.300 0.022 285",
  "mark-well": "0.335 0.024 285",
  "surface-float": "0.238 0.019 285",
  "puck": "0.335 0.024 285",
  "media": "0.160 0.006 285",
  "ink": "0.950 0.004 285",
  "ink-muted": "0.745 0.010 285",
  "detail": "0.605 0.010 285",
  "rim": "0.535 0.010 285",
  "primary": "0.780 0.125 292",
  "primary-strong": "0.720 0.160 292",
  "primary-soft": "0.310 0.098 292",
  "primary-selected": "0.385 0.128 292",
  /* The dark semantic containers are tints, not slabs. An Alert or Badge sits on the same graphite
     room as the neutral one beside it, so its soft step stays close to the sheet's own lightness
     and carries only a little of its hue; the selected step is one rung lighter and a touch more
     saturated, which is the same rule the light containers follow. */
  "danger-soft": "0.260 0.040 25",
  "danger-selected": "0.330 0.062 25",
  "warning-soft": "0.260 0.040 75",
  "warning-selected": "0.330 0.060 75",
  "success-soft": "0.260 0.040 160",
  "success-selected": "0.330 0.060 160",
  "accent": "0.80 0.08 215",
  "danger": "0.775 0.130 25",
  "warning": "0.830 0.120 80",
  "success": "0.780 0.120 158",
  "on-primary": "0.160 0.006 285",
  "on-danger": "0.160 0.006 285",
  "on-warning": "0.160 0.006 285",
  "on-success": "0.160 0.006 285",
  "focus": "0.780 0.125 292",
  "outline": "0.745 0.010 285",
  "scrim": "0.060 0.006 285",
  "edge": "0.930 0.006 285",
  "light-top": "1 0 0",
  "light-bottom": "0.070 0.008 285",
  "elevation-flat": "none",
  "elevation-resting": "0 2px 6px -1px oklch(var(--sui-light-bottom) / 0.45), 0 22px 44px -18px oklch(var(--sui-light-bottom) / 0.72), inset 0 0 0 1px oklch(var(--sui-light-top) / 0.03), inset 0 12px 20px -12px oklch(var(--sui-light-top) / 0.07), inset 0 -10px 18px -12px oklch(var(--sui-light-top) / 0.025)",
  "elevation-raised": "0 1px 2px oklch(var(--sui-light-bottom) / 0.40), 0 3px 8px -2px oklch(var(--sui-light-bottom) / 0.30), inset 0 1px 0 oklch(var(--sui-light-top) / 0.13)",
  "elevation-floating": "0 0 0 1px oklch(var(--sui-light-top) / 0.08), 0 6px 14px -4px oklch(var(--sui-light-bottom) / 0.40), 0 26px 56px -12px oklch(var(--sui-light-bottom) / 0.65), inset 0 1px 0 oklch(var(--sui-light-top) / 0.06)",
  "elevation-floating-sheet": "0 0 0 1px oklch(var(--sui-light-top) / 0.07), 0 6px 14px -4px oklch(var(--sui-light-bottom) / 0.40), 0 26px 56px -12px oklch(var(--sui-light-bottom) / 0.65), inset 0 12px 20px -12px oklch(var(--sui-light-top) / 0.13), inset 0 -10px 18px -12px oklch(var(--sui-light-top) / 0.045)",
  "elevation-control": "0 0 0 0.5px oklch(var(--sui-light-bottom) / 0.40), 0 1px 3px oklch(var(--sui-light-bottom) / 0.45), inset 0 1px 0 oklch(var(--sui-light-top) / 0.09)",
  "elevation-recessed": "inset 0 1px 3px oklch(var(--sui-light-bottom) / 0.42), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.05)",
  "elevation-recessed-top": "inset 0 5px 8px -5px oklch(var(--sui-light-bottom) / 0.40)",
  "elevation-well": "inset 0 2px 4px oklch(var(--sui-light-bottom) / 0.80), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.12)",
  "elevation-mark": "inset 0 1px 3px oklch(var(--sui-light-bottom) / 0.65), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.12)",
  "glass-fill": "0.98",
  "glass-blur": "32px",
  "glass-saturation": "1.12",
  "glass-brightness": "1.01",
  "glass-dense-fill": "0.99",
  "glass-dense-blur": "26px",
  "glass-dense-saturation": "1.10",
  "glass-dense-brightness": "1.01",
  "glass-gradient": "radial-gradient(120% 85% at 50% 0%, rgb(255 255 255 / 0.08) 0%, rgb(255 255 255 / 0.03) 40%, rgb(255 255 255 / 0) 78%)",
  "glass-gradient-dense": "linear-gradient(180deg, rgb(255 255 255 / 0.06) 0%, rgb(255 255 255 / 0.018) 36%, rgb(255 255 255 / 0) 76%, rgb(0 0 0 / 0.08) 100%)",
  "glass-hero-blur": "10px",
  "glass-hero-saturation": "1.03",
  "glass-hero-brightness": "1.0",
  "glass-hero-gradient": "radial-gradient(120% 60% at 50% 0%, rgb(255 255 255 / 0.065) 0%, rgb(255 255 255 / 0.022) 40%, rgb(255 255 255 / 0) 78%)",
  "surface-overlay": "0.226 0.018 285",
  "overlay-fill": "0.99",
  "scrim-blur": "8px",
  "code-text": "#dfdee6",
  "code-comment": "#928f9e",
  "code-string": "#7dd3a3",
  "code-number": "#f3ad66",
  "code-keyword": "#c8a8ff",
  "code-function": "#fb9989",
  "code-tag": "#8cc3fc",
} as const satisfies Record<keyof typeof lightTokens, string>;

export const sharedTokens = {
  /* The code face. Sans text inherits the host's typeface — the library is tuned for a
     neo-grotesque such as Inter but never sets one — while code needs a monospace the platform
     default does not reliably provide, so the stack is curated here once. */
  "font-mono": 'ui-monospace, "SF Mono", SFMono-Regular, "Cascadia Code", "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace',
  /* The dash mask of a drop target's rim (see `rim.dashed`). The platform's own `dashed` style picks
     its dash length and corner joins per engine; this fixes a 7px rhythm with round caps and follows
     the 12px `control` corner exactly. The stroke is drawn on the box edge at 3px, so the half that
     lands inside the box is the visible 1.5px rim. The mask carries no colour: the rim's tone is its
     own background, so it themes like every other rim. */
  "rim-dashed": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' rx='12' fill='none' stroke='%23000' stroke-width='3' stroke-dasharray='7' stroke-linecap='round'/%3E%3C/svg%3E")`,
  "duration-press": "150ms",
  "duration-release": "200ms",
  /* The press leg of a tactile response. A tap on a trackpad or a brisk click is held for well
     under 100ms, and a press that interpolates over the feedback duration is released before it
     shows; this leg lands inside a tap, and the release still settles on the release timing. */
  "duration-tactile": "80ms",
  "duration-overlay": "240ms",
  "duration-overlay-exit": "160ms",
  /* Duration grows with travel, in two steps rather than continuously. A tab indicator crossing a
     track travels hundreds of pixels, and on the local timing it covers them in a handful of
     frames; a sheet crosses a whole viewport edge, and on the anchored timing it arrives before
     the eye has followed it. */
  "duration-travel": "300ms",
  "duration-sheet": "320ms",
  "duration-sheet-exit": "200ms",
  /* Continuous activity runs for as long as the work does: a spinner's loop has no duration of
     its own, but a sweep across a track is paced, so the one loop that is timed is authored
     here with the rest of the system's timing. It is a pace, not a response, so it is the one
     duration that never shortens for a press or a release. */
  "duration-activity": "1400ms",
  /* The other two loops share one rhythm: a spinner turns once a second, and a skeleton breathes
     once every two turns, so two loading glyphs on one screen never beat against each other. */
  "duration-spin": "1000ms",
  "duration-pulse": "2000ms",
  /* Reduced motion keeps activity visible as an opacity change. A spinner that stops entirely reads
     as finished, so under `prefers-reduced-motion` it breathes on a slow two-second loop instead of
     turning; the loop is paced like the pulse it resembles. */
  "duration-breathe": "2000ms",
  /* The utility presence tier: a small surface opened from the keyboard, or a tooltip answered on
     the quick timing. Opacity only, so the pace is short enough that a keyboard user never waits on
     a hint or a menu they just asked for. */
  "duration-utility": "100ms",
  "duration-utility-exit": "80ms",
  "ease-pulse": "cubic-bezier(0.4, 0, 0.6, 1)",
  "ease-press": "cubic-bezier(0.4, 0, 0.2, 1)",
  "ease-release": "cubic-bezier(0.16, 1, 0.3, 1)",
  "ease-exit": "cubic-bezier(0.4, 0, 1, 1)",
  /* A persistent object travelling between two stable destinations — a tab indicator, a switch
     thumb — and the grow of a surface arriving. `ease-release` is an arrival curve: it covers
     about 80% of a travel in the first quarter of the time, which reads as a teleport followed by
     a creep once the distance is large. The glide curve starts from rest instead of at full
     speed: it passes the middle of the travel at about a third of the time and is roughly 80%
     there at half time (measured in the motion audit), so the start of the movement is visible
     rather than skipped. It never overshoots. */
  "ease-glide": "cubic-bezier(0.32, 0, 0.24, 1)",
  /* The one overshooting curve in the system: a part that travels a little past where it lands
     and settles back. It is what makes a selection feel made and a released press feel answered,
     and it is deliberately reserved for the parts that carry that meaning. */
  "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const satisfies Record<string, string>;

export const themes = {
  light: lightTokens,
  dark: darkTokens,
} as const;
