import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getCasinoMaxBet, CASINO_MIN_BET } from '../../../../domain/game/scoring';
import { Team } from '../../../../domain/game/models';
import { typography } from '../../../../shared/constants';
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

function StakeReadonly({ label, color, value, testID }: { label: string; color: string; value: string; testID?: string }) {
  return (
    <View style={styles.betColumn}>
      <Text style={styles.readonlyValue} testID={testID}>{value}</Text>
      <Text style={[styles.betLabel, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
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
            <StakeReadonly
              key={team}
              label={ui.label}
              color={ui.color}
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
  betColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  betLabel: {
    width: '100%',
    fontFamily: typography.family.bodySemibold,
    fontSize: 21,
    lineHeight: 32,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  resolution: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    marginTop: 28,
  },
  readonlyValue: {
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 40,
    lineHeight: 68,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: 0,
  },
});
