import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  onCancel: () => void;
  title?: string;
  children?: React.ReactNode;
}

export function GameTopBar({ onCancel, title, children }: Props) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Annuler la partie"
        testID="cancel-game-button"
      >
        <Text style={styles.cancelIcon}>{'<'}</Text>
      </TouchableOpacity>

      {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.actions}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 80,
    paddingRight: 24,
    backgroundColor: gameUiColors.background,
  },
  cancelButton: {
    width: 80,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelIcon: {
    color: gameUiColors.muted,
    fontSize: 40,
    fontWeight: typography.weight.regular,
    lineHeight: 48,
  },
  title: {
    flex: 1,
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 32,
    lineHeight: 54,
    fontWeight: typography.weight.bold,
    letterSpacing: 0,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
});
