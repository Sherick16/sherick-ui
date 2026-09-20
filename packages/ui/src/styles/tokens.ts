export type ThemeName = "light" | "dark";

export const lightTokens = {
  "canvas": "0.965 0.008 255",
  "surface": "0.985 0.006 255",
  "surface-high": "0.925 0.014 255",
  "surface-float": "0.992 0.006 255",
  "ink": "0.245 0.018 260",
  "ink-muted": "0.480 0.018 260",
  /* The detail role is non-text furniture: it carries a mark, a rail or a gutter, and it is not a
     third step of the text ladder. It answers to the 3:1 non-text requirement wherever it carries
     meaning; anything a reader must read uses `ink` or `ink-muted`. */
  /* The rim an empty mark draws sits in the opaque neutral well, so it answers to that surface too:
     a step deeper than the matte steps need, and the same value in both themes. */
  "detail": "0.600 0.016 258",
  "primary": "0.422 0.139 255",
  "primary-strong": "0.402 0.143 257",
  "primary-soft": "0.91 0.035 255",
  "accent": "0.62 0.10 215",
  "danger": "0.439 0.170 25",
  "warning": "0.388 0.082 75",
  "success": "0.381 0.086 160",
  "on-primary": "0.985 0.005 255",
  "on-danger": "0.985 0.005 255",
  "on-warning": "0.985 0.005 255",
  "on-success": "0.985 0.005 255",
  "focus": "0.422 0.139 255",
  "outline": "0.50 0.018 260",
  "scrim": "0.16 0.01 260",
  "edge": "0.42 0.02 258",
  "light-top": "1 0 0",
  "light-bottom": "0.32 0.02 256",
  "elevation-flat": "none",
  "elevation-raised": "0 1px 2px oklch(var(--sui-light-bottom) / 0.16), 0 4px 13px oklch(var(--sui-light-bottom) / 0.09)",
  "elevation-floating": "0 16px 40px oklch(var(--sui-light-bottom) / 0.20), inset 0 1px 0 oklch(var(--sui-light-top) / 0.70)",
  "elevation-control": "0 1px 2px oklch(var(--sui-light-bottom) / 0.19), inset 0 1px 0 oklch(var(--sui-light-top) / 0.55)",
  /* The recessed rung, and the deeper rung a *small* well takes. Same recipe, same two soft walls at
     the same offsets and blur — a well differs from a groove in *depth*, never in kind. It is deeper
     because a wide groove and a track are read from their own fill and a mark the size of a glyph has
     no fill step to spare: the tightest step this neutral ladder has measures about 1.3:1 against the
     surface around it, so its depth is what says what it is. The strength is the least that clears
     3:1 once rendered, so the two rungs look as alike as they can and still be legible. */
  "elevation-recessed": "inset 0 1px 3px oklch(var(--sui-light-bottom) / 0.22), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.50)",
  "elevation-well": "inset 0 3px 5px oklch(var(--sui-light-bottom) / 0.66), inset 0 -3px 5px oklch(var(--sui-light-top) / 0.62)",
  "glass-fill": "0.86",
  "glass-blur": "28px",
  "glass-saturation": "1.06",
  "glass-brightness": "1.012",
  "glass-dense-fill": "0.90",
  "glass-dense-blur": "22px",
  "glass-dense-saturation": "1.05",
  "glass-dense-brightness": "1.008",
  "glass-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.76) 0%, rgb(255 255 255 / 0.30) 30%, rgb(112 156 224 / 0.05) 70%, rgb(38 46 62 / 0.05) 100%)",
  "glass-gradient-dense": "linear-gradient(180deg, rgb(255 255 255 / 0.68) 0%, rgb(255 255 255 / 0.24) 36%, rgb(112 156 224 / 0.04) 76%, rgb(38 46 62 / 0.045) 100%)",
  "glass-hero-blur": "14px",
  "glass-hero-saturation": "1.06",
  "glass-hero-brightness": "1.0",
  "glass-hero-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.42) 0%, rgb(255 255 255 / 0.12) 14%, rgb(255 255 255 / 0) 46%, rgb(38 46 62 / 0.05) 100%)",
  "surface-overlay": "0.993 0.005 258",
  "overlay-fill": "0.9",
  "scrim-blur": "6px",
  "code-text": "oklch(0.30 0.018 260)",
  "code-comment": "oklch(0.56 0.015 255)",
  "code-string": "oklch(0.48 0.11 235)",
  "code-number": "oklch(0.52 0.14 55)",
  "code-keyword": "oklch(0.50 0.15 305)",
  "code-function": "oklch(0.50 0.15 25)",
  "code-tag": "oklch(0.48 0.12 220)",
} as const satisfies Record<string, string>;

