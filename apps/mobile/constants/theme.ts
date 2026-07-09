// Tokens de la identidad GrowVibe (crecimiento / energético) para móvil.
export const theme = {
  colors: {
    canvas: "#FBFAF7",
    surface: "#FFFFFF",
    ink: "#17241F",
    muted: "#5B6B63",
    line: "#EAE7DF",
    primary: "#15A06B",
    primaryDark: "#0C6B47",
    primarySoft: "#E4F5EC",
    lime: "#B6E64A",
    limeDark: "#8FBD2E",
    coral: "#F0653E",
    coralSoft: "#FCE6DF",
    gold: "#E8A93B",
    white: "#FFFFFF",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 999 },
  space: (n: number) => n * 4,
};

export type Theme = typeof theme;
