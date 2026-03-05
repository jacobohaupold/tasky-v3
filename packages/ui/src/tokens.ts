/**
 * Design tokens — Tasky Design System
 * These match the CSS custom properties in globals.css
 */

export const colors = {
  bg: "#F8FAFC",
  surface1: "#FFFFFF",
  surface2: "#F1F5F9",
  border: "#E2E8F0",
  text: "#1E1E2E",
  muted: "#6B7280",
  accent: "#4F46E5",
  accentHover: "#4338CA",
  accentLime: "#84CC16",
  accentTeal: "#0D9488",

  dark: {
    bg: "#0F0F1A",
    surface1: "#1A1A2E",
    surface2: "#252541",
    border: "#2D2D4E",
    text: "#E8E8F0",
    muted: "#9898B0",
  },
} as const;

export const typography = {
  fontHeading: '"Space Grotesk", ui-sans-serif, sans-serif',
  fontSans: '"Inter", ui-sans-serif, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',

  sizes: {
    h1: "2.125rem",   // 34px
    h2: "1.5rem",     // 24px
    h3: "1.125rem",   // 18px
    body: "0.875rem", // 14px
    label: "0.75rem", // 12px
    code: "0.8125rem", // 13px
  },

  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  unit: 8, // 8pt grid base
} as const;

export const radius = {
  xs: "6px",
  sm: "10px",
  md: "14px",
  lg: "18px",
  xl: "24px",
  pill: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.08)",
  md: "0 4px 12px rgba(0,0,0,0.10)",
  lg: "0 8px 24px rgba(0,0,0,0.12)",
} as const;

export const motion = {
  duration: {
    fast: 150,
    base: 200,
    slow: 280,
  },
  ease: {
    bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
    in:     [0.4, 0, 1, 1] as [number, number, number, number],
    out:    [0, 0, 0.2, 1] as [number, number, number, number],
  },
} as const;
