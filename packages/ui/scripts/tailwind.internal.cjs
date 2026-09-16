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
      },
      animation: {
        "sherick-overlay-in":
          "sherick-overlay-in var(--sui-duration-overlay) var(--sui-ease-release)",
        "sherick-overlay-out":
          "sherick-overlay-out var(--sui-duration-overlay-exit) var(--sui-ease-exit) both",
        "sherick-scrim-in":
          "sherick-scrim-in var(--sui-duration-overlay) var(--sui-ease-release)",
        "sherick-scrim-out":
          "sherick-scrim-out var(--sui-duration-overlay-exit) var(--sui-ease-exit) both",
      },
      keyframes: {
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
