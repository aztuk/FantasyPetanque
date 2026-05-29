import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Team } from '../../../domain/game/models';
import { componentSizes, figmaTextStyles } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  label: string | Record<Team, string>;
  onTeamPress: (team: Team) => void;
  onTeamLongPress?: (team: Team) => void;
  selectedTeam?: Team | null;
  unselectedLabelWhenSelected?: string;
  teamColorOnlyWhenSelected?: boolean;
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
  unselectedLabelWhenSelected,
  teamColorOnlyWhenSelected = false,
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
        const baseLabel = typeof label === 'string' ? label : label[team];
        const teamLabel = selectedTeam !== null && !selected && unselectedLabelWhenSelected
          ? unselectedLabelWhenSelected
          : baseLabel;
        const backgroundColor = teamColorOnlyWhenSelected
          ? (selected ? TEAM_SURFACE[team] : gameUiColors.divider)
          : TEAM_SURFACE[team];

        return (
          <Pressable
            key={team}
            style={[
              styles.button,
              { backgroundColor },
              active && !teamColorOnlyWhenSelected && styles.buttonActive,
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
            <Text
              style={[styles.label, active && !teamColorOnlyWhenSelected && { color: TEAM_TEXT[team] }]}
              numberOfLines={2}
            >
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
    minHeight: componentSizes.drawerActionHeight,
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
    ...figmaTextStyles.buttonActions,
    color: gameUiColors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
