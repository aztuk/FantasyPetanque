import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Team } from '../../../domain/game/models';
import { typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  label: string | Record<Team, string>;
  onTeamPress: (team: Team) => void;
  onTeamLongPress?: (team: Team) => void;
  selectedTeam?: Team | null;
  activeTeams?: Partial<Record<Team, boolean>>;
  disabledTeams?: Partial<Record<Team, boolean>>;
  testIDPrefix?: string;
}

const TEAM_SURFACE: Record<Team, string> = {
  blue: gameUiColors.blueSurface,
  red: gameUiColors.redSurface,
};

const TEAM_TEXT: Record<Team, string> = {
  blue: gameUiColors.blueText,
  red: gameUiColors.redText,
};

export function GameTeamActionRow({
  label,
  onTeamPress,
  onTeamLongPress,
  selectedTeam = null,
  activeTeams,
  disabledTeams,
  testIDPrefix,
}: Props) {
  return (
    <View style={styles.row}>
      {(['blue', 'red'] as const).map((team) => {
        const selected = selectedTeam === team;
        const active = activeTeams?.[team] ?? selected;
        const disabled = disabledTeams?.[team] ?? false;
        const teamLabel = typeof label === 'string' ? label : label[team];

        return (
          <Pressable
            key={team}
            style={[
              styles.button,
              { backgroundColor: TEAM_SURFACE[team] },
              active && styles.buttonActive,
              selected && styles.buttonSelected,
              disabled && styles.buttonDisabled,
            ]}
            onPress={() => onTeamPress(team)}
            onLongPress={onTeamLongPress ? () => onTeamLongPress(team) : undefined}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            testID={testIDPrefix ? `${testIDPrefix}-${team}-button` : undefined}
          >
            <Text style={[styles.label, active && { color: TEAM_TEXT[team] }]} numberOfLines={2}>
              {teamLabel}
            </Text>
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
  buttonActive: {
    backgroundColor: gameUiColors.divider,
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.55,
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
