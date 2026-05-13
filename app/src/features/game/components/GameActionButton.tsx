import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { textStyles } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'muted' | 'blue' | 'red';
  style?: ViewStyle;
  testID?: string;
}

export function GameActionButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  testID,
}: Props) {
  const backgroundColor =
    disabled ? gameUiColors.muted :
    variant === 'blue' ? gameUiColors.blueSurface :
    variant === 'red' ? gameUiColors.redSurface :
    variant === 'muted' ? gameUiColors.muted :
    gameUiColors.primary;
  const color = variant === 'blue' || variant === 'red' || variant === 'muted'
    ? gameUiColors.white
    : gameUiColors.background;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <Text style={[styles.label, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 102,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 24,
  },
  label: {
    ...textStyles.titleLg,
    textAlign: 'center',
  },
});
