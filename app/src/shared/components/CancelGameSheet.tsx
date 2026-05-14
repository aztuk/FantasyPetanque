import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AlertSheet } from './AlertSheet';
import { colors, figmaTextStyles } from '../constants';

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
    ...figmaTextStyles.pageTitles,
    color: colors.white,
    includeFontPadding: false,
    textAlign: 'center',
  },
  message: {
    ...figmaTextStyles.bodyMd,
    color: colors.white,
    includeFontPadding: false,
    textAlign: 'center',
  },
  highlight: {
    color: colors.secondary,
  },
  cancelLabel: {
    ...figmaTextStyles.buttonCTA,
    color: colors.white,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  confirmLabel: {
    ...figmaTextStyles.buttonCTA,
    color: colors.dark,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
