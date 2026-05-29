import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, componentSizes, figmaTextStyles } from '../constants';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'danger';
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
  variant = 'primary',
  testID,
}: Props) {
  const bg =
    disabled          ? colors.disabled :
    variant === 'secondary' ? colors.darkSmooth :
    variant === 'danger'    ? colors.team.redDark :
    colors.primary;

  const textColor =
    disabled ? colors.textSmooth :
    variant === 'primary' ? colors.dark :
    colors.white;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: {
    minHeight: componentSizes.buttonHeight,
    paddingHorizontal: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...figmaTextStyles.buttonCTA,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
