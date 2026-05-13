import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import AnimatedNumber from 'react-native-animated-numbers';
import { Team } from '../../../domain/game/models';
import { textStyles, typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  scores: Record<Team, number>;
  roundPoints?: Record<Team, number>;
  modifierPoints?: Partial<Record<Team, number>>;
  roundNumber?: number;
  badgeLabel?: string;
  badgeTeam?: Team | null;
  compact?: boolean;
  showTotals?: boolean;
  showRoundBar?: boolean;
  onTeamPress?: (team: Team) => void;
  style?: StyleProp<ViewStyle>;
}

const TEAM_UI = {
  blue: {
    surface: gameUiColors.blueSurface,
    text: gameUiColors.blueText,
    testID: 'score-block-blue',
  },
  red: {
    surface: gameUiColors.redSurface,
    text: gameUiColors.redText,
    testID: 'score-block-red',
  },
} as const;

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
  compact = false,
  showTotals = true,
  showRoundBar = true,
  onTeamPress,
  style,
}: Props) {
  const badge = formatBadge(roundNumber, badgeLabel);

  return (
    <View style={[styles.board, showRoundBar ? (compact ? styles.compact : styles.full) : undefined, style]}>
      {(['blue', 'red'] as const).map((team) => {
        const ui = TEAM_UI[team];
        const meneValue = roundPoints ? roundPoints[team] : scores[team];
        const modifierValue = modifierPoints?.[team] ?? 0;

        const content = (
          <View style={styles.teamColumn}>
            {showRoundBar && (
              <View style={[styles.mene, { backgroundColor: ui.surface }]}>
                <AnimatedNumber
                  animateToNumber={meneValue}
                  fontStyle={styles.meneText}
                  animationDuration={300}
                  containerStyle={styles.meneContainer}
                />
                {modifierValue !== 0 && (
                  <Text
                    style={[
                      styles.modifierText,
                      team === 'blue' ? styles.modifierBlue : styles.modifierRed,
                    ]}
                    testID={`score-modifier-${team}`}
                  >
                    {modifierValue > 0 ? `+${modifierValue}` : String(modifierValue)}
                  </Text>
                )}
              </View>
            )}
            {showTotals && (
              <View style={[styles.total, { backgroundColor: ui.surface }]}>
                <AnimatedNumber
                  animateToNumber={scores[team]}
                  fontStyle={styles.totalText}
                  animationDuration={400}
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
              onPress={() => onTeamPress(team)}
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
        <View style={styles.badge}>
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
  full: {
    height: 252,
  },
  compact: {
    height: 198,
  },
  teamWrapper: {
    flex: 1,
  },
  teamColumn: {
    flex: 1,
  },
  total: {
    minHeight: 57,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: gameUiColors.background,
    opacity: 0.92,
  },
  totalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  meneContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalText: {
    ...textStyles.labelMd,
    color: gameUiColors.white,
    textAlign: 'center',
  },
  meneText: {
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 60,
    lineHeight: 102,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  modifierText: {
    ...textStyles.titleLg,
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
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -64 }],
    minWidth: 128,
    borderRadius: 40,
    backgroundColor: gameUiColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 7,
  },
  badgeText: {
    color: gameUiColors.muted,
    fontFamily: typography.family.bodySemibold,
    fontSize: 18,
    lineHeight: 18,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: 0,
  },
});
