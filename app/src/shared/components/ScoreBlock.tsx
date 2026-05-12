import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Team } from '../../domain/game/models';
import { TEAM_COLORS, TEAM_LABELS } from '../constants';

interface Props {
  team: Team;
  score: number;
  delta?: number;
  showLabel?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export function ScoreBlock({
  team,
  score,
  delta,
  showLabel = true,
  onPress,
  disabled = false,
  testID,
}: Props) {
  const bg = team === 'blue' ? TEAM_COLORS.blue : TEAM_COLORS.red;
  const content = (
    <>
      {showLabel && <Text style={styles.label}>{TEAM_LABELS[team]}</Text>}
      <Text style={styles.score}>{score}</Text>
      {delta !== undefined && delta !== 0 && (
        <Text style={[styles.delta, delta > 0 ? styles.pos : styles.neg]}>
          {delta > 0 ? `+${delta}` : `${delta}`}
        </Text>
      )}
    </>
  );

  const blockStyle = [
    styles.block,
    { backgroundColor: bg },
    disabled && styles.disabled,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={blockStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${TEAM_LABELS[team]} score ${score}`}
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={blockStyle} testID={testID}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    minHeight: 100,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
  },
  delta: {
    fontSize: 20,
    fontWeight: '700',
  },
  pos: { color: '#AEFFAE' },
  neg: { color: '#FFAEAE' },
});
