module.exports = {
  theme: {
    extend: {
      colors: {
        sherick: {
          canvas: "oklch(0.205 0.012 260 / <alpha-value>)",
          surface: "oklch(0.245 0.014 260 / <alpha-value>)",
          "surface-high": "oklch(0.295 0.016 260 / <alpha-value>)",
          "surface-float": "oklch(0.27 0.018 260 / <alpha-value>)",
          ink: "oklch(0.94 0.008 255 / <alpha-value>)",
          "ink-muted": "oklch(0.76 0.014 255 / <alpha-value>)",
          primary: "oklch(0.72 0.15 255 / <alpha-value>)",
          "primary-strong": "oklch(0.66 0.18 257 / <alpha-value>)",
          "primary-soft": "oklch(0.42 0.055 257 / <alpha-value>)",
          accent: "oklch(0.80 0.08 215 / <alpha-value>)",
          danger: "oklch(0.72 0.13 25 / <alpha-value>)",
          warning: "oklch(0.82 0.12 80 / <alpha-value>)",
          success: "oklch(0.75 0.10 160 / <alpha-value>)",
          "on-primary": "oklch(0.98 0.005 255 / <alpha-value>)",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "sherick-soft": "0 14px 36px -24px rgba(5, 8, 14, 0.42)",
        "sherick-float":
          "0 30px 84px -34px rgba(5, 8, 14, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "sherick-primary": "0 12px 30px -22px rgba(82, 139, 255, 0.34)",
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
