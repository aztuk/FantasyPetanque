import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, textStyles } from '../constants';

interface Props {
  style?: ViewStyle;
  testID?: string;
}

export function BrandTagline({ style, testID }: Props) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.line}>Le jeu qui vous fera perdre</Text>
      <Text style={[styles.line, styles.accent]}>toute dignité</Text>
    </View>
  );
}
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  line: {
    ...textStyles.tagline,
    color: colors.white,
    textAlign: 'center',
  },
  accent: {
    color: colors.primary,
  },
});
