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
        background: "#FFFFFF",
        foreground: "#1D1D1F",
        primary: "#FFFFFF",
        accent: "#F5F5F7",
        text: "#1D1D1F",
        cta: "#0066CC",
      },
      fontFamily: {
        heading: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-roboto)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "sans-serif"],
      },
      transitionTimingFunction: {
        'clean-room': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
};
export default config;
