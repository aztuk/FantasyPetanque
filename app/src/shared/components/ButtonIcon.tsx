import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { colors, componentSizes, radius, spacing } from '../constants';

interface ButtonIconProps {
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ButtonIcon({
  onPress,
  accessibilityLabel,
  testID,
  iconColor = colors.textSmooth,
  style,
}: ButtonIconProps) {
  return (
    <Pressable
      style={[styles.button, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <ArrowLeftIcon color={iconColor} size={32} weight="regular" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: componentSizes.iconButton,
    height: componentSizes.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    borderRadius: radius.round,
    backgroundColor: colors.darkSmoother,
  },
});
