import React from 'react';
import { Image, ImageStyle, StyleSheet } from 'react-native';

const logo = require('../../../assets/logo.png');

interface Props {
  style?: ImageStyle;
  testID?: string;
}

export function BrandLogo({ style, testID }: Props) {
  return (
    <Image
      source={logo}
      style={[styles.logo, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      testID={testID}
    />
  );
}
const styles = StyleSheet.create({
  logo: {
    width: 298,
    height: 220,
  },
});
