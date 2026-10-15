import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cinzel)", "Palatino Linotype", "serif"],
        sans: ["var(--font-rajdhani)", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
