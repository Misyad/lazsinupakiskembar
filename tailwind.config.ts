import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf5",
          100: "#d8f5e4",
          500: "#1f9d5a",
          600: "#157f47",
          700: "#11663b"
        },
        ink: "#17211b",
        paper: "#f7faf7"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(23, 33, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
