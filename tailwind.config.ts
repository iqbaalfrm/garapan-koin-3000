import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shopee: {
          50: "#fff5f2",
          100: "#ffe8e2",
          200: "#ffd5cb",
          300: "#ffb4a2",
          400: "#ff8266",
          500: "#ee4d2d", // Shopee Signature Orange
          600: "#e23916",
          700: "#c52809",
          800: "#9e230c",
          900: "#7f2210",
        },
      },
    },
  },
  plugins: [],
};
export default config;
