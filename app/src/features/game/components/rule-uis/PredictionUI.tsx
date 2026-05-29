import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Team } from '../../../../domain/game/models';
import { ReadonlyValue } from '../../../../shared/components/ReadonlyValue';
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
          <ReadonlyValue
            key={team}
            value={String(value ?? '—')}
            label="Prédiction"
            labelColor={color}
            testID={`prediction-readonly-${team}`}
          />
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
});
