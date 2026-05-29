import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Team } from '../../../../domain/game/models';
import { useGameStore } from '../../state/gameStore';
import { colors, componentSizes, figmaTextStyles } from '../../../../shared/constants';
import { gameUiColors } from '../gameUiTheme';
import { Props } from './shared';

const TEAMS: Team[] = ['blue', 'red'];

const TEAM_COPY: Record<Team, { selectedLabel: string; inactiveLabel: string }> = {
  blue: {
    selectedLabel: 'Bleu assuré',
    inactiveLabel: 'Assurance',
  },
  red: {
    selectedLabel: 'Rouge assuré',
    inactiveLabel: 'Assurance',
  },
};

const TEAM_SURFACE: Record<Team, string> = {
  blue: gameUiColors.blueSurface,
  red: gameUiColors.redSurface,
};

export function AssuranceVieSetupUI({ round }: Props) {
  const toggleAssurance = useGameStore((state) => state.toggleAssurance);

  return (
    <View style={styles.setupRow} testID="assurance-setup-row">
      {TEAMS.map((team) => (
        <AssuranceButton
          key={team}
          team={team}
          selected={round.assurance[team]}
          onPress={() => toggleAssurance(team)}
        />
      ))}
    </View>
  );
}

export function AssuranceVieReminderUI({ round }: Props) {
  return (
    <View style={styles.statusRow} testID="assurance-status-row">
      {TEAMS.map((team) => (
        <AssuranceStatus key={team} team={team} selected={round.assurance[team]} />
      ))}
    </View>
  );
}

function AssuranceButton({
  team,
  selected,
  onPress,
}: {
  team: Team;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.button, styles.setupButton, selected && { backgroundColor: TEAM_SURFACE[team] }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={`assurance-${team}-button`}
    >
      <Text style={styles.label} numberOfLines={1}>
        {selected ? TEAM_COPY[team].selectedLabel : TEAM_COPY[team].inactiveLabel}
      </Text>
    </Pressable>
  );
}

function AssuranceStatus({ team, selected }: { team: Team; selected: boolean }) {
  return (
    <View
      style={[styles.button, styles.statusButton, selected && { backgroundColor: TEAM_SURFACE[team] }]}
      testID={`assurance-${team}-status`}
    >
      <Text style={[styles.label, !selected && styles.inactiveLabel]} numberOfLines={1}>
        {selected ? TEAM_COPY[team].selectedLabel : 'Non assuré'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  setupRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 4,
    marginTop: 'auto',
    marginBottom: 4,
  },
  statusRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 4,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.darkSmooth,
  },
  setupButton: {
    height: 80,
    paddingVertical: 24,
  },
  statusButton: {
    minHeight: componentSizes.drawerActionHeight,
    paddingVertical: 10,
  },
  label: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  inactiveLabel: {
    color: colors.textSmooth,
  },
});
