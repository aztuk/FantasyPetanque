import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Team } from '../../domain/game/models';
import { TEAM_LABELS, colors, typography, radius, opacity } from '../constants';

interface Props {
  team: Team;
  score: number;
  delta?: number;
  showLabel?: boolean;
  actionLabel?: string;
  onPress?: () => void;
  disabled?: boolean;
  square?: boolean;
  testID?: string;
}

export function ScoreBlock({
  team,
  score,
  delta,
  showLabel = true,
  actionLabel,
  onPress,
  disabled = false,
  square = false,
  testID,
}: Props) {
  const bg = colors.team[team];
  const content = (
    <>
      {showLabel && <Text style={styles.label}>{TEAM_LABELS[team]}</Text>}
      <Text style={styles.score}>{score}</Text>
      {delta !== undefined && delta !== 0 && (
        <Text style={styles.delta}>
          {delta > 0 ? `+${delta}` : `${delta}`}
        </Text>
      )}
      {actionLabel && <Text style={styles.actionLabel}>{actionLabel}</Text>}
    </>
  );

  const blockStyle = [
    styles.block,
    square && styles.square,
    { backgroundColor: bg },
    disabled && styles.disabled,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={blockStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
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
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginHorizontal: 4,
    borderRadius: radius.xl,
    minHeight: 130,
    position: 'relative',
  },
  square: {
    aspectRatio: 1,
    minHeight: 156,
    paddingVertical: 16,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  label: {
    color: 'rgba(236,235,232,0.65)', // colors.white à 65% — pas de token Figma pour la variante transparente
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  score: {
    color: colors.white,
    fontSize: typography.size.score,
    fontWeight: typography.weight.extrabold,
    lineHeight: 88,
  },
  delta: {
    position: 'absolute',
    bottom: 16,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.secondary,
  },
  actionLabel: {
    position: 'absolute',
    bottom: 16,
    left: 10,
    right: 10,
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});
