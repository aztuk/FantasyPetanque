import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, componentSizes, figmaTextStyles, spacing } from '../constants';

type SetupOptionVariant = 'default' | 'primary' | 'fantasy';

interface SetupOptionProps {
  title: string;
  description: string;
  onPress: () => void;
  variant?: SetupOptionVariant;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function SetupOption({
  title,
  description,
  onPress,
  variant = 'default',
  testID,
  style,
}: SetupOptionProps) {
  const isEmphasis = variant === 'primary' || variant === 'fantasy';
  const isFantasy = variant === 'fantasy';

  return (
    <Pressable
      style={[
        styles.option,
        isEmphasis ? styles.primaryOption : styles.defaultOption,
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
    >
      {isFantasy ? (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <Text style={[styles.title, isEmphasis && styles.emphasisText]}>{title}</Text>
      <Text style={[styles.description, isEmphasis && styles.emphasisText]}>
        {description}
      </Text>
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
    overflow: 'hidden',
  },
  defaultOption: {
    backgroundColor: colors.darkSmooth,
  },
  primaryOption: {
    backgroundColor: colors.primary,
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
  emphasisText: {
    color: colors.dark,
  },
});
