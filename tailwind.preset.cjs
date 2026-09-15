module.exports = {
  theme: {
    extend: {
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        fade: "sherick-fade 0.2s ease-out",
      },
      keyframes: {
        "sherick-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
};
