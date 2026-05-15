/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ffffff',
          foreground: '#09090b',
        },
        background: '#09090b',
        foreground: '#fafafa',
        card: {
          DEFAULT: '#09090b',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fafafa',
        },
        border: '#27272a',
        input: '#27272a',
        ring: '#d4d4d8',
        textPrimary: '#fafafa',
        textSecondary: '#a1a1aa',
        borderC: '#27272a',
        errorC: '#ef4444',
        inputBackground: '#18181b',
      }
    },
  },
  plugins: [],
}
