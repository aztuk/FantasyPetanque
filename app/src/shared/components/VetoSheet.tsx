import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AlertSheet } from './AlertSheet';
import { colors, figmaTextStyles } from '../constants';
import { Team } from '../../domain/game/models';

interface Props {
  visible: boolean;
  team: Team | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VetoSheet({ visible, team, onConfirm, onCancel }: Props) {
  const teamLabel = team === 'blue' ? 'Bleu' : 'Rouge';

  return (
    <AlertSheet
      visible={visible}
      onConfirm={onConfirm}
      onCancel={onCancel}
      cancelLabel={<Text style={styles.cancelLabel}>ANNULER</Text>}
      confirmLabel={<Text style={styles.confirmLabel}>VÉTO</Text>}
      testID="veto-sheet"
    >
      <Text style={styles.title}>Utiliser votre véto ?</Text>
      <Text style={styles.message}>
        {teamLabel}
        {' utilise son véto. La règle sera retirée et '}
        <Text style={styles.highlight}>une nouvelle règle sera tirée.</Text>
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
