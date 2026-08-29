import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf4",
          100: "#d7f9e3",
          200: "#b2f0cb",
          300: "#7de3ac",
          400: "#43cd88",
          500: "#1fb36e",
          600: "#149059",
          700: "#12734a",
          800: "#135b3d",
          900: "#124a34",
          950: "#062a1d",
        },
        ink: {
          900: "#0b0f0d",
          800: "#121712",
          700: "#1b231c",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "Segoe UI", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
