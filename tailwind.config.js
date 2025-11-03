/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0d1117",
        surface: "#161b22",
        accent: "#58a6ff",
        accentMuted: "#1f6feb",
        textPrimary: "#c9d1d9",
        textSecondary: "#8b949e",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 40px rgba(88, 166, 255, 0.2)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
