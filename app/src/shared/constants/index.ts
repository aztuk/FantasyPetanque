export * from './theme';
export { colors, typography, figmaTextStyles, textStyles, spacing, radius, opacity, shadows, componentSizes } from './theme';

import { colors } from './theme';

export const WINNING_SCORE = 13;

export const TEAM_COLORS = {
  blue:     colors.team.blue,
  red:      colors.team.red,
  blueText: colors.team.blueText,
  redText:  colors.team.redText,
  blueDark: colors.team.blueDark,
  redDark:  colors.team.redDark,
};

export const TEAM_LABELS: Record<string, string> = {
  blue: 'Bleu',
  red: 'Rouge',
};

// Legacy flat exports — AppNavigator and a few screens still use these
export const BACKGROUND   = colors.dark;
export const TEXT_PRIMARY  = colors.white;
