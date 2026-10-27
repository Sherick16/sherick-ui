export type ThemeName = "light" | "dark";

/* The palette is "graphite and iris": a graphite ink on a light canvas, white sheets lifted above it,
   and one vivid iris violet that is spent only on what the reader acts on. The neutrals carry a bare trace
   of the accent's hue (285, chroma under 0.015), so they read as true greys yet sit in the same
   family as the accent instead of fighting it; shadows are a violet-graphite umbra for the same
   reason. Every value is measured by the contrast contract (docs/PALETTE.md). */
export const lightTokens = {
  /* The canvas sits a clear step below the white sheet, so a sheet lifts off it by tone as well as by
     its shadow, yet a page with no sheets on it still reads light rather than grey. */
  "canvas": "0.949 0.005 288",
  "surface": "0.999 0.001 290",
  "surface-high": "0.905 0.009 288",
  /* The tray: a text field's resting well. It is its own step, below the canvas and well below the
     sheet, so a field reads as a well on the page and in a card alike; `tray-light` draws its shaded
     upper wall. */
  "tray": "0.884 0.011 288",
  /* The deep tray: the step a text field sinks to under the pointer and while it is engaged. A
     field is identified by its label, its value or placeholder and its parts rather than by a drawn
     edge, so its states are carried by its tray and the focus ring; this is the one neutral step
     below `surface-high`, and it is a field's alone. */
  "tray-deep": "0.866 0.012 288",
  "surface-float": "0.999 0.001 290",
  /* The puck: a held choice that rides in a track — a selected segment, the tab indicator. It is
     the one surface lit *above* every sheet in both themes, because a puck is a part lifted out of
     the groove it sits in; in dark mode no sheet tone can play that role, since a lifted object is
     lighter there and every sheet sits below the track that holds it. */
  "puck": "1 0 0",
  "media": "0.200 0.008 285",
  "ink": "0.200 0.012 285",
  /* Heading ink: titles and headings take a deeper, higher-contrast ink than body copy, so a
     surface's name leads by tone as well as by size. */
  "ink-heading": "0.130 0.018 285",
  "ink-muted": "0.432 0.014 285",
  /* The detail role is non-text furniture: it carries a mark, a rail or a gutter, and it is not a
     third step of the text ladder. It answers to the 3:1 non-text requirement wherever it carries
     meaning; anything a reader must read uses `ink` or `ink-muted`. */
  "detail": "0.555 0.012 285",
  /* The rim of a hollow control — a drop target, an empty checkbox or radio. It is the
     only border a control carries, so it is tuned to clear the 3:1 non-text requirement against
     every surface a control sits on with a small margin and no more: at `detail` strength the rim
     outshone the labels beside it. Hover steps it to `ink-muted`. */
  "rim": "0.580 0.012 285",
  /* A saturated iris: close to the sRGB edge at its lightness, and still a violet rather than a blue. */
  "primary": "0.470 0.255 290",
  "primary-strong": "0.440 0.235 290",
  /* The designed surfaces of each semantic role. A soft container is what a tinted surface is
     made of — a tonal control, an Alert, a Badge, a quiet Card — and the selected step is the held
     choice one rung stronger. They are authored rather than derived as a fraction of the role's
     foreground, because that foreground is tuned for text contrast: a fraction of a deep
     iris is a dusty mauve and a fraction of a deep ochre is a grey, so every contrast retune
     used to recolour every tinted surface. Each value clears the contrast contract with its own
     foreground, `ink` and the focus ring through the tonal states. */
  "primary-soft": "0.946 0.027 292",
  "primary-selected": "0.858 0.074 291",
  /* The iris label a held choice carries on the selected step — a selected segment, tab, chip,
     option or current navigation row. It clears 4.5:1 on the selected step through the quiet and
     tonal state layers in both themes. */
  "primary-selected-ink": "0.420 0.225 290",
  "danger-soft": "0.952 0.020 30",
  "danger-selected": "0.900 0.042 30",
  "warning-soft": "0.955 0.032 82",
  "warning-selected": "0.905 0.058 80",
  "success-soft": "0.952 0.024 165",
  "success-selected": "0.900 0.046 165",
  "accent": "0.62 0.12 230",
  "danger": "0.452 0.180 27",
  "warning": "0.398 0.086 68",
  "success": "0.390 0.088 158",
  "on-primary": "0.990 0.003 290",
  "on-danger": "0.990 0.003 290",
  "on-warning": "0.990 0.003 290",
  "on-success": "0.990 0.003 290",
  "focus": "0.470 0.255 290",
  "outline": "0.500 0.012 285",
  "scrim": "0.200 0.006 285",
  "edge": "0.400 0.012 285",
  "light-top": "1 0 0",
  "light-bottom": "0.280 0.025 290",
  "elevation-flat": "none",
  /* A contact shadow, not a float: the ambient layer stays close to the control, so a row of raised
     actions sits on the page rather than hovering over it. The inset line is the lit upper lip of a
     key — the light model's upper edge, drawn once — so a filled action reads as a pressable object
     rather than a flat swatch. Floating depth is `elevation-floating`'s. */
  "elevation-raised": "0 1px 1px oklch(var(--sui-light-bottom) / 0.12), 0 2px 5px -1px oklch(var(--sui-light-bottom) / 0.14), inset 0 1px 0 oklch(var(--sui-light-top) / 0.38), inset 0 -1px 0 oklch(var(--sui-light-bottom) / 0.10)",
  /* A floating surface holds a hairline contact edge in the umbra, so it keeps its boundary over any
     content it covers — a white sheet over a white card has nothing else to separate it — and then
     two layers of depth: a close penumbra and a long, soft ambient fall. */
  "elevation-floating": "0 0 0 1px oklch(var(--sui-light-bottom) / 0.07), 0 4px 10px -2px oklch(var(--sui-light-bottom) / 0.08), 0 22px 48px -10px oklch(var(--sui-light-bottom) / 0.24), inset 0 1px 0 oklch(var(--sui-light-top) / 0.80)",
  /* A held selection — a puck in a track, a chosen option or date. It carries a half-pixel contact
     edge so a white puck holds its outline on the pale track around it. */
  "elevation-control": "0 0 0 0.5px oklch(var(--sui-light-bottom) / 0.10), 0 1px 3px oklch(var(--sui-light-bottom) / 0.16), inset 0 1px 0 oklch(var(--sui-light-top) / 0.70)",
  /* The recessed rung, and the deeper `well` a small selection mark sinks to while it is held. A
     checkbox box and a radio socket rest in the same groove a Switch track does — what identifies
     an empty one is its rim, not its depth — so the well is a press response, not an identity. It
     deepens the shaded floor and keeps the lit lower wall, so a held mark sinks without its
     boundary moving. */
  "elevation-recessed": "inset 0 1px 2px oklch(var(--sui-light-bottom) / 0.18), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.55)",
  "elevation-recessed-top": "inset 0 5px 8px -5px oklch(var(--sui-light-bottom) / 0.18)",
  "elevation-well": "inset 0 2px 4px oklch(var(--sui-light-bottom) / 0.34), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.55)",
  /* A card or panel lifts off the canvas: a soft key, a long faint ambient fall and a lit upper lip.
     Its face carries `surface-light`, and `material.matte` applies both together. */
  "elevation-surface": "0 1px 2px oklch(var(--sui-light-bottom) / 0.06), 0 6px 14px -6px oklch(var(--sui-light-bottom) / 0.10), 0 18px 36px -18px oklch(var(--sui-light-bottom) / 0.18), inset 0 1px 0 oklch(var(--sui-light-top) / 0.95)",
  /* The face light of a lit object: `key-light` lights a filled action from above and shades its
     base; `surface-light` does the same, gently, for a sheet; `tray-light` is the reversed light of
     a recess, the shaded upper wall of a field's well. */
  "key-light": "linear-gradient(180deg, oklch(var(--sui-light-top) / 0.20) 0%, oklch(var(--sui-light-top) / 0) 50%, oklch(var(--sui-light-bottom) / 0.08) 100%)",
  "surface-light": "linear-gradient(180deg, oklch(var(--sui-light-top) / 0.85) 0%, oklch(var(--sui-light-top) / 0) 40%, oklch(var(--sui-light-bottom) / 0.03) 100%)",
  "tray-light": "linear-gradient(180deg, oklch(var(--sui-light-bottom) / 0.13) 0px, oklch(var(--sui-light-bottom) / 0.04) 3px, oklch(var(--sui-light-bottom) / 0) 9px)",
  /* Fill isolates content even without backdrop filtering; blur only enriches the remaining light. */
  "glass-fill": "0.98",
  "glass-blur": "28px",
  "glass-saturation": "1.10",
  "glass-brightness": "1.015",
  "glass-dense-fill": "0.99",
  "glass-dense-blur": "22px",
  "glass-dense-saturation": "1.08",
  "glass-dense-brightness": "1.01",
  "glass-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.80) 0%, rgb(255 255 255 / 0.28) 26%, rgb(255 255 255 / 0) 62%, rgb(40 36 60 / 0.04) 100%)",
  "glass-gradient-dense": "linear-gradient(180deg, rgb(255 255 255 / 0.70) 0%, rgb(255 255 255 / 0.22) 34%, rgb(255 255 255 / 0) 72%, rgb(40 36 60 / 0.04) 100%)",
  "glass-hero-blur": "14px",
  "glass-hero-saturation": "1.06",
  "glass-hero-brightness": "1.0",
  "glass-hero-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.50) 0%, rgb(255 255 255 / 0.12) 14%, rgb(255 255 255 / 0) 46%, rgb(40 36 60 / 0.035) 100%)",
  "surface-overlay": "0.995 0.002 290",
  "overlay-fill": "0.99",
  "scrim-blur": "8px",
  "code-text": "oklch(0.27 0.012 285)",
  "code-comment": "oklch(0.505 0.012 285)",
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
  /* A deeper floor, with sheets a clear step above it. A field's tray sits between the two, so a
     field reads as a well on a card as well as on the page. */
  "canvas": "0.120 0.006 285",
  "surface": "0.262 0.011 285",
  "surface-high": "0.315 0.012 285",
  "tray": "0.218 0.010 285",
  "tray-deep": "0.196 0.009 285",
  "surface-float": "0.280 0.011 285",
  "puck": "0.335 0.012 285",
  "media": "0.160 0.006 285",
  "ink": "0.950 0.004 285",
  "ink-heading": "0.992 0.002 285",
  "ink-muted": "0.765 0.010 285",
  "detail": "0.640 0.010 285",
  "rim": "0.580 0.010 285",
  "primary": "0.755 0.135 290",
  "primary-strong": "0.715 0.158 290",
  "primary-soft": "0.300 0.110 291",
  "primary-selected": "0.380 0.150 291",
  "primary-selected-ink": "0.905 0.060 291",
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
  "on-primary": "0.095 0.010 285",
  "on-danger": "0.160 0.006 285",
  "on-warning": "0.160 0.006 285",
  "on-success": "0.160 0.006 285",
  "focus": "0.755 0.135 290",
  "outline": "0.745 0.010 285",
  "scrim": "0.060 0.006 285",
  "edge": "0.930 0.006 285",
  "light-top": "1 0 0",
  "light-bottom": "0.070 0.008 285",
  "elevation-flat": "none",
  "elevation-raised": "0 1px 2px oklch(var(--sui-light-bottom) / 0.45), 0 3px 8px -2px oklch(var(--sui-light-bottom) / 0.34), inset 0 1px 0 oklch(var(--sui-light-top) / 0.16), inset 0 -1px 0 oklch(var(--sui-light-bottom) / 0.24)",
  "elevation-floating": "0 0 0 1px oklch(var(--sui-light-top) / 0.08), 0 6px 14px -4px oklch(var(--sui-light-bottom) / 0.40), 0 26px 56px -12px oklch(var(--sui-light-bottom) / 0.65), inset 0 1px 0 oklch(var(--sui-light-top) / 0.06)",
  "elevation-control": "0 0 0 0.5px oklch(var(--sui-light-bottom) / 0.40), 0 1px 3px oklch(var(--sui-light-bottom) / 0.45), inset 0 1px 0 oklch(var(--sui-light-top) / 0.09)",
  "elevation-recessed": "inset 0 1px 3px oklch(var(--sui-light-bottom) / 0.42), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.05)",
  "elevation-recessed-top": "inset 0 5px 8px -5px oklch(var(--sui-light-bottom) / 0.40)",
  "elevation-well": "inset 0 2px 4px oklch(var(--sui-light-bottom) / 0.62), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.05)",
  /* In the graphite room a shadow barely reads, so a sheet is lifted by its lit upper lip — a line
     of light — and a deep, short shadow at its foot. */
  "elevation-surface": "0 1px 2px oklch(var(--sui-light-bottom) / 0.45), 0 10px 24px -10px oklch(var(--sui-light-bottom) / 0.70), inset 0 1px 0 oklch(var(--sui-light-top) / 0.10)",
  "key-light": "linear-gradient(180deg, oklch(var(--sui-light-top) / 0.16) 0%, oklch(var(--sui-light-top) / 0) 50%, oklch(var(--sui-light-bottom) / 0.12) 100%)",
  "surface-light": "linear-gradient(180deg, oklch(var(--sui-light-top) / 0.05) 0%, oklch(var(--sui-light-top) / 0) 40%, oklch(var(--sui-light-bottom) / 0.10) 100%)",
  "tray-light": "linear-gradient(180deg, oklch(var(--sui-light-bottom) / 0.70) 0px, oklch(var(--sui-light-bottom) / 0.22) 3px, oklch(var(--sui-light-bottom) / 0) 10px)",
  "glass-fill": "0.98",
  "glass-blur": "32px",
  "glass-saturation": "1.12",
  "glass-brightness": "1.01",
  "glass-dense-fill": "0.99",
  "glass-dense-blur": "26px",
  "glass-dense-saturation": "1.10",
  "glass-dense-brightness": "1.01",
  "glass-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.07) 0%, rgb(255 255 255 / 0.025) 30%, rgb(255 255 255 / 0) 70%, rgb(0 0 0 / 0.10) 100%)",
  "glass-gradient-dense": "linear-gradient(180deg, rgb(255 255 255 / 0.06) 0%, rgb(255 255 255 / 0.018) 36%, rgb(255 255 255 / 0) 76%, rgb(0 0 0 / 0.08) 100%)",
  "glass-hero-blur": "10px",
  "glass-hero-saturation": "1.03",
  "glass-hero-brightness": "1.0",
  "glass-hero-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.035) 0%, rgb(255 255 255 / 0.01) 12%, rgb(255 255 255 / 0) 44%, rgb(0 0 0 / 0.16) 100%)",
  "surface-overlay": "0.272 0.011 285",
  "overlay-fill": "0.99",
  "scrim-blur": "8px",
  "code-text": "#dfdee6",
  "code-comment": "#9d9aa9",
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
  /* The arrival curve: a part that travels a little past where it lands and settles back. It makes a
     new mark feel made, and it is the curve a subordinate part arrives on. The springs below are the
     only other overshooting curves, and each is named for the event it answers. */
  "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /* Sampled damped springs. Each is the step response of a spring written as a `linear()` curve, and
     its duration is the time the spring takes to settle rather than a chosen pace.
     - press:  the release of a pressed control, about 15% of its travel past rest and back (damping
               0.52). A press travels only a few pixels, so the overshoot is a fraction of a pixel
               that reads as a rebound, not a wobble.
     - travel: a selection indicator or a switch thumb crossing its track, about 6% past its stop
               (damping 0.67), so the choice is felt as thrown and caught. */
  "duration-spring-press": "460ms",
  "ease-spring-press": "linear(0, 0.049, 0.172, 0.335, 0.513, 0.683, 0.833, 0.955, 1.045, 1.105, 1.137, 1.148, 1.141, 1.124, 1.1, 1.074, 1.048, 1.026, 1.008, 0.994, 0.985, 0.98, 0.978, 0.979, 0.982, 0.985, 0.989, 0.993, 1)",
  "duration-spring-travel": "420ms",
  "ease-spring-travel": "linear(0, 0.027, 0.097, 0.194, 0.305, 0.42, 0.533, 0.639, 0.733, 0.814, 0.883, 0.938, 0.98, 1.012, 1.034, 1.048, 1.056, 1.059, 1.058, 1.054, 1.048, 1.042, 1.035, 1.028, 1.022, 1.016, 1.012, 1.007, 1)",
} as const satisfies Record<string, string>;

export const themes = {
  light: lightTokens,
  dark: darkTokens,
} as const;
