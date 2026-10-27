const color = (name) => `oklch(var(--sui-${name}) / <alpha-value>)`;

const colorNames = [
  "canvas",
  "surface",
  "surface-high",
  "tray-deep",
  "surface-float",
  "surface-overlay",
  "puck",
  "media",
  "ink",
  "ink-muted",
  "detail",
  "rim",
  "primary",
  "primary-strong",
  "primary-soft",
  "primary-selected",
  "danger-soft",
  "danger-selected",
  "warning-soft",
  "warning-selected",
  "success-soft",
  "success-selected",
  "accent",
  "danger",
  "warning",
  "success",
  "on-primary",
  "on-danger",
  "on-warning",
  "on-success",
  "focus",
  "outline",
  "edge",
  "scrim",
];

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: { preflight: false },
  /* Hover is a pointer response. Every `hover:` variant, including `group-[...]:hover`, compiles
     inside `@media (hover: hover)`, so a tap on a touch screen never leaves a hover tone behind;
     touch answers with press and focus instead (docs/DESIGN_LANGUAGE.md §11). */
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        sherick: Object.fromEntries(colorNames.map((name) => [name, color(name)])),
      },
      backgroundImage: {
        "sherick-glass": "var(--sui-glass-gradient)",
        "sherick-glass-dense": "var(--sui-glass-gradient-dense)",
        "sherick-glass-hero": "var(--sui-glass-hero-gradient)",
      },
      fontFamily: {
        "sherick-mono": "var(--sui-font-mono)",
      },
      boxShadow: {
        "sherick-flat": "var(--sui-elevation-flat)",
        "sherick-raised": "var(--sui-elevation-raised)",
        "sherick-floating": "var(--sui-elevation-floating)",
        "sherick-control": "var(--sui-elevation-control)",
        "sherick-recessed": "var(--sui-elevation-recessed)",
        "sherick-recessed-top": "var(--sui-elevation-recessed-top)",
        "sherick-well": "var(--sui-elevation-well)",
      },
      transitionDuration: {
        press: "var(--sui-duration-press)",
        tactile: "var(--sui-duration-tactile)",
        release: "var(--sui-duration-release)",
        overlay: "var(--sui-duration-overlay)",
        "overlay-exit": "var(--sui-duration-overlay-exit)",
        travel: "var(--sui-duration-travel)",
        sheet: "var(--sui-duration-sheet)",
        "sheet-exit": "var(--sui-duration-sheet-exit)",
        utility: "var(--sui-duration-utility)",
        "utility-exit": "var(--sui-duration-utility-exit)",
      },
      transitionTimingFunction: {
        press: "var(--sui-ease-press)",
        release: "var(--sui-ease-release)",
        exit: "var(--sui-ease-exit)",
        glide: "var(--sui-ease-glide)",
        spring: "var(--sui-ease-spring)",
      },
      /* The one paced loop in the system: a progress bar with no known value sweeps its fill
         across its own track. The travel is a transform, so an endless loop never sits on the
         layout path, and it is measured against the track rather than against the fill, which is
         what keeps the sweep independent of how wide the fill happens to be. A transform is
         physical, so the direction is a value the recipe flips for a right-to-left page;
         `linear` is the timing a loop that never accelerates or settles takes, and the pace is
         the authored `--sui-duration-activity` token. */
      keyframes: {
        "sherick-indeterminate": {
          "0%": { transform: "translateX(calc(-100% * var(--sui-indeterminate-direction, 1)))" },
          "100%": { transform: "translateX(calc(100% * var(--sui-indeterminate-direction, 1)))" },
        },
        /* The reduced-motion form of an activity loop: opacity only, so a spinner, a skeleton or an
           indeterminate fill keeps saying that work is happening without any travel or rotation.
           `breathe` is the slow loop a spinner takes; `soft-pulse` is a skeleton's pulse at a lower
           amplitude, because a block that fades to half is a loud placeholder rather than a quiet one. */
        "sherick-breathe": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "sherick-soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "sherick-indeterminate": "sherick-indeterminate var(--sui-duration-activity) linear infinite",
        "sherick-breathe": "sherick-breathe var(--sui-duration-breathe) var(--sui-ease-pulse) infinite",
        "sherick-soft-pulse": "sherick-soft-pulse var(--sui-duration-pulse) var(--sui-ease-pulse) infinite",
        /* Tailwind's own spin and pulse keyframes, on the system's authored pace and curve. */
        spin: "spin var(--sui-duration-spin) linear infinite",
        pulse: "pulse var(--sui-duration-pulse) var(--sui-ease-pulse) infinite",
      },
    },
  },
};
