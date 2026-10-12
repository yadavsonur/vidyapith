const { withUt } = require("uploadthing/tw");

/** @type {import('tailwindcss').Config} */
module.exports = withUt({
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,mdx}',
    './components/**/*.{js,jsx,mdx}',
    './app/**/*.{js,jsx,mdx}',
    './src/**/*.{js,jsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        ink: {
          50: "#f6f6f4",
          100: "#edece7",
          200: "#dbd8d0",
          300: "#c1bcae",
          400: "#9f9986",
          500: "#7b7462",
          600: "#5d5747",
          700: "#443f34",
          800: "#2a2720",
          900: "#181613",
          950: "#0c0b0a",
        },
        parchment: {
          25: "#fdfcf9",
          50: "#faf8f2",
          100: "#f4efe4",
          200: "#e9dfce",
          300: "#dacab4",
          400: "#c7b196",
          500: "#b29676",
        },
        ochre: {
          50: "#fdf8ee",
          100: "#fbf0d8",
          200: "#f5ddb0",
          300: "#eec480",
          400: "#e5a753",
          500: "#d98b2f",
          600: "#ba6f22",
          700: "#96531c",
          800: "#79411b",
          900: "#64361a",
        },
        lapis: {
          50: "#f0f5fa",
          100: "#dfeaf4",
          200: "#c2d7e9",
          300: "#98bcda",
          400: "#679cc7",
          500: "#4680b1",
          600: "#346695",
          700: "#2c527a",
          800: "#274565",
          900: "#1c2e42",
          950: "#121d2b",
        },
        vermilion: {
          50: "#fdf3f2",
          100: "#fbe4e1",
          200: "#f8cdc7",
          300: "#f1aba2",
          400: "#e67d71",
          500: "#d95546",
          600: "#be3b2d",
          700: "#9d2e22",
        },
        sage: {
          50: "#f2f7f3",
          100: "#e1ede3",
          200: "#c4dbc8",
          300: "#9ec2a4",
          400: "#74a37c",
          500: "#55875e",
          600: "#416c49",
          700: "#36573c",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(12, 11, 10, 0.04)",
        card: "0 2px 8px -2px rgba(24, 22, 19, 0.06), 0 1px 3px -1px rgba(24, 22, 19, 0.04)",
        elevated: "0 12px 24px -6px rgba(24, 22, 19, 0.08), 0 4px 10px -2px rgba(24, 22, 19, 0.03)",
        press: "inset 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
});
