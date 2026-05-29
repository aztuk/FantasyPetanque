import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../shared/constants';

interface Props {
  actions?: React.ReactNode;
  scoreBoard?: React.ReactNode;
  confirmButton: React.ReactNode;
  testID?: string;
}

export function GameDrawer({
  actions,
  scoreBoard,
  confirmButton,
  testID,
}: Props) {
  return (
    <View style={styles.drawer} testID={testID}>
      {actions}
      {scoreBoard}
      {confirmButton}
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: '100%',
    gap: spacing[1],
  },
});
