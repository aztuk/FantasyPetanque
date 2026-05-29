import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import AnimatedNumber from 'react-native-animated-numbers';
import { Team } from '../../../domain/game/models';
import { componentSizes, figmaTextStyles, radius } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  scores: Record<Team, number>;
  roundPoints?: Record<Team, number>;
  modifierPoints?: Partial<Record<Team, number>>;
  roundNumber?: number;
  badgeLabel?: string;
  badgeTeam?: Team | null;
  variant?: 'default' | 'drawer' | 'totalSummary';
  compact?: boolean;
  showTotals?: boolean;
  showRoundBar?: boolean;
  onTeamPress?: (team: Team) => void;
  style?: StyleProp<ViewStyle>;
}

const TEAM_UI = {
  blue: {
    surface: gameUiColors.blueSurface,
    dark: gameUiColors.blueDark,
    text: gameUiColors.blueText,
    testID: 'score-block-blue',
  },
  red: {
    surface: gameUiColors.redSurface,
    dark: gameUiColors.redDark,
    text: gameUiColors.redText,
    testID: 'score-block-red',
  },
} as const;

function FloatingModifier({ value, team }: { value: number; team: Team }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -7, duration: 900, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  return (
    <Animated.Text
      style={[
        styles.modifierText,
        team === 'blue' ? styles.modifierBlue : styles.modifierRed,
        { transform: [{ translateY: floatAnim }] },
      ]}
      testID={`score-modifier-${team}`}
    >
      {value > 0 ? `+${value}` : String(value)}
    </Animated.Text>
  );
}

function formatBadge(roundNumber?: number, badgeLabel?: string) {
  if (badgeLabel) return badgeLabel;
  if (roundNumber === undefined) return null;
  return `Mène ${String(roundNumber).padStart(2, '0')}`;
}

export function GameScoreBoard({
  scores,
  roundPoints,
  modifierPoints,
  roundNumber,
  badgeLabel,
  badgeTeam = null,
  variant = 'default',
  compact = false,
  showTotals = true,
  showRoundBar = true,
  onTeamPress,
  style,
}: Props) {
  const badge = formatBadge(roundNumber, badgeLabel);
  const isDrawer = variant === 'drawer';
  const isTotalSummary = variant === 'totalSummary';
  const shouldShowRoundBar = isDrawer ? true : isTotalSummary ? false : showRoundBar;
  const shouldShowTotals = isDrawer ? false : isTotalSummary ? true : showTotals;

  return (
    <View
      testID="game-score-board"
      style={[
        styles.board,
        shouldShowRoundBar ? (compact ? styles.compact : styles.full) : undefined,
        isDrawer && styles.drawerBoard,
        isTotalSummary && styles.totalSummaryBoard,
        style,
      ]}
    >
      {(['blue', 'red'] as const).map((team) => {
        const ui = TEAM_UI[team];
        const meneValue = roundPoints ? roundPoints[team] : scores[team];
        const modifierValue = modifierPoints?.[team] ?? 0;

        const content = (
          <View style={[styles.teamColumn, isDrawer && styles.drawerTeamColumn, isTotalSummary && styles.summaryTeamColumn]}>
            {shouldShowRoundBar && (
              <View style={[styles.mene, isDrawer && styles.drawerMene, { backgroundColor: ui.surface }]}>
                <AnimatedNumber
                  animateToNumber={meneValue}
                  fontStyle={styles.meneText}
                  animationDuration={300}
                  easing={Easing.out(Easing.cubic)}
                  containerStyle={styles.meneContainer}
                />
                {modifierValue !== 0 && (
                  <FloatingModifier value={modifierValue} team={team} />
                )}
              </View>
            )}
            {shouldShowTotals && (
              <View
                style={[
                  styles.total,
                  isTotalSummary ? styles.totalSummary : styles.totalDefault,
                  { backgroundColor: ui.dark },
                ]}
              >
                <AnimatedNumber
                  animateToNumber={scores[team]}
                  fontStyle={isTotalSummary ? styles.summaryTotalText : styles.totalText}
                  animationDuration={300}
                  easing={Easing.out(Easing.cubic)}
                  containerStyle={styles.totalContainer}
                />
              </View>
            )}
          </View>
        );

        if (onTeamPress) {
          return (
            <Pressable
              key={team}
              style={styles.teamWrapper}
              onPressIn={() => onTeamPress(team)}
              accessibilityRole="button"
              accessibilityLabel={`${team === 'blue' ? 'Bleu' : 'Rouge'} score ${scores[team]}`}
              testID={ui.testID}
            >
              {content}
            </Pressable>
          );
        }

        return (
          <View key={team} style={styles.teamWrapper} testID={ui.testID}>
            {content}
          </View>
        );
      })}

      {badge && (
        <View style={[styles.badge, isTotalSummary && styles.totalSummaryBadge]}>
          <View style={styles.badgeInner}>
            <Text
              style={[
                styles.badgeText,
                badgeTeam ? { color: TEAM_UI[badgeTeam].text } : null,
              ]}
              numberOfLines={1}
            >
              {badge.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  board: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
    position: 'relative',
    backgroundColor: gameUiColors.background,
  },
  full: {},
  compact: {
    height: componentSizes.compactScoreBoardHeight,
  },
  drawerBoard: {
    height: componentSizes.drawerScoreBoardHeight,
  },
  totalSummaryBoard: {
    height: componentSizes.totalSummaryScoreBoardHeight,
  },
  teamWrapper: {
    flex: 1,
  },
  teamColumn: {
    gap: 4,
  },
  drawerTeamColumn: {
    height: '100%',
  },
  summaryTeamColumn: {
    height: '100%',
  },
  total: {
    minHeight: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalDefault: {
    paddingVertical: 8,
  },
  totalSummary: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 8,
  },
  totalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mene: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  drawerMene: {
    flex: 1,
    height: '100%',
  },
  meneContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalText: {
    ...figmaTextStyles.numberXs40,
    color: gameUiColors.white,
    textAlign: 'center',
  },
  summaryTotalText: {
    ...figmaTextStyles.numberLg100,
    color: gameUiColors.white,
    textAlign: 'center',
  },
  meneText: {
    ...figmaTextStyles.numberLg100,
    color: gameUiColors.white,
    textAlign: 'center',
  },
  modifierText: {
    ...figmaTextStyles.numberXs40,
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    color: gameUiColors.secondary,
    textAlign: 'center',
  },
  modifierBlue: {
    left: 36,
  },
  modifierRed: {
    right: 36,
  },
  badge: {
    position: 'absolute',
    top: -15,
    left: 0,
    right: 0,
    alignSelf: 'center',
    alignItems: 'center',
  },
  totalSummaryBadge: {
    top: 27,
  },
  badgeInner: {
    minWidth: 128,
    borderRadius: radius.pill,
    backgroundColor: gameUiColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 7,
  },
  badgeText: {
    ...figmaTextStyles.labels,
    color: gameUiColors.muted,
    textAlign: 'center',
  },
});
