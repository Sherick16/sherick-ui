export type ThemeName = "light" | "dark";

/* The palette is "graphite and iris": a graphite ink on a near-white canvas, white sheets, and one
   vivid iris violet that is spent only on what the reader acts on. The neutrals carry a bare trace
   of the accent's hue (285, chroma under 0.015), so they read as true greys yet sit in the same
   family as the accent instead of fighting it; shadows are a violet-graphite umbra for the same
   reason. Every value is measured by the contrast contract (docs/PALETTE.md). */
export const lightTokens = {
  "canvas": "0.970 0.003 290",
  "surface": "0.998 0.001 290",
  "surface-high": "0.934 0.006 290",
  "surface-float": "0.999 0.001 290",
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
  /* The rim of a hollow control — a field, a drop target, an empty checkbox or radio. It is the
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
  "primary-soft": "0.952 0.024 292",
  "primary-selected": "0.905 0.052 292",
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
  /* A contact shadow, not a float: the ambient layer stays close to the control, so a row of raised
     actions sits on the page rather than hovering over it. The inset line is the lit upper lip of a
     key — the light model's upper edge, drawn once — so a filled action reads as a pressable object
     rather than a flat swatch. Floating depth is `elevation-floating`'s. */
  "elevation-raised": "0 1px 1px oklch(var(--sui-light-bottom) / 0.10), 0 2px 5px -1px oklch(var(--sui-light-bottom) / 0.12), inset 0 1px 0 oklch(var(--sui-light-top) / 0.24)",
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
  "canvas": "0.160 0.006 285",
  "surface": "0.200 0.008 285",
  "surface-high": "0.252 0.010 285",
  "surface-float": "0.226 0.009 285",
  "puck": "0.315 0.012 285",
  "media": "0.160 0.006 285",
  "ink": "0.950 0.004 285",
  "ink-muted": "0.745 0.010 285",
  "detail": "0.605 0.010 285",
  "rim": "0.535 0.010 285",
  "primary": "0.780 0.125 292",
  "primary-strong": "0.720 0.160 292",
  "primary-soft": "0.300 0.075 292",
  "primary-selected": "0.375 0.105 292",
  "danger-soft": "0.290 0.060 25",
  "danger-selected": "0.360 0.085 25",
  "warning-soft": "0.300 0.050 75",
  "warning-selected": "0.370 0.070 75",
  "success-soft": "0.290 0.050 160",
  "success-selected": "0.360 0.070 160",
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
  "elevation-raised": "0 1px 2px oklch(var(--sui-light-bottom) / 0.40), 0 3px 8px -2px oklch(var(--sui-light-bottom) / 0.30), inset 0 1px 0 oklch(var(--sui-light-top) / 0.08)",
  "elevation-floating": "0 0 0 1px oklch(var(--sui-light-top) / 0.08), 0 6px 14px -4px oklch(var(--sui-light-bottom) / 0.40), 0 26px 56px -12px oklch(var(--sui-light-bottom) / 0.65), inset 0 1px 0 oklch(var(--sui-light-top) / 0.06)",
  "elevation-control": "0 0 0 0.5px oklch(var(--sui-light-bottom) / 0.40), 0 1px 3px oklch(var(--sui-light-bottom) / 0.45), inset 0 1px 0 oklch(var(--sui-light-top) / 0.09)",
  "elevation-recessed": "inset 0 1px 3px oklch(var(--sui-light-bottom) / 0.42), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.05)",
  "elevation-recessed-top": "inset 0 5px 8px -5px oklch(var(--sui-light-bottom) / 0.40)",
  "elevation-well": "inset 0 2px 4px oklch(var(--sui-light-bottom) / 0.62), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.05)",
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
  "surface-overlay": "0.214 0.008 285",
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
