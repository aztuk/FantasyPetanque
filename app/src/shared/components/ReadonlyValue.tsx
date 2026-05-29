import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, figmaTextStyles } from '../constants';

interface ReadonlyValueProps {
  value: string;
  label: string;
  labelColor: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function ReadonlyValue({
  value,
  label,
  labelColor,
  testID,
  style,
}: ReadonlyValueProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.value} testID={testID}>
        {value}
      </Text>
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...figmaTextStyles.numberMd80,
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  label: {
    ...figmaTextStyles.labels,
    width: '100%',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
