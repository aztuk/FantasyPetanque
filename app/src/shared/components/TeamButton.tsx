import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Team } from '../../domain/game/models';
import { colors, figmaTextStyles, radius, spacing } from '../constants';

interface Props {
  team: Team;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export function TeamButton({ team, label, onPress, disabled, style, small }: Props) {
  const bg = disabled ? colors.disabled : colors.team[team];

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, small && styles.small, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, small && styles.smallLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing[1],
  },
  small: {
    paddingVertical: spacing[4],
    borderRadius: radius.md,
  },
  label: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  smallLabel: {
    ...figmaTextStyles.labels,
  },
});
