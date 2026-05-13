import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Team } from '../../../domain/game/models';
import { typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  label: string;
  onTeamPress: (team: Team) => void;
  selectedTeam?: Team | null;
  testIDPrefix?: string;
}

const TEAM_SURFACE: Record<Team, string> = {
  blue: gameUiColors.blueSurface,
  red: gameUiColors.redSurface,
};

export function GameTeamActionRow({
  label,
  onTeamPress,
  selectedTeam = null,
  testIDPrefix,
}: Props) {
  return (
    <View style={styles.row}>
      {(['blue', 'red'] as const).map((team) => {
        const selected = selectedTeam === team;

        return (
          <Pressable
            key={team}
            style={[
              styles.button,
              { backgroundColor: TEAM_SURFACE[team] },
              selected && styles.buttonSelected,
            ]}
            onPress={() => onTeamPress(team)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            testID={testIDPrefix ? `${testIDPrefix}-${team}-button` : undefined}
          >
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: gameUiColors.background,
  },
  button: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  buttonSelected: {
    opacity: 1,
  },
  label: {
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 21,
    lineHeight: 32,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
});
