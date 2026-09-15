module.exports = {
  theme: {
    extend: {
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        fade: "sherick-fade 180ms ease-out",
        pop: "sherick-pop 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-up": "sherick-slide-up 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      keyframes: {
        "sherick-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
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
