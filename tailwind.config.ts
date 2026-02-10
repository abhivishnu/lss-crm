import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Lone Star Scholars brand colors extracted from logo
        brand: {
          navy: "#1B2D6E",       // Primary deep blue
          "navy-light": "#2A3F8F",
          "navy-dark": "#111D4A",
          gold: "#E8A838",        // Secondary warm gold
          "gold-light": "#F0C060",
          "gold-dark": "#C88A20",
          gray: "#8A8A8A",        // Neutral from staircase
          "gray-light": "#B0B0B0",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
