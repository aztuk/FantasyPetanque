import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, componentSizes, figmaTextStyles } from '../constants';

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
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
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
    backgroundColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
  label: {
    ...figmaTextStyles.buttonCTA,
    color: colors.dark,
    includeFontPadding: false,
    textAlign: 'center',
  },
  disabledLabel: {
    color: colors.textSmooth,
  },
});
