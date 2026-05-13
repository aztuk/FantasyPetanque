import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AlertSheet } from './AlertSheet';
import { colors, homeTypography, typography } from '../constants';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelGameSheet({ visible, onConfirm, onCancel }: Props) {
  return (
    <AlertSheet
      visible={visible}
      onConfirm={onConfirm}
      onCancel={onCancel}
      cancelLabel={<Text style={styles.cancelLabel}>NON</Text>}
      confirmLabel={<Text style={styles.confirmLabel}>OUI</Text>}
    >
      <Text style={styles.title}>Etes-vous sûr ?</Text>
      <Text style={styles.message}>
        {'Si vous décidez de quitter maintenant, la partie '}
        <Text style={styles.highlight}>sera perdue</Text>
        {' et le score aussi.'}
      </Text>
    </AlertSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.brand.white,
    fontFamily: typography.family.body,
    fontWeight: typography.weight.bold,
    fontSize: homeTypography.button.fontSize,
    lineHeight: homeTypography.button.lineHeight,
    letterSpacing: -1.28,
    includeFontPadding: false,
    textAlign: 'center',
  },
  message: {
    color: colors.brand.white,
    fontFamily: typography.family.body,
    fontWeight: typography.weight.regular,
    fontSize: 25,
    lineHeight: 42,
    letterSpacing: -1,
    includeFontPadding: false,
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  highlight: {
    color: colors.brand.secondary,
    fontFamily: typography.family.body,
    fontWeight: typography.weight.bold,
  },
  cancelLabel: {
    color: colors.brand.white,
    fontFamily: typography.family.bodySemibold,
    fontWeight: typography.weight.semibold,
    fontSize: homeTypography.button.fontSize,
    lineHeight: homeTypography.button.lineHeight,
    letterSpacing: -1.28,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  confirmLabel: {
    color: colors.brand.dark,
    fontFamily: typography.family.bodySemibold,
    fontWeight: typography.weight.semibold,
    fontSize: homeTypography.button.fontSize,
    lineHeight: homeTypography.button.lineHeight,
    letterSpacing: -1.28,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
