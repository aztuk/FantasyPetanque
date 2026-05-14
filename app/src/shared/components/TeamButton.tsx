import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Team } from '../../domain/game/models';
import { colors, typography, radius } from '../constants';

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
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  small: {
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  label: {
    color: colors.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  smallLabel: {
    fontSize: typography.size.base,
  },
});
