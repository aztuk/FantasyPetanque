import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { AppHeader } from '../../../shared/components/AppHeader';
import { gameUiColors } from './gameUiTheme';

interface Props {
  onCancel: () => void;
  title?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  floating?: boolean;
}

export function GameTopBar({ onCancel, title, children, style, floating = false }: Props) {
  return (
    <AppHeader
      onBack={onCancel}
      title={title}
      backgroundColor={gameUiColors.background}
      floating={floating}
      iconColor={gameUiColors.muted}
      textColor={gameUiColors.white}
      backAccessibilityLabel="Annuler la partie"
      backButtonTestID="cancel-game-button"
      actionsStyle={styles.actions}
      style={style}
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
