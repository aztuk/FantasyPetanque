import React from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { RoundState } from '../../../domain/game/models';
import { typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  rounds: RoundState[];
  orientation?: 'top' | 'bottom';
  style?: StyleProp<ViewStyle>;
}

function getRoundScore(round: RoundState, rounds: RoundState[]) {
  const fallback = { blue: 0, red: 0 };
  return round.scoreAfter ?? rounds[round.number - 2]?.scoreAfter ?? fallback;
}

function formatRoundNumber(number: number) {
  return `Mène ${String(number).padStart(2, '0')}`;
}

export function GameHistoryItem({ round, rounds }: { round: RoundState; rounds: RoundState[] }) {
  const score = getRoundScore(round, rounds);

  return (
    <View style={styles.item}>
      <Text style={[styles.score, styles.blue]}>{score.blue}</Text>
      <Text style={styles.roundLabel}>{formatRoundNumber(round.number)}</Text>
      <Text style={[styles.score, styles.red]}>{score.red}</Text>
    </View>
  );
}

export function GameHistoryList({ rounds, orientation = 'top', style }: Props) {
  const orderedRounds = orientation === 'bottom' ? rounds.slice(-9) : rounds;
  const contentStyle = [
    styles.content,
    orientation === 'bottom' ? styles.bottomContent : styles.topContent,
  ];

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
    >
      {orderedRounds.map((round) => (
        <GameHistoryItem key={round.number} round={round} rounds={rounds} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
  },
  content: {
    width: '100%',
  },
  topContent: {
    paddingTop: 24,
    paddingBottom: 4,
  },
  bottomContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  item: {
    minHeight: 51,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: gameUiColors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  score: {
    flex: 1,
    fontFamily: typography.family.bodySemibold,
    fontSize: 25,
    lineHeight: 43,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  blue: {
    color: gameUiColors.blueText,
  },
  red: {
    color: gameUiColors.redText,
  },
  roundLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: gameUiColors.muted,
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 31,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
    letterSpacing: 0,
  },
});
