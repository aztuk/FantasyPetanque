import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../../shared/constants';
import { RuleDisplay } from '../RuleDisplay';
import { Props } from './shared';

export function TotemUI({ round }: Props) {
  if (!round.totemNextRule) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <RuleDisplay
        rule={round.totemNextRule}
        variant="compact"
        testID="totem-next-rule-card"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginTop: spacing[6],
    paddingHorizontal: spacing[6],
  },
});
