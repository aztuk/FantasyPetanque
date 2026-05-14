import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, componentSizes, figmaTextStyles, spacing } from '../constants';

interface SetupOptionProps {
  title: string;
  description: string;
  onPress: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function SetupOption({
  title,
  description,
  onPress,
  testID,
  style,
}: SetupOptionProps) {
  return (
    <Pressable
      style={[styles.option, style]}
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    width: '100%',
    minHeight: componentSizes.setupOptionHeight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    backgroundColor: colors.darkSmooth,
  },
  title: {
    ...figmaTextStyles.buttonCTA,
    width: '100%',
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  description: {
    ...figmaTextStyles.bodyMd,
    width: '100%',
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
