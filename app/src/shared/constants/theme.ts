const palette = {
  // Figma brand palette
  brandDark: '#28261F',
  brandDarkSmooth: '#3B382E',
  brandPrimary: '#E7C241',
  brandSecondary: '#41E79A',
  brandWhite: '#ECEBE8',
  brandShadow: '#1F1D15',

  // Nocturne background
  neutral950: '#111118',
  neutral900: '#1D1C2A',
  neutral800: '#28273A',
  neutral700: '#363548',
  neutral500: '#8885A5',
  neutral100: '#F0EEF8',

  // Gold
  gold: '#F0B020',
  goldLight: '#F5C840',

  // Feedback
  positive: '#78DFA0',
  negative: '#F07878',

  // Team Blue
  blue: '#1E6FD9',
  blueLight: '#4B9CF5',
  blueDark: '#0D4FA0',

  // Team Red
  red: '#D93B3B',
  redLight: '#F56B6B',
  redDark: '#A02020',
} as const;

export const colors = {
  background: palette.neutral950,
  surface: palette.neutral900,
  surface2: palette.neutral800,
  border: palette.neutral700,
  textPrimary: palette.neutral100,
  textSecondary: palette.neutral500,
  accent: palette.gold,
  accentLight: palette.goldLight,

  brand: {
    dark: palette.brandDark,
    darkSmooth: palette.brandDarkSmooth,
    primary: palette.brandPrimary,
    secondary: palette.brandSecondary,
    white: palette.brandWhite,
    shadow: palette.brandShadow,
  },

  team: {
    blue: palette.blue,
    blueLight: palette.blueLight,
    blueDark: palette.blueDark,
    red: palette.red,
    redLight: palette.redLight,
    redDark: palette.redDark,
  },

  positive: palette.positive,
  negative: palette.negative,
} as const;

// Minimum 18px — rien en dessous
export const typography = {
  family: {
    display: 'RoadRage_400Regular',
    body: 'GoogleSansFlex_400Regular',
    bodySemibold: 'GoogleSansFlex_600SemiBold',
  },
  size: {
    base: 18,  // minimum absolu — body, labels, notes
    md: 20,    // corps mis en avant
    lg: 24,    // titres d'options, valeurs
    xl: 36,    // titres d'étape, en-têtes de section
    xxl: 44,   // noms de règle, grandes déclarations
    hero: 64,  // titre HomeScreen
    score: 80, // chiffres du score
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const homeTypography = {
  tagline: {
    fontSize: 24,
    lineHeight: 41,
  },
  button: {
    fontSize: 32,
    lineHeight: 54,
  },
  debug: {
    fontSize: 45,
    lineHeight: 54,
  },
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const opacity = {
  disabled: 0.35,
} as const;

export const shadows = {
  title: {
    shadowColor: palette.brandShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  debug: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
