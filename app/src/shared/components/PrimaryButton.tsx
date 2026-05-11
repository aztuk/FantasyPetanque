import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function PrimaryButton({ label, onPress, disabled, style, variant = 'primary' }: Props) {
  const bg =
    disabled ? '#444' :
    variant === 'secondary' ? '#333' :
    variant === 'danger' ? '#A02020' :
    '#F5C518';

  const textColor = variant === 'primary' ? '#121212' : '#FFF';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
