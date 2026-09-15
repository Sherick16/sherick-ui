const color = (name, fallback) =>
  `oklch(var(--sui-${name}, ${fallback}) / <alpha-value>)`;

/* Dark-theme fallbacks. `theme.css` is the source of truth; these values only keep
   consumers that skip the stylesheet on a dark-scheme surface instead of collapsing
   to unstyled output. They mirror the `[data-sherick-theme="dark"]` block. */
const DARK = {
  canvas: "0.205 0.012 260",
  surface: "0.245 0.014 260",
  "surface-high": "0.295 0.016 260",
  "surface-float": "0.27 0.018 260",
  "surface-overlay": "0.262 0.013 260",
  ink: "0.94 0.008 255",
  "ink-muted": "0.76 0.014 255",
  "ink-faint": "0.60 0.014 256",
  primary: "0.72 0.15 255",
  "primary-strong": "0.66 0.18 257",
  "primary-soft": "0.42 0.055 257",
  accent: "0.80 0.08 215",
  danger: "0.72 0.13 25",
  warning: "0.82 0.12 80",
  success: "0.75 0.10 160",
  "on-primary": "0.205 0.012 260",
  "on-danger": "0.205 0.012 260",
  "on-warning": "0.205 0.012 260",
  "on-success": "0.205 0.012 260",
  focus: "0.72 0.15 255",
  outline: "0.76 0.014 255",
  edge: "0.92 0.01 256",
  scrim: "0.08 0.01 260",
};

module.exports = {
  theme: {
    extend: {
      /* Tonality roles. Components name a role (`text-sherick-ink-muted`), never a
         raw color, so a theme swap re-tunes the whole library. */
      colors: {
        sherick: Object.fromEntries(
          Object.entries(DARK).map(([name, fallback]) => [name, color(name, fallback)])
        ),
      },
      backgroundImage: {
        "sherick-glass":
          "var(--sui-glass-gradient, linear-gradient(180deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.028) 30%, rgba(112,156,255,0.02) 70%, rgba(0,0,0,0.10) 100%))",
        "sherick-glass-dense":
          "var(--sui-glass-gradient-dense, linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 36%, rgba(112,156,255,0.016) 76%, rgba(0,0,0,0.08) 100%))",
        "sherick-glass-hero":
          "var(--sui-glass-hero-gradient, linear-gradient(180deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.009) 12%, rgba(255,255,255,0) 44%, rgba(0,0,0,0.16) 100%))",
      },
      /* Elevation ladder — the only sanctioned source of depth, and the only place a
         shadow is defined. Shadow is a function of how far a surface sits above the
         ground, never per-component decoration:
           flat      matte surfaces that separate by tone alone
           raised    a manipulated control, lifted a hair above its own track
           floating  acrylic surfaces above the application
           control   the resting half of the tactile pair, for a part the user moves
           pressed   the recessed half: physically pressed, or a track/groove
         `sherick-grounded`, `sherick-focus` and `sherick-primary` are retained from
         1.0.x so an existing consumer's markup keeps its styling. */
      boxShadow: {
        "sherick-flat": "var(--sui-elevation-flat, none)",
        "sherick-grounded": "var(--sui-elevation-grounded, var(--sui-elevation-flat, none))",
        "sherick-raised":
          "var(--sui-elevation-raised, 0 1px 2px rgba(0, 0, 0, 0.26), 0 4px 12px rgba(0, 0, 0, 0.15))",
        "sherick-floating":
          "var(--sui-elevation-floating, 0 18px 44px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.05))",
        "sherick-control":
          "var(--sui-elevation-control, 0 1px 2px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08))",
        "sherick-pressed":
          "var(--sui-elevation-pressed, inset 0 1px 3px rgba(0, 0, 0, 0.38), inset 0 -1px 0 rgba(255, 255, 255, 0.06))",
        "sherick-focus":
          "var(--sui-shadow-focus, 0 10px 28px -22px rgba(90, 145, 255, 0.42))",
        "sherick-primary":
          "var(--sui-shadow-primary, 0 12px 30px -22px rgba(82, 139, 255, 0.34))",
      },
      /* Motion families. Durations and easings are tokens, so retiming the library is
         a token edit: `press` is the fast response to a press or a tonality change,
         `release` is the expressive settle when a control is released or a selection
         moves, `overlay` covers anything that floats above the page.
         Entry animations use the individual `translate`/`scale` properties on purpose:
         the `transform` shorthand would override positioning utilities such as
         `-translate-x-1/2` for the duration of the animation, so anchored popups would
         jump and then snap once the animation ends. */
      transitionDuration: {
        press: "var(--sui-duration-press, 150ms)",
        release: "var(--sui-duration-release, 200ms)",
        overlay: "var(--sui-duration-overlay, 240ms)",
        "overlay-exit": "var(--sui-duration-overlay-exit, 160ms)",
      },
      transitionTimingFunction: {
        press: "var(--sui-ease-press, cubic-bezier(0.4, 0, 0.2, 1))",
        release: "var(--sui-ease-release, cubic-bezier(0.16, 1, 0.3, 1))",
        exit: "var(--sui-ease-exit, cubic-bezier(0.4, 0, 1, 1))",
      },
      animation: {
        "sherick-overlay-in":
          "sherick-overlay-in var(--sui-duration-overlay, 240ms) var(--sui-ease-release, cubic-bezier(0.16, 1, 0.3, 1))",
        "sherick-overlay-out":
          "sherick-overlay-out var(--sui-duration-overlay-exit, 160ms) var(--sui-ease-exit, cubic-bezier(0.4, 0, 1, 1)) both",
        "sherick-scrim-in":
          "sherick-scrim-in var(--sui-duration-overlay, 240ms) var(--sui-ease-release, cubic-bezier(0.16, 1, 0.3, 1))",
        "sherick-scrim-out":
          "sherick-scrim-out var(--sui-duration-overlay-exit, 160ms) var(--sui-ease-exit, cubic-bezier(0.4, 0, 1, 1)) both",
      },
      keyframes: {
        /* Entrance and exit geometry is contextual: an overlay sets
           `--sui-overlay-from-scale` and `--sui-overlay-from-lift` where it starts
           from, so a menu can grow from its trigger, a tooltip can lean out of the
           edge it is anchored to and a dialog can rise into place, while all of them
           keep one duration, one easing and one exit. */
        "sherick-overlay-in": {
          from: {
            opacity: "0",
            scale: "var(--sui-overlay-from-scale, 0.98)",
            translate: "0 var(--sui-overlay-from-lift, 0px)",
          },
          to: { opacity: "1", scale: "1", translate: "0 0" },
        },
        "sherick-overlay-out": {
          from: { opacity: "1", scale: "1", translate: "0 0" },
          to: {
            opacity: "0",
            scale: "var(--sui-overlay-from-scale, 0.98)",
            translate: "0 var(--sui-overlay-from-lift, 0px)",
          },
        },
        "sherick-scrim-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "sherick-scrim-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
    },
  },
};
