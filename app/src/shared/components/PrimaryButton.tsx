import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, radius } from '../constants';

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
    disabled ? colors.surface2 :
    variant === 'secondary' ? colors.surface2 :
    variant === 'danger' ? colors.team.redDark :
    colors.accent;

  const textColor = (!disabled && variant === 'primary') ? colors.background : colors.textPrimary;

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
    paddingVertical: 20,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  label: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
