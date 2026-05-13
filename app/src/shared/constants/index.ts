export * from './theme';
export { colors, typography, homeTypography, spacing, radius, opacity, shadows } from './theme';

import { colors } from './theme';

export const WINNING_SCORE = 13;

export const TEAM_COLORS = {
  blue: colors.team.blue,
  red: colors.team.red,
  blueLight: colors.team.blueLight,
  redLight: colors.team.redLight,
  blueDark: colors.team.blueDark,
  redDark: colors.team.redDark,
};

export const TEAM_LABELS: Record<string, string> = {
  blue: 'Bleu',
  red: 'Rouge',
};

// Legacy flat exports — kept for backward compatibility
export const BACKGROUND = colors.background;
export const SURFACE = colors.surface;
export const SURFACE_2 = colors.surface2;
export const TEXT_PRIMARY = colors.textPrimary;
export const TEXT_SECONDARY = colors.textSecondary;
export const ACCENT = colors.accent;
