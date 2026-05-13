import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Team } from '../../../../domain/game/models';
import { typography } from '../../../../shared/constants';
import { useGameStore } from '../../state/gameStore';
import { gameUiColors } from '../gameUiTheme';
import { Props } from './shared';
import { TeamStepper } from './TeamStepper';

const TEAMS: Team[] = ['blue', 'red'];

const TEAM_TEXT: Record<Team, string> = {
  blue: gameUiColors.blueText,
  red: gameUiColors.redText,
};

const PREDICTION_MIN = 1;
const PREDICTION_MAX = 6;

export function PredictionSetupUI({ round }: Props) {
  const setPrediction = useGameStore((state) => state.setPrediction);

  return (
    <View style={styles.row}>
      {TEAMS.map((team) => (
        <TeamStepper
          key={team}
          team={team}
          value={round.predictionValues[team] ?? 0}
          onChange={(value) => setPrediction(team, value === 0 ? null : value)}
          min={0}
          max={PREDICTION_MAX}
          label="Prédiction"
          testID={`prediction-setup-${team}`}
        />
      ))}
    </View>
  );
}

export function PredictionUI({ round }: Props) {
  return (
    <View style={styles.row}>
      {TEAMS.map((team) => {
        const value = round.predictionValues[team];
        const color = TEAM_TEXT[team];

        return (
          <View key={team} style={styles.readonlyColumn}>
            <Text style={styles.readonlyValue} testID={`prediction-readonly-${team}`}>
              {value ?? '—'}
            </Text>
            <Text style={[styles.readonlyLabel, { color }]}>Prédiction</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 24,
  },
  readonlyColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readonlyValue: {
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 40,
    lineHeight: 68,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  readonlyLabel: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 21,
    lineHeight: 32,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
});
