import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AlertSheet } from './AlertSheet';
import { colors, textStyles, typography } from '../constants';

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
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  title: {
    ...textStyles.ctaLabel,
    color: colors.white,
    fontFamily: typography.family.body,
    fontWeight: typography.weight.bold,
    includeFontPadding: false,
    textAlign: 'center',
  },
  message: {
    ...textStyles.bodyMd,
    color: colors.white,
    includeFontPadding: false,
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  highlight: {
    color: colors.secondary,
    fontFamily: typography.family.body,
    fontWeight: typography.weight.bold,
  },
  cancelLabel: {
    ...textStyles.titleLg,
    color: colors.white,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  confirmLabel: {
    ...textStyles.titleLg,
    color: colors.dark,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
