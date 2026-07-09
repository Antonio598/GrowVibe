import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Identidad GrowVibe — crecimiento / energético
        canvas: "#FBFAF7", // fondo cálido
        surface: "#FFFFFF",
        ink: "#17241F", // texto principal
        muted: "#5B6B63", // texto atenuado
        line: "#EAE7DF", // bordes suaves
        primary: {
          DEFAULT: "#15A06B", // verde crecimiento
          dark: "#0C6B47",
          soft: "#E4F5EC", // fondo verde claro
        },
        lime: {
          DEFAULT: "#B6E64A", // acento energía
          dark: "#8FBD2E",
        },
        coral: {
          DEFAULT: "#F0653E", // gastos / alertas / destructivo
          soft: "#FCE6DF",
        },
        gold: "#E8A93B", // prioridad media / avisos
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 36, 31, 0.04), 0 8px 24px -12px rgba(23, 36, 31, 0.10)",
        pop: "0 12px 40px -12px rgba(23, 36, 31, 0.25)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        grow: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        grow: "grow 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
