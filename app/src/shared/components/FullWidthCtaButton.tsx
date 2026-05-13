import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, homeTypography, opacity, typography } from '../constants';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function FullWidthCtaButton({
  label,
  onPress,
  disabled = false,
  style,
  testID,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 102,
    paddingHorizontal: 10,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  label: {
    color: colors.brand.dark,
    fontFamily: typography.family.bodySemibold,
    fontWeight: typography.weight.semibold,
    fontSize: homeTypography.button.fontSize,
    lineHeight: homeTypography.button.lineHeight,
    letterSpacing: -1.28,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
