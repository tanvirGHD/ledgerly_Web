/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
        },
        paper: {
          100: "rgb(var(--paper-100) / <alpha-value>)",
          200: "rgb(var(--paper-200) / <alpha-value>)",
          400: "rgb(var(--paper-400) / <alpha-value>)",
          600: "rgb(var(--paper-600) / <alpha-value>)",
        },
        gold: {
          400: "rgb(var(--gold-400) / <alpha-value>)",
          500: "rgb(var(--gold-500) / <alpha-value>)",
          600: "rgb(var(--gold-600) / <alpha-value>)",
        },
        sage: {
          400: "rgb(var(--sage-400) / <alpha-value>)",
          500: "rgb(var(--sage-500) / <alpha-value>)",
          600: "rgb(var(--sage-600) / <alpha-value>)",
        },
        brick: {
          400: "rgb(var(--brick-400) / <alpha-value>)",
          500: "rgb(var(--brick-500) / <alpha-value>)",
          600: "rgb(var(--brick-600) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "Noto Sans Bengali", "Inter", "sans-serif"],
        sans: ["Inter", "Noto Sans Bengali", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "12px",
        "2xl": "12px",
      },
    },
  },
  plugins: [],
};