export const darkTokens = {
  "canvas": "0.205 0.012 260",
  "surface": "0.245 0.014 260",
  "surface-high": "0.295 0.016 260",
  "surface-float": "0.27 0.018 260",
  "ink": "0.94 0.008 255",
  "ink-muted": "0.76 0.014 255",
  "detail": "0.600 0.014 256",
  "primary": "0.809 0.098 255",
  "primary-strong": "0.734 0.139 257",
  "primary-soft": "0.42 0.055 257",
  "accent": "0.80 0.08 215",
  "danger": "0.799 0.115 25",
  "warning": "0.82 0.12 80",
  "success": "0.769 0.100 160",
  "on-primary": "0.205 0.012 260",
  "on-danger": "0.205 0.012 260",
  "on-warning": "0.205 0.012 260",
  "on-success": "0.205 0.012 260",
  "focus": "0.809 0.098 255",
  "outline": "0.76 0.014 255",
  "scrim": "0.08 0.01 260",
  "edge": "0.92 0.01 256",
  "light-top": "1 0 0",
  "light-bottom": "0.12 0.012 260",
  "elevation-flat": "none",
  "elevation-raised": "0 1px 2px oklch(var(--sui-light-bottom) / 0.26), 0 4px 12px oklch(var(--sui-light-bottom) / 0.15)",
  "elevation-floating": "0 18px 44px oklch(var(--sui-light-bottom) / 0.38), inset 0 1px 0 oklch(var(--sui-light-top) / 0.05)",
  "elevation-control": "0 1px 2px oklch(var(--sui-light-bottom) / 0.30), inset 0 1px 0 oklch(var(--sui-light-top) / 0.08)",
  "elevation-recessed": "inset 0 1px 3px oklch(var(--sui-light-bottom) / 0.38), inset 0 -1px 0 oklch(var(--sui-light-top) / 0.06)",
  /* Dark mode inverts the light, so it inverts which wall of a sunk mark is legible: the shade tone
     is darker than the surface here and cannot outline anything, and the lit lower wall is the wall
     that reads. Same rung, same recipe shape, the other end of the same model. */
  "elevation-well": "inset 0 3px 5px oklch(var(--sui-light-bottom) / 0.42), inset 0 -3px 5px oklch(var(--sui-light-top) / 0.45)",
  "glass-fill": "0.90",
  "glass-blur": "32px",
  "glass-saturation": "1.10",
  "glass-brightness": "1.01",
  "glass-dense-fill": "0.96",
  "glass-dense-blur": "26px",
  "glass-dense-saturation": "1.08",
  "glass-dense-brightness": "1.01",
  "glass-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.075) 0%, rgb(255 255 255 / 0.028) 30%, rgb(112 156 255 / 0.02) 70%, rgb(0 0 0 / 0.10) 100%)",
  "glass-gradient-dense": "linear-gradient(180deg, rgb(255 255 255 / 0.06) 0%, rgb(255 255 255 / 0.018) 36%, rgb(112 156 255 / 0.016) 76%, rgb(0 0 0 / 0.08) 100%)",
  "glass-hero-blur": "10px",
  "glass-hero-saturation": "1.03",
  "glass-hero-brightness": "1.0",
  "glass-hero-gradient": "linear-gradient(180deg, rgb(255 255 255 / 0.028) 0%, rgb(255 255 255 / 0.009) 12%, rgb(255 255 255 / 0) 44%, rgb(0 0 0 / 0.16) 100%)",
  "surface-overlay": "0.236 0.012 260",
  "overlay-fill": "0.965",
  "scrim-blur": "6px",
  "code-text": "#e2e8f0",
  "code-comment": "#64748b",
  "code-string": "#a5d6ff",
  "code-number": "#f97316",
  "code-keyword": "#c084fc",
  "code-function": "#ff7b72",
  "code-tag": "#7dd3fc",
} as const satisfies Record<keyof typeof lightTokens, string>;

export const sharedTokens = {
  "duration-press": "150ms",
  "duration-release": "200ms",
  "duration-overlay": "240ms",
  "duration-overlay-exit": "160ms",
  /* Continuous activity runs for as long as the work does: a spinner's loop has no duration of
     its own, but a sweep across a track is paced, so the one loop that is timed is authored
     here with the rest of the system's timing. It is a pace, not a response, so it is the one
     duration that never shortens for a press or a release. */
  "duration-activity": "1400ms",
  "ease-press": "cubic-bezier(0.4, 0, 0.2, 1)",
  "ease-release": "cubic-bezier(0.16, 1, 0.3, 1)",
  "ease-exit": "cubic-bezier(0.4, 0, 1, 1)",
  /* A persistent object travelling between two stable destinations — a tab indicator, a switch
     thumb. `ease-release` is an arrival curve: it spends 90% of a travel in the first third of
     the time, which reads as a teleport followed by a creep once the distance is large. The
     glide curve leaves the old position gently, crosses the middle of the travel in the middle
     of the time, and settles at the end, so the movement itself is what the eye sees. It never
     overshoots. */
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
