import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#F5F5F0",
        surface: "#121214",
        elevated: "#1A1A1E",
        glass: "rgba(26, 26, 30, 0.6)",
        "glass-border": "rgba(255, 255, 255, 0.08)",
        "glass-border-hover": "rgba(255, 255, 255, 0.12)",
        "text-secondary": "rgba(255, 255, 255, 0.6)",
        "text-tertiary": "rgba(255, 255, 255, 0.35)",
        nyaya: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#baddfd",
          300: "#7ec2fc",
          400: "#3ba3f9",
          500: "#0A84FF",
          600: "#0066d6",
          700: "#0050a4",
          800: "#004185",
          900: "#00376e",
        },
        amber: {
          50: "#fff8e6",
          100: "#feefc3",
          200: "#fdde8a",
          300: "#fcc747",
          400: "#fbb117",
          500: "#D4AF37",
          600: "#b08c0a",
          700: "#8a6b05",
          800: "#6a5208",
          900: "#55430a",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        display: ["Outfit", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
        dramatic: ["Cormorant Garamond", "serif"],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(10, 132, 255, 0.2)',
        'glow-amber': '0 0 20px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
