import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Team } from '../../domain/game/models';
import { TEAM_COLORS } from '../constants';

interface Props {
  team: Team;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export function TeamButton({ team, label, onPress, disabled, style, small }: Props) {
  const bg = team === 'blue' ? TEAM_COLORS.blue : TEAM_COLORS.red;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: disabled ? '#444' : bg }, small && styles.small, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, small && styles.smallLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  small: {
    paddingVertical: 10,
    borderRadius: 8,
  },
  label: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  smallLabel: {
    fontSize: 14,
  },
});
