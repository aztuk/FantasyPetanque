import { colors } from '../../../shared/constants';

export const gameUiColors = {
  background: colors.dark,
  backgroundTransparent: 'rgba(40,38,31,0)',
  divider: colors.darkSmooth,
  muted: colors.textSmooth,
  primary: colors.primary,
  secondary: colors.secondary,
  primaryTransparent: 'rgba(231,194,65,0)',
  primaryGlow: 'rgba(231,194,65,0.22)',
  primaryReflection: 'rgba(255,238,170,0.34)',
  white: colors.white,
  green: colors.secondary,
  blueSurface: colors.team.blue,
  blueDark: colors.team.blueDark,
  blueText: colors.team.blueText,
  redSurface: colors.team.red,
  redDark: colors.team.redDark,
  redText: colors.team.redText,
  darkOverlay: colors.darkSmoother,
} as const;

export const gameUiMotion = {
  curves: {
    premium: [0.16, 1, 0.3, 1],
  },
} as const;
