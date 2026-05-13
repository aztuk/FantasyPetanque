import React from 'react';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, homeTypography } from '../constants';

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
    color: colors.brand.white,
    fontFamily: Platform.OS === 'ios' ? 'GoogleSansFlex_400Regular' : undefined,
    fontSize: homeTypography.tagline.fontSize,
    lineHeight: homeTypography.tagline.lineHeight,
    letterSpacing: -0.96,
    textAlign: 'center',
  },
  accent: {
    color: colors.brand.primary,
  },
});
