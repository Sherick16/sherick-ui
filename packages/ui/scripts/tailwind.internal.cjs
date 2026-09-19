const color = (name) => `oklch(var(--sui-${name}) / <alpha-value>)`;

const colorNames = [
  "canvas",
  "surface",
  "surface-high",
  "surface-float",
  "surface-overlay",
  "ink",
  "ink-muted",
  "ink-faint",
  "primary",
  "primary-strong",
  "primary-soft",
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
      boxShadow: {
        "sherick-flat": "var(--sui-elevation-flat)",
        "sherick-raised": "var(--sui-elevation-raised)",
        "sherick-floating": "var(--sui-elevation-floating)",
        "sherick-control": "var(--sui-elevation-control)",
        "sherick-recessed": "var(--sui-elevation-recessed)",
      },
      transitionDuration: {
        press: "var(--sui-duration-press)",
        release: "var(--sui-duration-release)",
        overlay: "var(--sui-duration-overlay)",
        "overlay-exit": "var(--sui-duration-overlay-exit)",
      },
      transitionTimingFunction: {
        press: "var(--sui-ease-press)",
        release: "var(--sui-ease-release)",
        exit: "var(--sui-ease-exit)",
        glide: "var(--sui-ease-glide)",
        spring: "var(--sui-ease-spring)",
      },
      /* The one paced loop in the system: a progress bar with no known value sweeps its fill
         across its own track. It travels a logical edge rather than a transform, so the sweep
         follows the writing direction; `linear` is the timing a loop that never accelerates or
         settles takes, and the pace is the authored `--sui-duration-activity` token. */
      keyframes: {
        "sherick-indeterminate": {
          "0%": { insetInlineStart: "-40%" },
          "100%": { insetInlineStart: "100%" },
        },
      },
      animation: {
        "sherick-indeterminate": "sherick-indeterminate var(--sui-duration-activity) linear infinite",
      },
    },
  },
};
