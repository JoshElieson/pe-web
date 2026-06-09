/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          navy: "#050810",
          grid: "rgba(100, 140, 180, 0.14)",
          accent: "rgba(125, 211, 252, 0.85)",
          glow: "rgba(56, 189, 248, 0.35)",
        },
      },
      animation: {
        "forge-grid-drift": "forge-grid-drift 24s linear infinite",
        "forge-scan": "forge-scan 10s ease-in-out infinite",
        "forge-scan-slow": "forge-scan 16s ease-in-out infinite reverse",
        "forge-bloom": "forge-bloom 12s ease-in-out infinite",
      },
      keyframes: {
        "forge-grid-drift": {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "0 56px, 56px 0" },
        },
        "forge-scan": {
          "0%": { transform: "translateX(-120%) skewX(-12deg)", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { transform: "translateX(120%) skewX(-12deg)", opacity: "0" },
        },
        "forge-bloom": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.65", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};
