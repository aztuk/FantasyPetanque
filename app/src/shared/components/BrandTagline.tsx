import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, figmaTextStyles } from '../constants';

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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  line: {
    ...figmaTextStyles.bodyMd,
    color: colors.white,
    textAlign: 'center',
  },
  accent: {
    color: colors.primary,
  },
});
