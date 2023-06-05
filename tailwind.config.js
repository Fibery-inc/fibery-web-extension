module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      backgroundColor: ["disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
