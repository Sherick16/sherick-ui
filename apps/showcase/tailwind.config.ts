import type { Config } from "tailwindcss";

const color = (name: string) => `oklch(var(--sui-${name}) / <alpha-value>)`;
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
] as const;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sherick: Object.fromEntries(colorNames.map((name) => [name, color(name)])),
      },
      backgroundImage: {
        "sherick-glass": "var(--sui-glass-gradient)",
        "sherick-glass-dense": "var(--sui-glass-gradient-dense)",
        "sherick-glass-hero": "var(--sui-glass-hero-gradient)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
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
    },
  },
  plugins: [],
};

export default config;
