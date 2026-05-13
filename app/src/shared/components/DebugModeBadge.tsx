import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors, textStyles } from '../constants';

interface Props {
  style?: TextStyle;
  testID?: string;
}

export function DebugModeBadge({ style, testID }: Props) {
  return (
    <Text style={[styles.badge, style]} testID={testID}>
      <Text>Debug </Text>
      <Text style={styles.accent}>MODE</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    ...textStyles.displaySm,
    color: colors.brand.secondary,
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    textTransform: 'uppercase',
  },
  accent: {
    color: colors.brand.primary,
  },
});
