import React from 'react';
import { StyleSheet } from 'react-native';
import { AppHeader } from '../../../shared/components/AppHeader';
import { gameUiColors } from './gameUiTheme';

interface Props {
  onCancel: () => void;
  title?: string;
  children?: React.ReactNode;
}

export function GameTopBar({ onCancel, title, children }: Props) {
  return (
    <AppHeader
      onBack={onCancel}
      title={title}
      backgroundColor={gameUiColors.background}
      iconColor={gameUiColors.muted}
      textColor={gameUiColors.white}
      backAccessibilityLabel="Annuler la partie"
      backButtonTestID="cancel-game-button"
      actionsStyle={styles.actions}
    >
      {children}
    </AppHeader>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 4,
    paddingRight: 24,
  },
});
