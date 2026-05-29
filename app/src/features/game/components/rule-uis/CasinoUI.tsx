import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getCasinoMaxBet, CASINO_MIN_BET } from '../../../../domain/game/scoring';
import { Team } from '../../../../domain/game/models';
import { ReadonlyValue } from '../../../../shared/components/ReadonlyValue';
import { useGameStore } from '../../state/gameStore';
import { gameUiColors } from '../gameUiTheme';
import { Props } from './shared';
import { TeamStepper } from './TeamStepper';

const TEAMS: Team[] = ['blue', 'red'];

const TEAM_COPY = {
  blue: {
    label: 'Mise bleue',
    stepperTestID: 'casino-bet-blue',
    readonlyTestID: 'casino-bet-blue-readonly',
    color: gameUiColors.blueText,
  },
  red: {
    label: 'Mise rouge',
    stepperTestID: 'casino-bet-red',
    readonlyTestID: 'casino-bet-red-readonly',
    color: gameUiColors.redText,
  },
} as const;

export function CasinoSetupUI({ round }: Props) {
  const scores = useGameStore((state) => state.scores);
  const setCasinoBet = useGameStore((state) => state.setCasinoBet);

  return (
    <View style={styles.betRow}>
      {TEAMS.map((team) => {
        const ui = TEAM_COPY[team];
        const max = getCasinoMaxBet(team, scores);

        return (
          <TeamStepper
            key={team}
            team={team}
            value={round.casinoBets[team]}
            onChange={(value) => setCasinoBet(team, value)}
            min={CASINO_MIN_BET}
            max={max}
            label={ui.label}
            testID={ui.stepperTestID}
          />
        );
      })}
    </View>
  );
}

export function CasinoResolutionUI({ round }: Props) {
  return (
    <View style={styles.resolution}>
      <View style={styles.betRow}>
        {TEAMS.map((team) => {
          const ui = TEAM_COPY[team];

          return (
            <ReadonlyValue
              key={team}
              label={ui.label}
              labelColor={ui.color}
              value={String(round.casinoBets[team])}
              testID={ui.readonlyTestID}
            />
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  betRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 24,
  },
  resolution: {
    width: '100%',
    justifyContent: 'flex-start',
    marginTop: 28,
  },
});
