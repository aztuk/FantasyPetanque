import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Team } from '../../../../domain/game/models';
import { colors, figmaTextStyles, TEAM_COLORS } from '../../../../shared/constants';
import { useGameStore } from '../../state/gameStore';
import type { Props } from './shared';

type Side = 'left' | 'right';

const TEAMS: Team[] = ['blue', 'red'];
const SIDES: Side[] = ['left', 'right'];
const SIDE_LABELS: Record<Side, string> = {
  left: 'Gauche',
  right: 'Droite',
};

const TEAM_SURFACE: Record<Team, string> = {
  blue: TEAM_COLORS.blue,
  red: TEAM_COLORS.red,
};

const TEAM_TEXT: Record<Team, string> = {
  blue: TEAM_COLORS.blueText,
  red: TEAM_COLORS.redText,
};

export function FrontiereSetupUI({ round }: Props) {
  const { setFrontiereChoice } = useGameStore();

  return (
    <View style={styles.choiceGrid} testID="frontiere-choice-grid">
      {SIDES.map((side) => (
        <View key={side} style={styles.choiceRow}>
          {TEAMS.map((team) => {
            const selected = round.frontiereChoice[team] === side;

            return (
              <Pressable
                key={`${team}-${side}`}
                style={[
                  styles.choiceButton,
                  selected && { backgroundColor: TEAM_SURFACE[team] },
                ]}
                onPress={() => setFrontiereChoice(team, side)}
                accessibilityRole="button"
                accessibilityLabel={`${team === 'blue' ? 'Bleu' : 'Rouge'} choisit ${SIDE_LABELS[side].toLowerCase()}`}
                accessibilityState={{ selected }}
                testID={`frontiere-${team}-${side}-button`}
              >
                <Text style={styles.choiceLabel}>{SIDE_LABELS[side]}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function FrontiereReminderUI({ round }: Props) {
  return (
    <View style={styles.reminder} testID="frontiere-reminder">
      {TEAMS.map((team) => (
        <View key={team} style={styles.reminderTeam}>
          <Text style={[styles.reminderChoice, { color: TEAM_TEXT[team] }]}>
            {formatChoice(round.frontiereChoice[team])}
          </Text>
        </View>
      ))}
    </View>
  );
}

function formatChoice(choice: Side | null) {
  if (choice === null) return 'Non choisi';

  return SIDE_LABELS[choice];
}

const styles = StyleSheet.create({
  choiceGrid: {
    width: '100%',
    gap: 4,
  },
  choiceRow: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    gap: 4,
  },
  choiceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.darkSmooth,
  },
  choiceLabel: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  reminder: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
  },
  reminderTeam: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.darkSmooth,
  },
  reminderChoice: {
    ...figmaTextStyles.buttonActions,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
