import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Team } from '../../../domain/game/models';
import { typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  scores: Record<Team, number>;
  roundPoints?: Record<Team, number>;
  roundNumber?: number;
  badgeLabel?: string;
  badgeTeam?: Team | null;
  compact?: boolean;
  showTotals?: boolean;
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
  roundNumber,
  badgeLabel,
  badgeTeam = null,
  compact = false,
  showTotals = true,
  onTeamPress,
  style,
}: Props) {
  const badge = formatBadge(roundNumber, badgeLabel);

  return (
    <View style={[styles.board, compact ? styles.compact : styles.full, style]}>
      {(['blue', 'red'] as const).map((team) => {
        const ui = TEAM_UI[team];
        const content = (
          <View style={styles.teamColumn}>
            {showTotals && (
              <View style={[styles.total, { backgroundColor: ui.surface }]}>
                <Text style={styles.totalText}>{scores[team]}</Text>
              </View>
            )}
            <View style={[styles.mene, { backgroundColor: ui.surface }]}>
              <Text style={styles.meneText}>
                {roundPoints ? roundPoints[team] : scores[team]}
              </Text>
            </View>
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
    justifyContent: 'flex-end',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: gameUiColors.background,
    opacity: 0.92,
  },
  totalText: {
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 25,
    lineHeight: 43,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  mene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

