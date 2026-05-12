import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, typography } from '../../../shared/constants';

interface Props {
  onCancel: () => void;
  children?: React.ReactNode;
}

export function GameTopBar({ onCancel, children }: Props) {
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
        <Text style={styles.cancelIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.actions}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelIcon: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    lineHeight: 28,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
});
