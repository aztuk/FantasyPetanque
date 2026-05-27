import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, componentSizes, figmaTextStyles } from '../constants';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'default' | 'secondary';
  style?: ViewStyle;
  testID?: string;
}

export function FullWidthCtaButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  testID,
}: Props) {
  const backgroundColor =
    disabled ? colors.disabled :
    variant === 'default' ? colors.darkSmooth :
    variant === 'secondary' ? colors.secondary :
    colors.primary;

  const textColor =
    disabled ? colors.textSmooth :
    variant === 'primary' || variant === 'secondary' ? colors.dark :
    colors.white;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: componentSizes.buttonHeight,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...figmaTextStyles.buttonCTA,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
