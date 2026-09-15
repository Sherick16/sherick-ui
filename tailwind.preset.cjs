module.exports = {
  theme: {
    extend: {
      colors: {
        sherick: {
          canvas: "oklch(0.145 0.014 262 / <alpha-value>)",
          surface: "oklch(0.19 0.018 262 / <alpha-value>)",
          "surface-high": "oklch(0.235 0.022 262 / <alpha-value>)",
          "surface-float": "oklch(0.205 0.024 262 / <alpha-value>)",
          ink: "oklch(0.965 0.01 255 / <alpha-value>)",
          "ink-muted": "oklch(0.72 0.018 255 / <alpha-value>)",
          primary: "oklch(0.69 0.185 255 / <alpha-value>)",
          "primary-strong": "oklch(0.625 0.215 257 / <alpha-value>)",
          "primary-soft": "oklch(0.36 0.075 257 / <alpha-value>)",
          accent: "oklch(0.79 0.105 215 / <alpha-value>)",
          danger: "oklch(0.665 0.175 25 / <alpha-value>)",
          warning: "oklch(0.79 0.145 80 / <alpha-value>)",
          success: "oklch(0.72 0.135 160 / <alpha-value>)",
          "on-primary": "oklch(0.985 0.006 255 / <alpha-value>)",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "sherick-soft": "0 12px 32px -20px rgba(0, 0, 0, 0.55)",
        "sherick-float":
          "0 28px 80px -30px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.045)",
        "sherick-primary": "0 14px 34px -20px rgba(72, 132, 255, 0.58)",
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
