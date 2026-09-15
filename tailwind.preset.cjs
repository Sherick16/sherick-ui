const color = (name, fallback) =>
  `oklch(var(--sui-${name}, ${fallback}) / <alpha-value>)`;

module.exports = {
  theme: {
    extend: {
      colors: {
        sherick: {
          canvas: color("canvas", "0.205 0.012 260"),
          surface: color("surface", "0.245 0.014 260"),
          "surface-high": color("surface-high", "0.295 0.016 260"),
          "surface-float": color("surface-float", "0.27 0.018 260"),
          ink: color("ink", "0.94 0.008 255"),
          "ink-muted": color("ink-muted", "0.76 0.014 255"),
          primary: color("primary", "0.72 0.15 255"),
          "primary-strong": color("primary-strong", "0.66 0.18 257"),
          "primary-soft": color("primary-soft", "0.42 0.055 257"),
          accent: color("accent", "0.80 0.08 215"),
          danger: color("danger", "0.72 0.13 25"),
          warning: color("warning", "0.82 0.12 80"),
          success: color("success", "0.75 0.10 160"),
          "on-primary": color("on-primary", "0.205 0.012 260"),
          "on-danger": color("on-danger", "0.205 0.012 260"),
          "on-warning": color("on-warning", "0.205 0.012 260"),
          "on-success": color("on-success", "0.205 0.012 260"),
          focus: color("focus", "0.72 0.15 255"),
          outline: color("outline", "0.76 0.014 255"),
          scrim: color("scrim", "0.08 0.01 260"),
        },
      },
      backgroundImage: {
        "sherick-glass":
          "var(--sui-glass-gradient, linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 32%, rgba(112,156,255,0.022) 72%, rgba(255,255,255,0.01) 100%))",
        "sherick-glass-dense":
          "var(--sui-glass-gradient-dense, linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 38%, rgba(112,156,255,0.018) 78%, rgba(255,255,255,0.008) 100%))",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "sherick-soft":
          "var(--sui-shadow-soft, 0 14px 36px -24px rgba(5, 8, 14, 0.42))",
        "sherick-float":
          "var(--sui-shadow-float, 0 28px 72px -34px rgba(5, 8, 14, 0.5), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.11))",
        "sherick-glass":
          "var(--sui-shadow-glass, 0 22px 64px -34px rgba(5, 8, 14, 0.46), inset 1px 1px 0 rgba(255,255,255,0.085), inset -1px -1px 0 rgba(0,0,0,0.10))",
        "sherick-focus":
          "var(--sui-shadow-focus, 0 10px 28px -22px rgba(90, 145, 255, 0.42))",
        "sherick-primary":
          "var(--sui-shadow-primary, 0 12px 30px -22px rgba(82, 139, 255, 0.34))",
      },
      animation: {
        fade: "sherick-fade 140ms ease-out",
        menu: "sherick-menu 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        overlay: "sherick-overlay 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        pop: "sherick-pop 240ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "sherick-slide-up 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "sherick-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "sherick-menu": {
          from: { opacity: "0", transform: "translateY(-4px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "sherick-overlay": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "sherick-pop": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sherick-slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
};
