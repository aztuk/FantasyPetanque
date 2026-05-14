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
    disabled          ? colors.disabled :
    variant === 'secondary' ? colors.darkSmooth :
    variant === 'danger'    ? colors.team.redDark :
    colors.primary;

  const textColor = (!disabled && variant === 'primary') ? colors.dark : colors.white;

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
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

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
