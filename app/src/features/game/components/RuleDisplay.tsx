import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Rule, Team } from '../../../domain/game/models';
import { TEAM_LABELS, typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  rule: Rule;
  immuneTeam?: Team | null;
  style?: StyleProp<ViewStyle>;
}

function splitDescription(description: string) {
  const trimmed = description.trim();
  const firstEnd = trimmed.indexOf('.');
  if (firstEnd === -1 || firstEnd === trimmed.length - 1) {
    return { main: trimmed, weak: null };
  }

  return {
    main: trimmed.slice(0, firstEnd + 1).trim(),
    weak: trimmed.slice(firstEnd + 1).trim(),
  };
}

export function RuleDisplay({ rule, immuneTeam = null, style }: Props) {
  const { main, weak } = splitDescription(rule.description);

  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.title}>{rule.name}</Text>
      <Text style={styles.description}>{main}</Text>
      {weak && <Text style={styles.weak}>{weak}</Text>}
      {immuneTeam && (
        <Text style={styles.weak}>
          {TEAM_LABELS[immuneTeam]} est immunisé contre cette règle.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 4,
  },
  title: {
    width: '100%',
    color: gameUiColors.primary,
    fontFamily: typography.family.bodySemibold,
    fontSize: 32,
    lineHeight: 54,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  description: {
    width: '100%',
    color: gameUiColors.white,
    fontFamily: typography.family.body,
    fontSize: 25,
    lineHeight: 43,
    fontWeight: typography.weight.regular,
    textAlign: 'center',
    letterSpacing: 0,
  },
  weak: {
    width: '100%',
    color: gameUiColors.muted,
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 31,
    fontWeight: typography.weight.regular,
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 12,
  },
});

