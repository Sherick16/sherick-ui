const color = (name) => `oklch(var(--sui-${name}) / <alpha-value>)`;

const colorNames = [
  "canvas",
  "surface",
  "surface-high",
  "surface-float",
  "surface-overlay",
  "ink",
  "ink-muted",
  "detail",
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
        "sherick-recessed-top": "var(--sui-elevation-recessed-top)",
        "sherick-well": "var(--sui-elevation-well)",
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
      },
      animation: {
        "sherick-indeterminate": "sherick-indeterminate var(--sui-duration-activity) linear infinite",
      },
    },
  },
};
